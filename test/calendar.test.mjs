import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calendarPlan,calendarFeed,tokenKey,validToken} from '../calendar.mjs';
test('calendar validates dates, timezone and bounded schedule',()=>{
 for(const plan of [{started:'2026-02-30',ends:'2026-03-01',timeZone:'UTC'},{started:'2026-03-01',ends:'2026-02-01',timeZone:'UTC'},{started:'2026-03-01',ends:'2026-03-02',timeZone:'invalid'}])assert.throws(()=>calendarPlan(plan));
 assert.equal(validToken('a'.repeat(64)),true);assert.equal(validToken('journey-id'),false);assert.notEqual(tokenKey('a'.repeat(64)),'a'.repeat(64));
});
test('calendar keeps local meal times across DST with stable IDs and no profile details',()=>{
 const plan={...calendarPlan({started:'2026-03-07',ends:'2026-03-08',timeZone:'America/New_York'}),updatedAt:Date.now()};
 const feed=calendarFeed(plan,'1234567890123456abc');
 assert.equal((feed.match(/BEGIN:VEVENT/g)||[]).length,6);
 assert.match(feed,/DTSTART:20260307T123000Z/);assert.match(feed,/DTSTART:20260308T113000Z/);
 const updated=calendarFeed({...plan,ends:'2026-03-09',updatedAt:Date.now()+1000},'1234567890123456abc');
 const uid=feed.match(/UID:[^\r]+/)[0];assert.ok(updated.includes(uid));assert.doesNotMatch(feed,/phone|weight|email/i);
});
