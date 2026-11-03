import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({URL,URLSearchParams,Date});
vm.runInContext(await readFile(new URL('../assets/calendar-links.js',import.meta.url),'utf8'),context);
const input={started:'2026-11-02',ends:'2026-11-30',meals:[{name:'Breakfast & fruit',start:450,end:600},{name:'Lunch',start:720,end:870},{name:'Dinner',start:1050,end:1200}],fitness:{enabled:true,days:[1,4],start:1080,duration:30}};
test('Google links prefill recurring meals, weekly fitness and a bounded end date',()=>{
 const events=context.calendarChoices(input,new Date(2026,10,3,11));assert.equal(events.length,4);assert.equal(events[0].date.getDate(),4);assert.equal(events[3].date.getDay(),4);
 const url=new URL(context.calendarComposer(events[0],'google','America/Phoenix'));assert.equal(url.origin,'https://calendar.google.com');assert.equal(url.searchParams.get('text'),'2DAY · Breakfast & fruit');assert.match(url.searchParams.get('recur'),/^RRULE:FREQ=DAILY;UNTIL=/);assert.equal(url.searchParams.get('ctz'),'America/Phoenix');
 const fitness=new URL(context.calendarComposer(events[3],'google','America/Phoenix'));assert.match(fitness.searchParams.get('recur'),/WEEKLY;BYDAY=MO,TH;UNTIL=/);
});
test('Outlook links prefill a first event and explicitly require repeat setup',()=>{
 const event=context.calendarChoices(input,new Date(2026,10,3,11))[3];for(const provider of ['outlook','office']){const url=new URL(context.calendarComposer(event,provider,'America/Phoenix'));assert.equal(url.hostname,provider==='office'?'outlook.office.com':'outlook.live.com');assert.ok(url.searchParams.get('startdt'));assert.match(url.searchParams.get('body'),/Set Repeat in Outlook/);assert.match(url.searchParams.get('body'),/Monday, Thursday/);}
 assert.throws(()=>context.calendarComposer(event,'invalid','UTC'));
});
test('invalid fitness, expired journey and no remaining weekday cannot generate misleading links',()=>{
 assert.throws(()=>context.calendarChoices({...input,fitness:{...input.fitness,days:[]}},new Date(2026,10,3)));
 assert.throws(()=>context.calendarChoices(input,new Date(2026,11,1)));
 const events=context.calendarChoices({...input,started:'2026-11-03',ends:'2026-11-03',fitness:{...input.fitness,days:[4]}},new Date(2026,10,3,11));assert.equal(events.length,2);assert.equal(events.some(e=>e.key==='fitness'),false);
});
