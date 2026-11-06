import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VillageLife,createWorld,validateWorld} from '../src/world/world-engine.js';
import {readStory} from '../scripts/read-story.mjs';
import {NovelEngine} from '../src/engine/engine.js';
import {SaveStore} from '../src/engine/storage.js';
const config=JSON.parse(await readFile(new URL('../src/content/world.json',import.meta.url),'utf8'));
const make=()=>{const legacy={...config,tasks:config.tasks.map(t=>t.id==='sort'?{...t,activity:undefined,requiresCompleted:undefined,item:'sample-material'}:t),onboarding:{required:false},chapterGate:{...config.chapterGate,mode:'prototype'},balance:{...config.balance,startingCoins:20},tutorialTask:'sort'};return new VillageLife(legacy,createWorld(legacy,{seed:7}));};
function accept(life,id){life.visit(config.questBoard);life.accept(id);}
function doTask(life,id,location){if(config.tasks.find(t=>t.id===id).kind==='work')accept(life,id);life.visit(location);life.begin(id);return life.complete();}
test('free movement, inspection and character selection do not advance time',()=>{
 const l=make();l.visit('street');l.select('kentaro');assert.equal(l.state.period,0);assert.equal(l.state.coins,20);assert.equal(l.state.controlled,'kentaro');assert.throws(()=>l.visit('route-preview'),/尚未開放/);
});
test('one pending activity persists its random companion plan through reload and blocks a second action',()=>{
 const l=make();accept(l,'sort');l.visit('inn');const p=l.begin('sort');const restored=new VillageLife(l.config,l.snapshot());assert.deepEqual(restored.state.pending,p);assert.equal(restored.state.seed,l.state.seed);assert.throws(()=>restored.select('kentaro'),/先完成/);assert.throws(()=>restored.begin('sort'),/先完成/);assert.equal(restored.state.period,0);
 restored.complete();assert.equal(restored.state.period,1);const coins=restored.state.coins;assert.throws(()=>restored.complete(),/沒有進行/);assert.equal(restored.state.coins,coins);
});
test('successful work grants items, individual XP and cannot be repeated in the same day',()=>{
 const l=make();accept(l,'sort');l.visit('inn');const p=l.begin('sort');l.complete();assert.equal(l.state.inventory['sample-material'],1);assert.equal(l.state.xp.natsumi,2);assert.equal(l.state.coins,38+(p.companion==='work'?8:0));l.visit(config.questBoard);assert.throws(()=>l.accept('sort'),/委託處/);
});
test('abandoning spends the reserved period, never pays main reward and cannot reroll the same period',()=>{
 const l=make();accept(l,'sort');l.visit('inn');const p=l.begin('sort');l.complete({success:false});assert.equal(l.state.period,1);assert.equal(l.state.inventory['sample-material'],undefined);assert.equal(l.state.coins,20+(p.companion==='work'?8:0));assert.equal(l.state.completed.sort,undefined);l.begin('sort');assert.notEqual(l.state.pending.id,p.id);
});
test('cooperative tasks reserve both people, no extra companion wage, and observe opening times',()=>{
 const l=make();accept(l,'carry');l.visit('street');l.begin('carry');assert.equal(l.state.pending.companion,'together');l.complete();assert.equal(l.state.coins,44);assert.equal(l.state.xp.kentaro,2);assert.equal(l.state.xp.natsumi,2);l.wait();assert.equal(l.period,'evening');assert.equal(l.available(config.tasks.find(t=>t.id==='carry')),false);
});
test('sleep and an evening activity charge rent once, advance day, and reset repeatable tasks',()=>{
 const l=make();doTask(l,'sort','inn');l.wait();l.visit('inn');l.sleep();assert.equal(l.state.day,3);assert.equal(l.state.period,0);assert.equal(l.state.rentDebt,10);assert.equal(l.available(l.config.tasks.find(t=>t.id==='sort')),true);assert.throws(()=>l.sleep(),/晚上/);l.payRent();assert.equal(l.state.rentDebt,0);assert.equal(l.state.rentPayments,1);assert.throws(()=>l.payRent(),/沒有待付/);
 l.wait();l.wait();accept(l,'sort');l.visit('inn');l.begin('sort');l.complete();assert.equal(l.state.day,4);assert.equal(l.state.rentDebt,10);
});
test('rent debt and waiting do not fabricate income or strand a player with zero coins',()=>{
 const l=make();l.state.coins=0;l.wait();l.wait();l.sleep();assert.equal(l.state.coins,0);assert.equal(l.state.rentDebt,10);assert.throws(()=>l.payRent(),/不足/);doTask(l,'sort','inn');l.payRent();assert.equal(l.state.rentDebt,0);assert.ok(l.state.coins>=8);
});
test('route discovery and chapter preparation are separate; no story is unlocked by random income alone',()=>{
 const l=make();l.state.coins=100;assert.equal(l.ready,false);doTask(l,'route-a','street');assert.equal(l.unlocked(config.locations.at(-1)),false);doTask(l,'route-b','entrance');assert.equal(l.unlocked(config.locations.at(-1)),true);assert.equal(l.ready,false);l.visit('inn');l.sleep();l.payRent();assert.equal(l.ready,true);l.visit('route-preview');assert.equal(l.state.location,'route-preview');
});
test('old novel saves remain valid and new saves restore the pending world transaction without modifying raw data',async()=>{
 const story=await readStory(),e=new NovelEngine(story),data=new Map(),storage={setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)??null};const store=new SaveStore(story,storage);store.save('1',e.snapshot());assert.equal(store.load('1').state.world,undefined);
 const l=make();accept(l,'sort');l.visit('inn');l.begin('sort');e.state.world=l.snapshot();e.state.mode='world';store.save('2',e.snapshot());const raw=data.get(store.key('2'));assert.deepEqual(store.load('2').state.world.pending,l.state.pending);assert.equal(data.get(store.key('2')),raw);
 e.state.world.preview=true;assert.throws(()=>store.save('2',e.snapshot()),/試玩/);assert.equal(data.get(store.key('2')),raw);
});
test('malformed state and forged pending companion plans are rejected before payout',()=>{
 const w=createWorld(config);w.coins=-1;assert.throws(()=>validateWorld(w,config));const l=make();accept(l,'carry');l.visit('street');l.begin('carry');const forged=l.snapshot();forged.pending.companion='work';assert.throws(()=>new VillageLife(config,forged),/同行/);
});

test('quests are received only at the board; exploration has no acceptance requirement',()=>{const l=make();assert.throws(()=>l.accept('sort'),/委託處/);l.visit('street');assert.throws(()=>l.accept('carry'),/委託處/);assert.throws(()=>l.accept('route-a'),/委託處/);l.begin('route-a');l.complete();assert.ok(l.state.infos.includes('route-a'));});
test('interactive tutorial follows real actions, persists, and can be skipped without clearing progress',()=>{const l=make();l.startTutorial();l.select('kentaro');assert.equal(l.state.tutorial.step,1);l.visit(config.questBoard);assert.equal(l.state.tutorial.step,2);l.accept('sort');assert.equal(l.state.tutorial.step,3);l.visit('inn');assert.equal(l.state.tutorial.step,4);l.begin('sort');assert.equal(l.state.tutorial.step,5);const restored=new VillageLife(l.config,l.snapshot());restored.complete();assert.equal(restored.state.tutorial.status,'done');assert.equal(restored.state.period,1);restored.skipTutorial();assert.equal(restored.state.inventory['sample-material'],1);assert.equal(restored.state.tutorial.status,'skipped');});
