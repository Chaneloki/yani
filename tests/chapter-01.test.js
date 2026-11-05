import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readStory } from '../scripts/read-story.mjs';
import { NovelEngine } from '../src/engine/engine.js';
import { SaveStore } from '../src/engine/storage.js';
const story=await readStory();
test('complete rewritten chapter restores every stage and reaches the authored new-world ending',()=>{
 const e=new NovelEngine(story);e.go('prologue.kentaro.night');const seen=new Set();let count=0;
 do{assert.ok(count++<700);seen.add(e.scene.id);assert.ok(story.assets.backgrounds[e.stage.background].src);assert.ok(story.assets.bgm[e.stage.bgm].src);assert.deepEqual(new NovelEngine(story,e.snapshot()).stage,e.stage);if(e.node.minigame)e.completeMinigame('read');}while(e.advance());
 assert.ok(seen.has('chapter01.new-world'));assert.match(e.node.text,/星期六才剛剛開始/);assert.equal(e.ended,true);
});
test('user manuscript prose is preserved in order without editorial additions',async()=>{
 const raw=await fs.readFile(new URL('../docs/manuscripts/chapter-01-user-2026-11-05.md',import.meta.url),'utf8');
 const expected=raw.split(/\n\s*\n/).map(x=>x.trim()).filter(x=>x&&!/^#|^---$/.test(x)).map(x=>x.replaceAll('**','').replace(/\s+/g,''));
 const actual=story.chapters.find(c=>c.id==='chapter-01').scenes.flatMap(s=>s.nodes.map(n=>n.text.replace(/\s+/g,'')));
 assert.deepEqual(actual,expected);
});
test('playable rescue gates advancement and completion resumes after the rescue',()=>{
 const e=new NovelEngine(story);e.jumpToNode('chapter01.skyrail','author-0181');assert.equal(e.advance(),false);
 const resumed=new NovelEngine(story,e.snapshot());resumed.completeMinigame('natsumi');assert.equal(resumed.node.id,'author-0200');assert.equal(resumed.state.flags['activity:skyrail-rescue'],'natsumi');
 assert.equal(resumed.scene.perspective,'kentaro');assert.throws(()=>resumed.completeMinigame('kentaro'));
 e.completeMinigame('read');assert.equal(e.node.id,'author-0182');assert.ok(e.advance());
});
test('old first-chapter saves migrate explicit aliases without overwriting original storage',()=>{
 const e=new NovelEngine(story);e.go('chapter01.arrival');const old=Object.keys(e.scene.nodeAliases)[0];assert.ok(old);
 const state=e.snapshot();state.nodeId=old+'--page-2';state.history=[{sceneId:e.scene.id,nodeId:old}];
 const raw=JSON.stringify({version:1,storyId:story.id,revision:story.revision,savedAt:new Date().toISOString(),state});const storage={getItem:()=>raw};
 const loaded=new SaveStore(story,storage).load('1');assert.equal(loaded.migrated,true);assert.equal(loaded.state.nodeId,e.scene.nodeAliases[old]);assert.equal(storage.getItem(),raw);
});
test('CG reveal, music, and rear sprites retain the intended visual boundaries',()=>{
 const e=new NovelEngine(story);e.jumpToNode('chapter01.skyrail','author-0097');assert.equal(e.stage.bgm,'epic-fantasy-adventure');
 e.jumpToNode('chapter01.skyrail','author-0201');assert.equal(e.stage.bgm,'warm-daily-life');
 e.jumpToNode('chapter01.arrival','author-0034');assert.equal(e.stage.cg,'saturday-reunion-hug');e.jumpToNode('chapter01.arrival','author-0040');assert.equal(e.stage.cg,null);
 e.jumpToNode('chapter01.festival','author-0301');assert.equal(e.stage.cg,'starlight-festival-whale');assert.equal(story.assets.cg[e.stage.cg].camera,'push-in');
 e.go('chapter01.gate');assert.equal(e.stage.cg,null);assert.deepEqual(e.stage.gameAvatars.map(p=>p.variant),['hero-back','witch-back']);
 e.jumpToNode('chapter01.gate','author-0380');assert.deepEqual(e.stage.gameAvatars,[]);
 e.jumpToNode('chapter01.new-world','author-0414');assert.equal(e.stage.portraits[0].variant,'hero');
});
