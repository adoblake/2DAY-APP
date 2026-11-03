import {createHash} from 'node:crypto';
export const tokenKey=token=>createHash('sha256').update(token).digest('hex');
export const validToken=token=>/^[a-f0-9]{64}$/.test(token||'');
export function calendarPlan(input){
 const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
 if(!validDate(input.started)||!validDate(input.ends)||input.ends<input.started||Date.parse(input.ends)-Date.parse(input.started)>366*86400000)throw new Error('Choose valid journey dates within one year.');
 if(typeof input.timeZone!=='string'||input.timeZone.length>100)throw new Error('Timezone required');
 new Intl.DateTimeFormat('en',{timeZone:input.timeZone}).format();
 return {started:input.started,ends:input.ends,timeZone:input.timeZone};
}
const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
export function calendarFeed(plan,id){
 // Expand dates instead of TZID recurrence: each event is converted using the
 // IANA zone for that date, preserving meal wall times across daylight saving.
 function utc(date,hour,minute){
  const [y,m,d]=date.split('-').map(Number);let value=Date.UTC(y,m-1,d,hour,minute);
  const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:plan.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  for(let i=0;i<3;i++){const parts=Object.fromEntries(formatter.formatToParts(new Date(value)).map(p=>[p.type,p.value]));const represented=Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second);value+=Date.UTC(y,m-1,d,hour,minute)-represented;}
  return stamp(new Date(value));
 }
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//2DAY//Meal Windows//EN','CALSCALE:GREGORIAN','X-WR-CALNAME:2DAY Meal Windows','REFRESH-INTERVAL;VALUE=DURATION:PT6H','X-PUBLISHED-TTL:PT6H'];
 const meals=[['morning','Morning fuel',7,30,10,0],['midday','Midday fuel',12,0,14,30],['night','Night fuel',17,30,20,0]];
 for(let date=new Date(plan.started+'T12:00:00Z');date.toISOString().slice(0,10)<=plan.ends;date.setUTCDate(date.getUTCDate()+1)){
  const day=date.toISOString().slice(0,10);
  for(const [key,label,sh,sm,eh,em] of meals)lines.push('BEGIN:VEVENT',`UID:${id.slice(0,16)}-${day}-${key}@2day`,`DTSTAMP:${stamp(new Date(plan.updatedAt))}`,`DTSTART:${utc(day,sh,sm)}`,`DTEND:${utc(day,eh,em)}`,`SUMMARY:2DAY - ${label}`,'DESCRIPTION:Your meal window. Open 2DAY for your current meal plan.','END:VEVENT');
 }
 return lines.concat('END:VCALENDAR','').join('\r\n');
}
