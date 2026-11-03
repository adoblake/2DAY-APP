$('reviewProgramGuidance').onclick=()=>{paintProgramAcceptance();openModal('programGuidanceModal');$('programGuidanceModal').querySelector('[data-close]').focus();};
$('acceptProgramGuidance').onclick=()=>{
 if(!profile)return;
 profile.programAcceptances??={};const title=bodyProgram(profile.goalBody).title;
 if(profile.programAcceptances[title]?.version!==1){profile.programAcceptances[title]={version:1,acceptedAt:new Date().toISOString()};saveProfileData();}
 paintProgramAcceptance();closeModal('programGuidanceModal');
};
document.addEventListener('keydown',event=>{
 const modal=$('programGuidanceModal');if(!modal.classList.contains('show'))return;
 if(event.key==='Escape'){event.preventDefault();closeModal('programGuidanceModal');return;}
 if(event.key!=='Tab')return;
 const items=[...modal.querySelectorAll('button,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length),first=items[0],last=items.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
