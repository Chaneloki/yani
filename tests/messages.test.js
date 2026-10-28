import test from 'node:test';
import assert from 'node:assert/strict';
import { readStory } from '../scripts/read-story.mjs';
import { NovelEngine } from '../src/engine/engine.js';
import { chapterMessages } from '../src/engine/messages.js';
const story=await readStory();
test('message log contains read messages in chronological order, without repeats or other POVs',()=>{
 const e=new NovelEngine(story);
 assert.equal(chapterMessages(story,e.state).length,0);
 for(let i=0;i<28;i++)e.advance();
 const messages=chapterMessages(story,e.state);
 assert.ok(messages.length>3);
 assert.equal(messages[0].node.id,'line-0013');
 assert.ok(messages.every(m=>m.scene.perspective==='natsumi' && m.node.channel==='message'));
 assert.ok(!messages.some(m=>m.scene.id==='prologue.natsumi.invitation'));
 const duplicate={...e.snapshot(),history:[...e.state.history,...e.state.history]};
 assert.equal(chapterMessages(story,duplicate).length,messages.length);
 const restored=new NovelEngine(story,e.snapshot());assert.deepEqual(chapterMessages(story,restored.state),messages);
 e.go('prologue.kentaro.workshop');assert.equal(chapterMessages(story,e.state).length,0);
});
test('already read messages persist across scenes within a chapter',()=>{
 const e=new NovelEngine(story);for(let i=0;i<28;i++)e.advance();
 const before=chapterMessages(story,e.state).length;
 e.go('prologue.natsumi.invitation');assert.equal(chapterMessages(story,e.state).length,before);
 e.go('demo.natsumi');assert.equal(chapterMessages(story,e.state).length,0);
});

test('both POVs share the authored workshop photo and read messages retain it',()=>{
 const received=story.scenes['prologue.natsumi.exam'].nodes.find(n=>n.id==='line-0013');
 const sent=story.scenes['prologue.kentaro.workshop'].nodes.find(n=>n.id==='line-0033');
 assert.deepEqual(received.attachments,['workshop-bumper-photo']);assert.deepEqual(sent.attachments,received.attachments);
 const e=new NovelEngine(story);for(let i=0;i<10;i++)e.advance();
 assert.deepEqual(chapterMessages(story,e.state)[0].node.attachments,received.attachments);
});

test('congratulations in both POVs share the rolling cat sticker',()=>{
 for(const [scene,id] of [['prologue.natsumi.exam','line-0023'],['prologue.kentaro.after-class','line-0100']]){
  assert.deepEqual(story.scenes[scene].nodes.find(n=>n.id===id).attachments,['rolling-tabby-cat']);
 }
 assert.equal(story.assets.messageImages['rolling-tabby-cat'].kind,'sticker');
});
test('game promotion remains visible through its description, then clears',()=>{
 const e=new NovelEngine(story);e.go('prologue.natsumi.cafe');
 while(e.node.id!=='line-0064')e.advance();
 assert.equal(e.stage.media,'fantasy-castle-promo');e.advance();assert.equal(e.stage.media,'fantasy-castle-promo');
 assert.equal(new NovelEngine(story,e.snapshot()).stage.media,'fantasy-castle-promo');
 while(e.node.id!=='line-0066')e.advance();assert.equal(e.stage.media,null);
 e.go('prologue.natsumi.night');assert.equal(e.stage.media,undefined);
});

test('fireball clip and purchase receipt are shared by both POVs and show at the right points',()=>{
 const pairs=[['line-0098','line-0125','fireball-mishap'],['line-0135','line-0202','game-purchase-complete']];
 for(const [n,k,id] of pairs){
  assert.deepEqual(story.scenes['prologue.natsumi.invitation'].nodes.find(x=>x.id===n).attachments,[id]);
  assert.deepEqual(story.scenes['prologue.kentaro.invitation'].nodes.find(x=>x.id===k).attachments,[id]);
 }
 const e=new NovelEngine(story);e.go('prologue.natsumi.cafe');
 while(e.node.id!=='line-0071')e.advance();assert.equal(e.stage.media,'cooperative-stone-bridge');
 while(e.node.id!=='line-0075')e.advance();assert.equal(e.stage.media,null);
 e.go('prologue.natsumi.invitation');while(e.node.id!=='line-0090')e.advance();assert.equal(e.stage.media,'fireball-mishap');
 while(e.node.id!=='line-0098')e.advance();assert.equal(e.stage.media,null);
 while(e.node.id!=='line-0131')e.advance();assert.equal(e.stage.media,'game-purchase-complete');
 while(e.node.id!=='line-0135')e.advance();assert.equal(e.stage.media,null);
});
