import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRows, APPS, initialTranslation} from '../dist/data.js';
import {validate, placeholders, stats, exportLng, migratedTranslation, sourceFor} from '../dist/core.js';

test('catalog includes all 28 required applications with unique resource keys',()=>{
 assert.equal(APPS.length,28);const rows=makeRows();assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
 for(const id of ['CAM','AddinManager','XMLCONFIG','Tuner Core','Tuner Monitor','Tuner Shell','Tuner XML'])assert.ok(APPS.find(a=>a.id===id));
});
test('placeholder validation preserves type and multiplicity, permits order changes',()=>{
 assert.deepEqual(placeholders('%s %d %s %% {name}'),['%d','%s','%s','{name}']);
 assert.equal(validate('%s %d %s','%d %s').find(c=>c.id==='placeholders').ok,false);
 assert.equal(validate('%s %d','%d %s').find(c=>c.id==='placeholders').ok,true);
 assert.equal(validate('%1$s %2$d','%1$d %2$s').find(c=>c.id==='placeholders').ok,false);
});
test('line breaks and forbidden contacts block application',()=>{
 assert.equal(validate('Hello','Привет\n').find(c=>c.id==='newlines').ok,false);
 assert.equal(validate('Hello\nworld','Привет\nмир').find(c=>c.id==='newlines').ok,true);
 for(const text of ['example.com','https://test.ru','me@example.org','+7 (999) 123-45-67','Дилер A'])assert.equal(validate('Hello',text,[{name:'Дилер A'}]).find(c=>c.id==='contacts').ok,false,text);
});
test('LNG includes Translated and Outdated, excludes automatic, empty and ignored',()=>{
 const rows=['translated','outdated','auto','untranslated','translated'].map((s,i)=>({app:'CAM',code:'K'+i,id:'K'+i,t:{status:s,text:i===1?'Строка\nНовая':'Строка'}}));
 const out=exportLng(rows,r=>r.t,r=>r.id==='K4','18.0','ru');assert.equal(out.count,2);assert.match(out.content,/K1=Строка\\nНовая/);assert.doesNotMatch(out.content,/K[234]=/);
});
test('version migration retains approved work and marks changed sources outdated',()=>{
 const row={source:'Spindle speed, rpm',previousSource:'Spindle speed'};
 assert.equal(migratedTranslation(row,'17.0','18.0',{text:'Скорость',status:'translated',history:[]}).status,'outdated');
 assert.equal(migratedTranslation({source:'Apply'},'17.0','18.0',{text:'Применить',status:'translated',history:[]}).status,'translated');
 assert.equal(migratedTranslation(row,'17.0','18.0',{text:'AI',status:'auto'}),null);
});
test('progress excludes ignored rows; outdated is exportable but not current',()=>{
 const rows=[{s:'translated'},{s:'outdated'},{s:'auto'},{s:'untranslated'},{s:'translated',ignored:true}];
 const s=stats(rows,r=>({status:r.s}),r=>r.ignored);assert.equal(s.percent,25);assert.equal(s.total,4);assert.equal(s.exportable,2);assert.equal(s.ignored,1);
});
test('curated demo translations preserve technical invariants in both versions',()=>{
 for(const row of makeRows())for(const lang of ['ru','de','es','fr'])for(const version of ['17.0','18.0']){
  const t=initialTranslation(row,lang,version);if(!t.text)continue;
  assert.deepEqual(validate(sourceFor(row,version),t.text).filter(c=>!c.ok),[],`${row.id} ${lang} ${version}`);
 }
});
