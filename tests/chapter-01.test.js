import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { readStory } from '../scripts/read-story.mjs';
import { NovelEngine } from '../src/engine/engine.js';
import { SaveStore } from '../src/engine/storage.js';
const story=await readStory();
test('complete rewritten chapter restores every stage and reaches the authored new-world ending',()=>{
 const e=new NovelEngine(story);e.go('prologue.kentaro.night');const seen=new Set();let count=0;
 do{assert.ok(count++<700);seen.add(e.scene.id);assert.ok(story.assets.backgrounds[e.stage.background].src);assert.ok(story.assets.bgm[e.stage.bgm].src);assert.deepEqual(new NovelEngine(story,e.snapshot()).stage,e.stage);if(e.node.minigame)e.completeMinigame('read');if(e.node.next && story.scenes[e.node.next].chapterId==='chapter-02')break;}while(e.advance());
 assert.ok(seen.has('chapter01.new-world'));assert.match(e.node.text,/星期六才剛剛開始/);assert.equal(e.node.next,'chapter02.hillside');assert.equal(e.ended,false);
});
test('original prose is preserved outside the explicitly authorized rescue adaptation',async()=>{
 const raw=await fs.readFile(new URL('../docs/manuscripts/chapter-01-user-2026-11-05.md',import.meta.url),'utf8');
 const adaptation=JSON.parse(await fs.readFile(new URL('../docs/chapter-01-rescue-adaptation.json',import.meta.url),'utf8'));
 const expected=raw.split('\n\n').map((x,index)=>({text:x.trim(),paragraph:index})).filter(x=>x.text&&!/^#|^---$/.test(x.text)&&!adaptation.omittedParagraphs.includes(x.paragraph)).map(x=>(adaptation.replacements[x.paragraph] || x.text).replaceAll('**','').replace(/\s+/g,''));
 const actual=story.chapters.find(c=>c.id==='chapter-01').scenes.flatMap(s=>{const blocks=new Map();for(const n of s.nodes){const key=n.id.replace(/--page-\d+$/,'');blocks.set(key,(blocks.get(key)||'')+n.text.replace(/\s+/g,''));}return [...blocks.values()];});
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
 const e=new NovelEngine(story);e.go('chapter01.skyrail');
 while(e.node.id!=='author-0097'){assert.equal(e.stage.bgm,'uplifting-orchestral-adventure');assert.equal(new NovelEngine(story,e.snapshot()).stage.bgm,'uplifting-orchestral-adventure');assert.ok(e.advance());}
 assert.equal(e.stage.bgm,'epic-fantasy-adventure');
 e.jumpToNode('chapter01.skyrail','author-0201');assert.equal(e.stage.bgm,'warm-daily-life');
 e.jumpToNode('chapter01.arrival','author-0034');assert.equal(e.stage.cg,'saturday-reunion-hug');e.jumpToNode('chapter01.arrival','author-0040');assert.equal(e.stage.cg,null);
 e.jumpToNode('chapter01.festival','author-0301');assert.equal(e.stage.cg,'starlight-festival-whale');assert.equal(story.assets.cg[e.stage.cg].camera,'push-in');
 e.go('chapter01.gate');assert.equal(e.stage.cg,null);assert.deepEqual(e.stage.gameAvatars.map(p=>p.variant),['hero-back','witch-back']);
 e.jumpToNode('chapter01.gate','author-0380');assert.deepEqual(e.stage.gameAvatars,[]);
 e.jumpToNode('chapter01.new-world','author-0414');assert.equal(e.stage.portraits[0].variant,'hero');
});

test('scripted rescue repetition is omitted while comic incident and reading fallback remain',()=>{
 const e=new NovelEngine(story);e.jumpToNode('chapter01.skyrail','author-0115');assert.ok(e.advance());assert.equal(e.node.id,'author-0161');assert.doesNotMatch(e.node.text,/數到三/);
 const ids=story.scenes['chapter01.skyrail'].nodes.map(n=>n.id);assert.ok(!ids.includes('author-0124'));assert.ok(ids.includes('author-0172'));
 e.jumpToNode('chapter01.skyrail','author-0181');e.completeMinigame('kentaro');assert.equal(e.node.id,'author-0200');assert.ok(!e.state.history.some(h=>h.nodeId==='author-0182'));
 const read=new NovelEngine(story);read.jumpToNode('chapter01.skyrail','author-0181');read.completeMinigame('read');assert.equal(read.node.id,'author-0182');while(read.node.id!=='author-0200')assert.ok(read.advance());
});
test('saves on removed operation paragraphs restore at the rescue gate',()=>{
 const state={sceneId:'chapter01.skyrail',nodeId:'author-0142',flags:{},history:[{sceneId:'chapter01.skyrail',nodeId:'author-0124'}]};const raw=JSON.stringify({version:1,storyId:story.id,revision:story.revision,savedAt:new Date().toISOString(),state});const data=new SaveStore(story,{getItem:()=>raw}).load('1');assert.equal(data.migrated,true);assert.equal(data.state.nodeId,'author-0181');assert.equal(data.state.history[0].nodeId,'author-0181');
});
test('transportation music builds tension only from the portal activation until arrival',()=>{
 const e=new NovelEngine(story);e.jumpToNode('chapter01.gate','author-0375');assert.equal(e.stage.bgm,'peaceful-night');e.advance();assert.equal(e.stage.bgm,'rising-tension');assert.equal(new NovelEngine(story,e.snapshot()).stage.bgm,'rising-tension');while(e.scene.id==='chapter01.gate'){assert.equal(e.stage.bgm,'rising-tension');assert.ok(e.advance());}assert.equal(e.scene.id,'chapter01.new-world');assert.equal(e.stage.bgm,'warm-daily-life');
});
test('supplied whale music starts with the CG and lasts until its departure',()=>{
 const e=new NovelEngine(story);e.jumpToNode('chapter01.festival','author-0300');assert.equal(e.stage.bgm,'heartwarming-romance');e.advance();assert.equal(e.node.id,'author-0301');assert.equal(e.stage.cg,'starlight-festival-whale');
 do{assert.equal(e.stage.bgm,'dance-in-the-rain');assert.equal(new NovelEngine(story,e.snapshot()).stage.bgm,'dance-in-the-rain');assert.ok(e.advance());}while(e.scene.id==='chapter01.festival');
 assert.equal(e.scene.id,'chapter01.gate');assert.equal(e.stage.bgm,'peaceful-night');assert.equal(e.stage.cg,null);
});
