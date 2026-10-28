import test from 'node:test';
import assert from 'node:assert/strict';
import { readStory } from '../scripts/read-story.mjs';
import { validateStory, validateState } from '../src/engine/validate.js';
import { NovelEngine } from '../src/engine/engine.js';
import { SaveStore } from '../src/engine/storage.js';
const fullStory=await readStory();
// Keep engine contract tests on the intentionally branching demo fixture.
const story={...fullStory,start:'demo.natsumi',chapters:fullStory.chapters.filter(c=>c.id==='demo')};
const memory=()=>{const map=new Map();return {setItem:(k,v)=>map.set(k,v),getItem:k=>map.get(k)??null};};
test('content references, portrait variants and targets are valid',()=>validateStory(story));
test('advance blocks at choice, branch tracks flags and perspective with overlap timeline',()=>{
 const e=new NovelEngine(story);e.advance();e.advance();e.advance();
 assert.equal(e.node.type,'choice');assert.equal(e.advance(),false);
 e.choose('other');assert.equal(e.scene.perspective,'kentaro');assert.equal(e.state.flags.preview,'perspective');assert.equal(e.scene.timeline,story.scenes['demo.natsumi'].timeline);
 e.advance();e.advance();e.advance();assert.equal(e.scene.id,'demo.palette');assert.equal(e.stage.portraits[0].variant,'hero');
 e.advance();assert.equal(e.ended,true);assert.equal(e.advance(),false);
});
test('alternative branch and save/load at choice and expression preserve exact state',()=>{
 const e=new NovelEngine(story),store=new SaveStore(story,memory());
 e.advance();e.advance();assert.equal(e.stage.portraits[0].expression,'smile');
 store.save('1',e.snapshot());const loaded=new NovelEngine(story,store.load('1').state);assert.deepEqual(loaded.stage,e.stage);assert.deepEqual(loaded.state,e.state);
 e.advance();store.save('2',e.snapshot());const choice=new NovelEngine(story,store.load('2').state);choice.choose('palette');assert.equal(choice.scene.id,'demo.palette');assert.equal(choice.state.flags.preview,'palette');
 assert.equal(store.load('3'),null);assert.equal(store.load('1').state.sceneId,'demo.natsumi');
});
test('corrupt, incompatible, missing node, invalid history and blocked storage fail without mutation',()=>{
 const storage=memory(),store=new SaveStore(story,storage),e=new NovelEngine(story);
 storage.setItem(store.key('1'),'{');assert.throws(()=>store.load('1'));
 store.save('1',e.snapshot());const good=storage.getItem(store.key('1'));const data=JSON.parse(good);data.revision='old';storage.setItem(store.key('1'),JSON.stringify(data));assert.throws(()=>store.load('1'),/不相容/);assert.equal(JSON.parse(storage.getItem(store.key('1'))).revision,'old');
 assert.throws(()=>validateState(story,{...e.snapshot(),nodeId:'gone'}));
 assert.throws(()=>validateState(story,{...e.snapshot(),history:[{sceneId:'unknown',nodeId:'x'}]}));
 assert.throws(()=>new SaveStore(story,{setItem(){throw Error('quota');}}).save('1',e.snapshot()),/quota/);
 assert.throws(()=>e.choose('other'));assert.equal(e.node.id,'notice');
});
test('bad content fails early, snapshots are isolated, scene reset restores visuals',()=>{
 const broken=structuredClone(story);broken.chapters[0].scenes[0].nodes[3].options[0].target='missing';assert.throws(()=>validateStory(broken));
 const e=new NovelEngine(story);const snapshot=e.snapshot();snapshot.flags.test=true;assert.equal(e.state.flags.test,undefined);
 e.advance();e.advance();e.go('demo.kentaro');e.go('demo.natsumi');assert.equal(e.stage.portraits[0].expression,'neutral');
});
