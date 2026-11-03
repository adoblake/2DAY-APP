// Bypass the HTTP cache when checking the worker and its imported scripts.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  let reloading = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then(registration => registration.update()).catch(() => {});
}
