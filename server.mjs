import http from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dataFile = process.env.DATA_FILE || join(root, '.plate-data.json');
const port = Number(process.env.PORT || 4173);
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let db = { profiles: {} };
try { db = JSON.parse(await readFile(dataFile, 'utf8')); } catch {}
const save = () => writeFile(dataFile, JSON.stringify(db, null, 2));

function json(res, status, body){res.writeHead(status, {'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body))}
async function body(req){let raw='';for await (const c of req){raw+=c;if(raw.length>1e6)throw new Error('too large')}return raw?JSON.parse(raw):{}}
function cleanPhone(v=''){return String(v).replace(/[^\d+]/g,'')}
function validEmail(v=''){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function validPhone(v=''){let n=cleanPhone(v).replace(/^\+/,'');return n.length>=10&&n.length<=15}

async function sendSms(to, message){
  const sid=process.env.TWILIO_ACCOUNT_SID, token=process.env.TWILIO_AUTH_TOKEN, from=process.env.TWILIO_FROM_NUMBER;
  if(!sid||!token||!from) return {sent:false,reason:'SMS provider not configured'};
  const form=new URLSearchParams({To:cleanPhone(to),From:from,Body:message});
  const r=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{method:'POST',headers:{Authorization:'Basic '+Buffer.from(`${sid}:${token}`).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:form});
  if(!r.ok) throw new Error(`Twilio ${r.status}: ${await r.text()}`);
  return {sent:true};
}
async function sendEmail(to, subject, text){
  const key=process.env.RESEND_API_KEY, from=process.env.EMAIL_FROM;
  if(!key||!from) return {sent:false,reason:'Email provider not configured'};
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject,text})});
  if(!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
  return {sent:true};
}

function localParts(timeZone){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone,weekday:'long',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
  return Object.fromEntries(parts.map(x=>[x.type,x.value]));
}
const MEALS=[{id:'morning',label:'MORNING FUEL',name:'PROTEIN START',start:450,end:600,next:'Midday is next.'},{id:'midday',label:'MIDDAY FUEL',name:'CHICKEN POWER BOWL',start:720,end:870,next:'Night fuel is next.'},{id:'night',label:'NIGHT FUEL',name:'STRONG FINISH',start:1050,end:1200,next:'That closes the food plan for today.'}];
function focusAt(hour,minute){let m=Number(hour)*60+Number(minute);let x=MEALS.find(v=>m>=v.start&&m<v.end);return x||null}
function nearMinute(now,target,window=4){return now>=target&&now<target+window}
async function tick(){
  let changed=false;
  for(const p of Object.values(db.profiles)){
    let parts;
    try { parts=localParts(p.timeZone||'America/Phoenix'); } catch { continue; }
    const hour=Number(parts.hour)%24, minute=Number(parts.minute), nowMin=hour*60+minute;
    const date=new Intl.DateTimeFormat('en-CA',{timeZone:p.timeZone||'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const focus=focusAt(hour,minute);
    if(p.smsEnabled&&validPhone(p.phone)&&focus&&nearMinute(nowMin,focus.start)){
      const key=`sms:${date}:${focus.id}:start`;
      if(!p.sent?.[key]){try{const result=await sendSms(p.phone,`2DAY: ${focus.label}. Your current focus is ${focus.name}. Open 2DAY and follow the meal.`);if(!result.sent)continue;p.sent??={};p.sent[key]=Date.now();changed=true}catch(e){console.error(e.message)}}
    }
    if(p.progressSmsEnabled&&validPhone(p.phone)){
      const delay=Math.min(2,Math.max(1,Number(p.progressDelayHours||1)))*60;
      for(const meal of MEALS){
        const target=meal.end+delay;
        if(!nearMinute(nowMin,target))continue;
        const key=`sms:${date}:${meal.id}:progress:${delay}`;
        if(p.sent?.[key])continue;
        const done=!!p.progress?.days?.[date]?.done?.[meal.id];
        const message=done
          ? `2DAY: ${meal.label} — DONE. That counts. You showed up for the plan today. ${meal.next}`
          : `2DAY check-in: ${meal.label} is not marked complete yet. No guilt. If you ate it, mark it done. If you missed it, the next meal is your reset.`;
        try{const result=await sendSms(p.phone,message);if(!result.sent)continue;p.sent??={};p.sent[key]=Date.now();changed=true}catch(e){console.error(e.message)}
      }
    }
    if(p.emailEnabled&&validEmail(p.email)&&parts.weekday===p.weeklyDay&&nearMinute(nowMin,540)){
      const key=`email:${date}`;
      if(!p.sent?.[key]){try{const result=await sendEmail(p.email,'Your 2DAY weekly progress',p.progress?.weekMessage||'Open 2DAY to see your weekly progress.');if(!result.sent)continue;p.sent??={};p.sent[key]=Date.now();changed=true}catch(e){console.error(e.message)}}
    }
  }
  if(changed)await save();
}
let ticking=false;
async function runTick(){if(ticking)return;ticking=true;try{await tick()}catch{console.error('Notification scheduler failed')}finally{ticking=false}}
setInterval(runTick,60000);runTick();

const publicFiles=new Set(['/index.html','/sw.js','/manifest.webmanifest','/assets/home-source.svg','/assets/day-source.svg']);
const mime={'.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
  try{
    if(req.method==='GET'&&req.url==='/api/status')return json(res,200,{server:true,sms:!!(process.env.TWILIO_ACCOUNT_SID&&process.env.TWILIO_AUTH_TOKEN&&process.env.TWILIO_FROM_NUMBER),email:!!(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM)});
    if(req.method==='POST'&&req.url==='/api/register'){
      const x=await body(req);if(!x.journeyId)return json(res,400,{error:'journeyId required'});
      db.profiles[x.journeyId]={...(db.profiles[x.journeyId]||{}),...x,phone:cleanPhone(x.phone),updatedAt:Date.now()};await save();return json(res,200,{ok:true});
    }
    if(req.method==='POST'&&req.url==='/api/progress'){
      const x=await body(req);if(!x.journeyId)return json(res,400,{error:'journeyId required'});db.profiles[x.journeyId]??={journeyId:x.journeyId};db.profiles[x.journeyId].progress=x;db.profiles[x.journeyId].updatedAt=Date.now();await save();return json(res,200,{ok:true});
    }
    if(req.method==='POST'&&req.url==='/api/test-sms'){
      const x=await body(req);if(!validPhone(x.phone))return json(res,400,{error:'valid phone required'});return json(res,200,await sendSms(x.phone,x.message||'2DAY test message'));
    }
    if(req.method==='POST'&&req.url==='/api/test-email'){
      const x=await body(req);if(!validEmail(x.email))return json(res,400,{error:'valid email required'});return json(res,200,await sendEmail(x.email,'2DAY test email',x.message||'Your 2DAY email delivery is connected.'));
    }
    const url=new URL(req.url,'http://localhost');let pathname=decodeURIComponent(url.pathname);if(pathname==='/')pathname='/index.html';if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'method not allowed'});if(!publicFiles.has(pathname))return json(res,404,{error:'not found'});const file=join(root,pathname);await stat(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:await readFile(file));
  }catch(e){if(e.code==='ENOENT'){res.writeHead(404);res.end('Not found')}else{console.error(e);json(res,500,{error:'server error'})}}
});
server.listen(port,()=>console.log(`2DAY running at http://localhost:${server.address().port}`));
