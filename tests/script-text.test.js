import test from 'node:test';
import assert from 'node:assert/strict';
import { applyScriptText } from '../src/content/script-text.js';
const chapter=()=>({scenes:[{id:'scene',stage:{bgm:'night'},nodes:[{id:'one',text:'original',next:'other',stage:{background:'room'}},{id:'two',text:'second'}]}]});
const document='## 場景\n\n### scene/one | 旁白\n\n修改後的句子。\n第二行。\n\n### scene/two | 健太郎 · 手機訊息\n\n「你好！」\n';
test('editable script applies multiline prose while retaining stage, navigation and save IDs',()=>{
 const c=chapter();applyScriptText(c,[document]);
 assert.equal(c.scenes[0].nodes[0].text,'修改後的句子。\n第二行。');
 assert.deepEqual(c.scenes[0].nodes[0].stage,{background:'room'});
 assert.equal(c.scenes[0].nodes[0].id,'one');assert.equal(c.scenes[0].nodes[0].next,'other');
 assert.equal(c.scenes[0].stage.bgm,'night');
});
test('missing, duplicate, unknown, malformed and empty script blocks fail without partial edits',()=>{
 for(const doc of [document.replace('scene/two','scene/gone'),document+'\n### scene/one | 旁白\n重複',document.split('### scene/two')[0],document.replace('### scene/one | 旁白','### broken'),document.replace('「你好！」','')]){
  const c=chapter(),before=structuredClone(c);assert.throws(()=>applyScriptText(c,[doc]));assert.deepEqual(c,before);
 }
});

test('separator creates advanceable pages, preserving cues first and navigation/attachments last',()=>{
 const c=chapter();c.scenes[0].nodes[0].attachments=['photo'];c.scenes[0].nodes[0].advanceLabel='下一場';
 applyScriptText(c,[document.replace('修改後的句子。\n第二行。','第一頁。\n\n---\n\n第二頁。\n仍在同一頁。\n---\n第三頁。')]);
 const [a,b,d,last]=c.scenes[0].nodes;
 assert.equal(a.id,'one');assert.equal(b.id,'one--page-2');assert.equal(d.id,'one--page-3');
 assert.deepEqual(a.stage,{background:'room'});assert.equal(b.stage,undefined);
 assert.equal(a.next,undefined);assert.equal(b.next,undefined);assert.equal(d.next,'other');
 assert.equal(a.attachments,undefined);assert.deepEqual(d.attachments,['photo']);
 assert.equal(d.advanceLabel,'下一場');assert.equal(b.text,'第二頁。\n仍在同一頁。');assert.equal(last.id,'two');
});
test('empty pages and generated ID collisions fail atomically',()=>{
 for(const text of ['---\n文字','文字\n---','文字\n---\n---\n文字']){
  const c=chapter(),before=structuredClone(c);
  assert.throws(()=>applyScriptText(c,[document.replace('修改後的句子。\n第二行。',text)]));assert.deepEqual(c,before);
 }
 const c=chapter();c.scenes[0].nodes[1].id='one--page-2';const before=structuredClone(c);
 assert.throws(()=>applyScriptText(c,[document.replace('第二行。','---\n第二頁。').replace('scene/two','scene/one--page-2')]));assert.deepEqual(c,before);
});

test('engine advances split pages before scene jump and restores old and split-page saves',async()=>{
 const {NovelEngine}=await import('../src/engine/engine.js');
 const c=chapter();c.scenes[0].nodes=[{id:'one',type:'narration',text:'original',next:'other',stage:{background:'room'}}];
 applyScriptText(c,['### scene/one | 旁白\n第一頁。\n---\n第二頁。']);
 const story={start:'scene',scenes:{scene:c.scenes[0],other:{id:'other',stage:{},nodes:[{id:'end',type:'narration',text:'結束。'}]}}};
 const e=new NovelEngine(story);const old=e.snapshot();
 assert.equal(e.node.text,'第一頁。');assert.equal(e.advance(),true);assert.equal(e.node.text,'第二頁。');
 const restored=new NovelEngine(story,e.snapshot());assert.equal(restored.stage.background,'room');
 assert.equal(new NovelEngine(story,old).node.id,'one');restored.advance();assert.equal(restored.scene.id,'other');
});
