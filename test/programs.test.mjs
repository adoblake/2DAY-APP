import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({URL});
vm.runInContext(await readFile(new URL('../assets/programs.js',import.meta.url),'utf8'),context);
test('goals select distinct general programs, including legacy Fit profiles',()=>{
 assert.equal(context.bodyProgram('Maintain').title,'BODY MAINTENANCE');
 assert.equal(context.bodyProgram('Fit').title,'BODY MAINTENANCE');
 assert.equal(context.bodyProgram('Thin').title,'STEADY WEIGHT LOSS');
 assert.equal(context.bodyProgram('Built').title,'MUSCLE + STRENGTH');
 const meal={id:'night',items:['Fish','Kitchen closed after this']};
 assert.match(context.programMeal(meal,'Thin').items[1],/still hungry/);
 assert.equal(meal.items[1],'Kitchen closed after this');
});
test('sharing strips personal query parameters and rejects local or unsafe addresses',()=>{
 assert.equal(context.publicShareUrl('https://example.com/2DAY/?phone=secret#progress'),'https://example.com/2DAY/');
 for(const value of ['http://example.com','https://localhost/','https://127.0.0.1/','https://[::1]/','https://user:password@example.com','javascript:alert(1)'])assert.throws(()=>context.publicShareUrl(value));
});
