import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {SecretMap,createSecretMap,validateSecretMap,SECRET_LANDMARKS} from '../src/world/secret-map.js';
import {VillageLife,validateWorld} from '../src/world/world-engine.js';
import {createQuestPreview,previewStorageKey} from '../src/world/quest-previews.js';
import {paginateText} from '../src/content/paginate-text.js';
const config=JSON.parse(await readFile(new URL('../src/content/world.json',import.meta.url),'utf8'));
const content=JSON.parse(await readFile(new URL('../src/content/quests/keep-the-promise.json',import.meta.url),'utf8'));
function untilExplore(g){while(['rocks','canal','encounter','route'].includes(g.s.phase))g.storyEnd();}
function finish(g){g.storyEnd();for(const id of ['mill','rocks','canal']){g.visit(id);g.inspect(SECRET_LANDMARKS[id].correct);untilExplore(g);}g.visit('mill');assert.ok(g.inspect('pot').found);g.storyEnd();if(g.s.phase==='respond')g.respond('accompany');g.storyEnd();g.storyEnd();assert.equal(g.s.phase,'settle');return g;}
for(const actor of ['kentaro','natsumi'])for(const together of [false,true])test(`secret map ${actor}/${together?'duet':'solo'} completes exploration and grants the marble once`,()=>{
 const life=new VillageLife(config,createQuestPreview(config,'keep-the-promise',actor,together));const original={day:life.state.day,period:life.state.period};assert.throws(()=>life.complete(),/盒子/);const g=finish(new SecretMap(life.state.secretMap));life.secretCheckpoint(g.snapshot());assert.deepEqual({day:life.state.day,period:life.state.period},original);life.complete();assert.equal(life.state.inventory['blue-marble'],1);assert.equal(life.state.coins,0);assert.equal(life.state.childrenState.reconciled,true);assert.equal(life.state.secretMap.phase,'done');validateWorld(life.snapshot(),config);assert.throws(()=>life.complete());assert.ok(life.gate.every(g=>!g.id.includes('promise')));
});
test('observation accepts different visit orders, cannot find box before matching the map, and restores without repeating encounters',()=>{
 const g=new SecretMap(createSecretMap('natsumi',false));g.storyEnd();g.visit('mill');assert.equal(g.inspect('pot').found,false);g.inspect('roof');g.visit('canal');g.inspect('grass');assert.equal(g.s.found.length,1);g.inspect('water');g.visit('rocks');g.inspect('boulders');assert.equal(g.s.phase,'encounter');g.storyEnd();assert.equal(g.s.phase,'route');g.storyEnd();const restored=new SecretMap(g.snapshot());restored.visit('rocks');restored.inspect('boulders');assert.equal(restored.s.phase,'explore');restored.visit('mill');restored.inspect('pot');validateSecretMap(restored.snapshot());assert.equal(restored.s.phase,'found');
});
test('every imported story line is authored; routes are distinct and both supplied CGs occur during reconciliation',async()=>{
 const raw=await readFile(new URL('../docs/manuscripts/side-quest-05-secret-user.txt',import.meta.url),'utf8');
 for(const [variant,scenes] of Object.entries(content.variants)){for(const lines of Object.values(scenes))for(const line of lines){assert.ok(raw.includes(line.text),line.id);assert.ok(paginateText(line.text).length);assert.ok([null,'$actor','kentaro','natsumi','tobi','mira'].includes(line.speaker));}
  const cg=scenes.reconcile.filter(l=>l.cg);assert.ok(cg.some(l=>l.background.includes('tobi-reunion-user')));assert.ok(cg.some(l=>l.background.includes('mira-reunion-user')));assert.ok(cg.every(l=>l.portrait===false));assert.ok(scenes.night.length);
 }
 assert.notDeepEqual(content.variants.kentaro.route,content.variants.natsumi.route);assert.notDeepEqual(content.variants.together.night,content.variants.kentaro.night);
});
test('game CGs use the exact two user-supplied files and character assets use revised portraits',async()=>{
 const characters=['mira','tobi'];
 // Project snapshots record expected hashes so checks also work after clipboard files disappear.
 const hashes=JSON.parse(await readFile(new URL('../docs/world/secret-cg-hashes.json',import.meta.url),'utf8'));
 for(const who of characters){const bytes=await readFile(new URL(`../public/assets/cg/cg-secret-${who}-reunion-user.png`,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),hashes[who]);}
 const chars=JSON.parse(await readFile(new URL('../src/content/characters.json',import.meta.url),'utf8'));for(const who of ['tobi','mira'])assert.match(chars[who].variants.fantasy.neutral,/-v2\.png$/);
});
test('all menu quest/role previews are isolated, valid and preserve role restrictions',()=>{
 const rows=[['first-wages','kentaro',true],['first-wages','natsumi',true],['busy-inn-night','kentaro',false],['busy-inn-night','natsumi',false],['busy-inn-night','kentaro',true],['busy-inn-night','natsumi',true],['windowsill-herbs','natsumi',false],['carpenter-workbench','kentaro',false],['keep-the-promise','kentaro',false],['keep-the-promise','natsumi',false],['keep-the-promise','kentaro',true],['keep-the-promise','natsumi',true]];const keys=new Set();
 for(const row of rows){const s=createQuestPreview(config,...row);validateWorld(s,config);assert.equal(s.preview,true);assert.equal(s.previewKind,'quest');assert.ok(!keys.has(previewStorageKey(s)));keys.add(previewStorageKey(s));if(s.pending)assert.equal(s.pending.actor,row[1]);}
 assert.throws(()=>createQuestPreview(config,'windowsill-herbs','kentaro'));assert.throws(()=>createQuestPreview(config,'carpenter-workbench','natsumi'));assert.equal(previewStorageKey({previewKind:'inn'}),'yamada-nishi:inn-preview');assert.equal(previewStorageKey({}),'yamada-nishi:world-preview');
});
