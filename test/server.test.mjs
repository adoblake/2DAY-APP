import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import vm from 'node:vm';

test('application serves public assets and protects private files', async t => {
  const dir = await mkdtemp(join(tmpdir(), '2day-test-'));
  const child = spawn(process.execPath, ['server.mjs'], {
    env: { PATH: process.env.PATH, PORT: '0', DATA_FILE: join(dir, 'data.json') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(async () => { if(child.exitCode===null && child.signalCode===null){const exited=once(child,'exit'); child.kill(); await exited;} await rm(dir,{recursive:true,force:true}); });
  const output = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server did not start')), 5000);
    child.once('error', reject);
    child.once('exit', code => {clearTimeout(timeout);reject(new Error('Server exited: '+code));});
    child.stderr.on('data', chunk => process.stderr.write(chunk));
    child.stdout.once('data', chunk => { clearTimeout(timeout); resolve(chunk.toString()); });
  });
  const base = output.match(/http:\/\/localhost:\d+/)[0];
  const html = await (await fetch(base)).text();
  assert.match(html, /homeView/);
  assert.match(html, /calendarYes/);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  new vm.Script(script);
  assert.deepEqual(await (await fetch(base+'/api/status')).json(), {server:true,sms:false,email:false});
  for (const path of ['/.env','/.env.example','/.git/config','/.plate-data.json','/server.mjs','/package.json']) {
    assert.equal((await fetch(base+path)).status,404,path);
  }
  assert.match((await fetch(base+'/assets/home-source.svg')).headers.get('content-type'), /image\/svg\+xml/);
  assert.equal((await fetch(base+'/api/register',{method:'POST',body:'{}'})).status,400);
  const profile={journeyId:'test-journey',phone:'',progressSmsEnabled:false};
  assert.equal((await fetch(base+'/api/register',{method:'POST',body:JSON.stringify(profile)})).status,200);
  const progress={journeyId:'test-journey',days:{'2026-11-02':{done:{morning:true}}}};
  assert.equal((await fetch(base+'/api/progress',{method:'POST',body:JSON.stringify(progress)})).status,200);
  const saved=JSON.parse(await readFile(join(dir,'data.json'),'utf8'));
  assert.equal(saved.profiles['test-journey'].progress.days['2026-11-02'].done.morning,true);
  const sms=await (await fetch(base+'/api/test-sms',{method:'POST',body:JSON.stringify({phone:'+16025550123'})})).json();
  assert.equal(sms.sent,false);
});
