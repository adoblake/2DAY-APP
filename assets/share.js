const shareInput = $('shareUrl');
let shareUrl = '', qrSvg = '';
function updateShare() {
  shareUrl = ''; qrSvg = '';
  $('qrPreview').replaceChildren();
  for (const id of ['copyAppLink','nativeShare','downloadQr']) $(id).disabled = true;
  try {
    shareUrl = publicShareUrl(shareInput.value.trim());
    if (shareUrl.length > 1000) throw new Error('Please use a shorter public app address.');
    const qr = qrcode(0, 'M'); qr.addData(shareUrl); qr.make();
    qrSvg = qr.createSvgTag({cellSize: 6, margin: 24, scalable: true});
    $('qrPreview').innerHTML = qrSvg;
    $('qrPreview').firstElementChild.setAttribute('role','img');
    $('qrPreview').firstElementChild.setAttribute('aria-label','QR code to open 2DAY');
    $('shareStatus').textContent = 'Shares only the app address—not your goals, contacts, or progress. Check that this address opens on another device before distributing the QR.';
    for (const id of ['copyAppLink','nativeShare','downloadQr']) $(id).disabled = false;
  } catch (error) {
    $('shareStatus').textContent = error.message.includes('Invalid URL') ? 'Enter the public HTTPS app address to create a QR code.' : error.message;
  }
}
function openShare() {
  shareInput.value = localStorage.getItem('2day_share_url') || (location.protocol === 'https:' ? location.href : '');
  updateShare(); openModal('shareModal'); shareInput.focus();
}
$('shareApp').onclick = openShare;
$('shareAppProfile').onclick = () => {closeModal('profileModal'); openShare()};
shareInput.oninput = updateShare;
$('copyAppLink').onclick = async () => {
  try { await navigator.clipboard.writeText(shareUrl); localStorage.setItem('2day_share_url',shareUrl); $('shareStatus').textContent='App link copied.'; }
  catch { shareInput.select(); $('shareStatus').textContent='Select and copy the app address above.'; }
};
$('nativeShare').onclick = async () => {
  if (!navigator.share) { $('copyAppLink').click(); return; }
  try { await navigator.share({title:'2DAY',text:'One meal. One step. Your day.',url:shareUrl}); }
  catch (error) { if(error.name !== 'AbortError') $('shareStatus').textContent='Sharing was unavailable. Use Copy link instead.'; }
};
$('downloadQr').onclick = () => {
  if(!qrSvg)return;
  localStorage.setItem('2day_share_url',shareUrl);
  const url=URL.createObjectURL(new Blob([qrSvg],{type:'image/svg+xml'}));
  const link=document.createElement('a');link.href=url;link.download='2DAY-access-QR.svg';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('revampPlan').onclick = () => openOnboard();
$('cancelRevamp').onclick = () => {onboard.classList.remove('show');};
