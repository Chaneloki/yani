import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readStory } from '../scripts/read-story.mjs';
import { validateStory } from '../src/engine/validate.js';
import { NovelEngine } from '../src/engine/engine.js';
import { SaveStore } from '../src/engine/storage.js';
const story=await readStory();
const read=async p=>readFile(new URL(p,import.meta.url),'utf8');
const report=JSON.parse(await read('../docs/manuscript-import.json'));
const imported=JSON.parse(await read('../src/content/chapters/prologue.json'));
test('full story validates and the complete prologue ends before the gaming date',()=>{
 validateStory(story);
 const e=new NovelEngine(story);const seen=new Set();let count=0;
 while(true){assert.ok(count++<600,'cycle or unexpected additions');seen.add(e.scene.id);if(!e.advance())break;}
 assert.equal(seen.size,14);assert.equal(count,story.chapters.find(c=>c.id==='prologue').scenes.reduce((sum,s)=>sum+s.nodes.length,0));assert.equal(e.scene.id,'prologue.kentaro.night');assert.match(e.node.text,/非常值得高興的事/);
 assert.equal(e.state.history.length,count);assert.equal(e.state.flags.preview,undefined);
});
test('every imported body line is retained and originals are byte-identical',async()=>{
 for(const source of report.sources){
   const backup=await read(`../docs/manuscripts/${source.file}`);
   const original=backup;
   assert.equal(createHash('sha256').update(original).digest('hex'),source.sha256);
   const lines=original.split(/\r?\n/);
   const nodes=imported.scenes.flatMap(s=>s.nodes).filter(n=>n.source.file===source.file);
   const included=[...new Set(nodes.flatMap(n=>n.source.lines))].sort((a,b)=>a-b);
   assert.deepEqual(included,source.includedLines);
   const expected=source.includedLines.map(ln=>{
     let text=report.edits.find(e=>e.file===source.file && e.line===ln)?.after || lines[ln-1].trim();
     if(text.startsWith('山田：「'))text=text.slice(3);
     return text;
   }).join('');
   // Author edits may move paragraph breaks; every non-whitespace character stays intact.
   assert.equal(nodes.map(n=>n.text).join('').replace(/\s/g,''),expected.replace(/\s/g,''));
 }
});
test('messages identify their actual author, and POV transfer survives save/load',()=>{
 const n=story.scenes['prologue.natsumi.exam'];
 assert.equal(n.nodes.find(n=>n.id==='line-0013').speaker,'kentaro');assert.equal(n.nodes.find(n=>n.id==='line-0013').channel,'message');
 assert.equal(story.scenes['prologue.natsumi.cafe'].nodes.find(n=>n.id==='line-0054').speaker,'university_classmate');
 const e=new NovelEngine(story);e.go('prologue.natsumi.night');
 while(!e.node.next)e.advance();
 const data=new Map(),store=new SaveStore(story,{setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)??null});
 store.save('1',e.snapshot());const restored=new NovelEngine(story,store.load('1').state);
 assert.equal(restored.node.advanceLabel,'閱讀健太郎視角 ↗');restored.advance();assert.equal(restored.scene.perspective,'kentaro');assert.equal(restored.stage.portraits[0].character,'kentaro');
});
test('author notes and future outline are not playable text; all four art variants are registered',()=>{
 const text=story.chapters.find(c=>c.id==='prologue').scenes.flatMap(s=>s.nodes.map(n=>n.text)).join('\n');
 assert.ok(!text.includes('序章我會用雙視角'));assert.ok(!text.includes('逆刻星鐘'));
 for(const [who,variant,name] of [['natsumi','real','CHAR_NATSUMI'],['kentaro','real','CHAR_KENTARO'],['natsumi','witch','ROLE_WITCH'],['kentaro','hero','ROLE_HERO']])assert.equal(story.characters[who].variants[variant].neutral,`./assets/characters/${name}.png`);
});

test('pages never end on a comma or an unfinished continuation',()=>{
 for(const s of story.chapters.find(c=>c.id==='prologue').scenes)for(const n of s.nodes)assert.ok(!/[，,]\s*$/.test(n.text),`${s.id}/${n.id} ends on a comma`);
});

test('authored backgrounds change with place and lights, and restore through saves',()=>{
 const e=new NovelEngine(story);assert.equal(e.stage.background,'classroom-sunset');
 for(let i=0;e.node.id!=='line-0008' && i<30;i++)e.advance();
 assert.equal(e.node.id,'line-0008');assert.equal(e.stage.background,'campus-sunset');
 const map=new Map(),store=new SaveStore(story,{setItem:(k,v)=>map.set(k,v),getItem:k=>map.get(k)??null});
 store.save('1',e.snapshot());assert.equal(new NovelEngine(story,store.load('1').state).stage.background,'campus-sunset');
 e.go('prologue.natsumi.night');assert.equal(e.stage.background,'natsumi-bedroom-night');
 for(let i=0;!e.node.source.lines.includes(234) && i<60;i++)e.advance();
 assert.equal(e.stage.background,'natsumi-bedroom-moonlight');
 e.go('prologue.kentaro.workshop');assert.equal(e.stage.background,'automotive-workshop-day');
 e.go('prologue.kentaro.invitation');assert.equal(e.stage.background,'kentaro-room-night');
});

test('sentence reflow preserves the current edited text and all previous save IDs',async()=>{
 const before=JSON.parse(await read('../docs/content-snapshots/prologue-before-sentence-reflow.json'));
 for(const old of before.scenes){
  const current=story.scenes[old.id];
  // Editable Markdown may change prose; the original JSON import remains lossless.
  assert.equal(imported.scenes.find(s=>s.id===old.id).nodes.map(n=>n.text).join(''),old.nodes.map(n=>n.text).join(''));
  for(const n of old.nodes)assert.ok(current.nodes.some(now=>now.id===n.id),`${old.id}/${n.id} removed`);
 }
});

test('every prologue page retains an image background and BGM across both perspectives and reloads',()=>{
 const e=new NovelEngine(story);
 let count=0;
 do {
  assert.ok(count++<600);
  const stage=e.stage;
  assert.ok(story.assets.backgrounds[stage.background]?.src,`${e.scene.id}/${e.node.id}: background`);
  assert.ok(story.assets.bgm[stage.bgm]?.src,`${e.scene.id}/${e.node.id}: BGM`);
  assert.deepEqual(new NovelEngine(story,e.snapshot()).stage,stage);
 } while(e.advance());
});
