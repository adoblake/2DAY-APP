let calendarOpener=null;
function calendarFitness(){const [h,m]=$('fitnessTime').value.split(':').map(Number);return {enabled:$('fitnessEnabled').checked,days:[...document.querySelectorAll('[data-fitness-day]:checked')].map(el=>Number(el.value)),start:h*60+m,duration:Number($('fitnessDuration').value)}}
function paintFitness(){const f=profile.fitness||{enabled:false,days:[],start:1020,duration:30};$('fitnessEnabled').checked=f.enabled;$('fitnessTime').value=pad(Math.floor(f.start/60))+':'+pad(f.start%60);$('fitnessDuration').value=String(f.duration);document.querySelectorAll('[data-fitness-day]').forEach(el=>el.checked=f.days.includes(Number(el.value)))}
function openCalendar(){
 if(!$('calendarModal').classList.contains('show'))calendarOpener=$('profileModal').contains(document.activeElement)?(currentView==='home'?$('profileBtnHome'):$('profileBtn')):document.activeElement;
 closeModal('profileModal');paintFitness();$('calendarProvider').value=profile.calendarProvider||'google';openModal('calendarModal');paintCalendarLinks();$('calendarModal').querySelector('[data-close]').focus();
}
function paintCalendarLinks(){
 const provider=$('calendarProvider').value;const container=$('calendarEventLinks');container.replaceChildren();
 $('calendarInstructions').textContent=provider==='google'?'Open each event, choose your calendar in Google, review Repeat and the end date, then Save. Daily meals and selected weekly fitness days are prefilled.':'Open each event in Outlook, choose your calendar, then set Repeat and its end date before saving. Outlook links prefill the first event; repeating schedules need your approval in the editor.';
 try{
  const events=calendarChoices({started:journey.started,ends:journey.ends,meals:baseMeals.map(goalTweaks),fitness:calendarFitness()});
  if(!events.length)throw new Error('No future sessions fit in this journey. Revise your timeframe to add more.');
  for(const event of events){
   const card=document.createElement('div');card.className='calendarMeal';card.style.cssText='display:block;margin:10px 0;padding:14px';
   const title=document.createElement('b');title.textContent=event.title;
   const note=document.createElement('p');note.className='helper';note.textContent=(event.days?'Weekly on '+event.days.map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', '):'Daily')+' · '+ft(event.start)+'–'+ft(event.start+event.duration)+' · first '+event.date.toLocaleDateString()+' · through '+event.until.toLocaleDateString();
   const link=document.createElement('a');link.className='calendarEventLink';link.href=calendarComposer(event,provider,Intl.DateTimeFormat().resolvedOptions().timeZone);link.target='_blank';link.rel='noopener noreferrer';link.textContent='ADD '+(event.key==='fitness'?'FITNESS':event.key==='meal-0'?'MORNING':event.key==='meal-1'?'MIDDAY':'NIGHT')+' TO '+(provider==='google'?'GOOGLE':'OUTLOOK');
   link.onclick=()=>{profile.fitness=calendarFitness();profile.calendarProvider=provider;profile.calendarPrompted=true;saveProfileData();$('calendarStatus').textContent='Event editor opened. Choose the destination calendar and save there. 2DAY cannot confirm whether you saved it. Opening it again may create a duplicate.';};
   card.append(title,note,link);container.append(card);
  }
  $('calendarStatus').textContent='No download or calendar-account connection needed. You approve each event in your own calendar. Later edits must be made in that calendar too.';
 }catch(error){$('calendarStatus').textContent=error.message;}
}
$('calendarProvider').onchange=paintCalendarLinks;
for(const element of [$('fitnessEnabled'),$('fitnessTime'),$('fitnessDuration'),...document.querySelectorAll('[data-fitness-day]')])element.onchange=paintCalendarLinks;
$('saveCalendarChoices').onclick=()=>{paintCalendarLinks();if(!$('calendarEventLinks').children.length)return;profile.fitness=calendarFitness();profile.calendarProvider=$('calendarProvider').value;saveProfileData();$('calendarStatus').textContent='Calendar choices saved on this device. Use each Add button and save in your calendar. No events have been added just by saving these choices.';};
$('homeCalendar').onclick=openCalendar;$('dayCalendar').onclick=openCalendar;
function syncCalendar(){if(profile?.calendarPrompted)toast('Plan saved. Edit existing calendar events in your calendar app; new Add links do not update old events.');}
document.addEventListener('keydown',event=>{
 const modal=$('calendarModal');if(!modal.classList.contains('show'))return;
 if(event.key==='Escape'){event.preventDefault();closeModal('calendarModal');return;}
 if(event.key!=='Tab')return;
 const items=[...modal.querySelectorAll('button,input,select,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length),first=items[0],last=items.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
