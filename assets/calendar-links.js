/* Calendar composer links: no accounts, credentials, downloads, or server APIs. */
function calendarChoices(input, now = new Date()) {
  const parse = text => {if(!/^\d{4}-\d{2}-\d{2}$/.test(text||''))throw new Error('Choose valid journey dates.');const [y,m,d]=text.split('-').map(Number);const date=new Date(y,m-1,d);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)throw new Error('Choose valid journey dates.');return date;};
  const start=parse(input.started),end=parse(input.ends);end.setHours(23,59,59,0);
  if(end<start)throw new Error('Your journey end must follow its start.');
  if(end<now)throw new Error('Your journey has ended. Revise your plan’s timeframe before adding future events.');
  const items=input.meals.map((meal,i)=>({key:'meal-'+i,title:'2DAY · '+meal.name,start:meal.start,duration:meal.end-meal.start,days:null,description:'Your 2DAY meal window. Open 2DAY for your current meal and any swaps.'}));
  if(input.fitness?.enabled){const f=input.fitness;if(!Array.isArray(f.days)||!f.days.length||f.days.some(d=>!Number.isInteger(d)||d<0||d>6))throw new Error('Choose at least one fitness day.');items.push({key:'fitness',title:'2DAY · Movement / strength',start:f.start,duration:f.duration,days:[...new Set(f.days)].sort(),description:'Your chosen fitness reminder. Adjust the activity to your needs.'});}
  const compact=date=>`${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}${String(date.getMinutes()).padStart(2,'0')}00`;
  const dayNames=['SU','MO','TU','WE','TH','FR','SA'];
  return items.map(item=>{
    if(!Number.isInteger(item.start)||!Number.isInteger(item.duration)||item.start<0||item.duration<1||item.start+item.duration>=1440)throw new Error('Choose a valid event time ending before midnight.');
    const date=new Date(Math.max(start.getTime(),new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime()));date.setHours(Math.floor(item.start/60),item.start%60,0,0);
    for(let count=0;(date<now||(item.days&&!item.days.includes(date.getDay())))&&count<8;count++)date.setDate(date.getDate()+1);
    if(date>end)return null;
    const finish=new Date(date.getTime()+item.duration*60000),until=end.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const recurrence='RRULE:FREQ='+(item.days?'WEEKLY;BYDAY='+item.days.map(d=>dayNames[d]).join(','):'DAILY')+';UNTIL='+until;
    return {...item,date,finish,until:end,dates:compact(date)+'/'+compact(finish),recurrence};
  }).filter(Boolean);
}
function calendarComposer(event, provider, timeZone) {
  const description=event.description+'\nThis is an editable calendar event, not a live connection. Later 2DAY changes do not update it automatically.';
  if(provider==='google'){
    const url=new URL('https://calendar.google.com/calendar/render');url.search=new URLSearchParams({action:'TEMPLATE',text:event.title,dates:event.dates,ctz:timeZone,details:description,recur:event.recurrence}).toString();return url.href;
  }
  if(!['outlook','office'].includes(provider))throw new Error('Choose a supported calendar.');
  const url=new URL(provider==='office'?'https://outlook.office.com/calendar/0/deeplink/compose':'https://outlook.live.com/calendar/0/deeplink/compose');
  url.search=new URLSearchParams({path:'/calendar/action/compose',rru:'addevent',subject:event.title,startdt:event.date.toISOString(),enddt:event.finish.toISOString(),body:description+'\nSet Repeat in Outlook before saving: '+(event.days?'weekly on '+event.days.map(d=>['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d]).join(', '):'daily')+' through '+event.until.toLocaleDateString()+'.'}).toString();return url.href;
}
