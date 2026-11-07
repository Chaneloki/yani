import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VillageLife,createWorld,validateWorld} from '../src/world/world-engine.js';
import {paginateText} from '../src/content/paginate-text.js';
const config=JSON.parse(await readFile(new URL('../src/content/world.json',import.meta.url),'utf8'));
const story=JSON.parse(await readFile(new URL('../src/content/quests/windowsill-herbs.json',import.meta.url),'utf8'));
test('herbs preserves every authored paragraph in order, with explicit speakers and short pages',async()=>{
 const raw=await readFile(new URL('../docs/manuscripts/side-quest-03-herbs-user.txt',import.meta.url),'utf8');
 const paragraphs=raw.split(/\n\s*\n/).map(s=>s.trim());const start=paragraphs.indexOf('午後的拜訪');const body=paragraphs.slice(start).filter(s=>!story.scenes.some(scene=>scene.title===s)&&!s.startsWith('支線完成後'));
 assert.deepEqual(story.scenes.flatMap(s=>s.lines.map(l=>l.text)),body);
 for(const line of story.scenes.flatMap(s=>s.lines)){assert.equal(!!line.speaker,line.text.startsWith('「'));assert.ok(paginateText(line.text).length);}
 assert.equal(story.scenes.length,4);
});
test('herbs is an optional Natsumi-only board quest, any period, single settlement, no minigame or mainline gate',()=>{
 for(const period of [0,1,2]){
 const w=createWorld(config);w.completed['first-wages']=2;w.period=period;const l=new VillageLife(config,w),task=config.tasks.find(t=>t.id===story.id);
 assert.throws(()=>l.accept(story.id),/廣場/);l.visit('square');l.select('kentaro');assert.equal(l.available(task),false);assert.throws(()=>l.accept(story.id));l.select('natsumi');l.accept(story.id);l.invite();l.visit('herbalist');l.begin(story.id);assert.notEqual(l.state.pending.companion,'together');assert.throws(()=>l.complete(),/讀完/);
 l.state.herbsStory.page=5;const resumed=new VillageLife(config,l.snapshot());assert.equal(resumed.state.herbsStory.page,5);resumed.state.herbsStory.ready=true;resumed.complete();assert.equal(resumed.state.aymeFamiliarity,1);assert.equal(resumed.state.herbsNotes.length,2);assert.equal(resumed.available(task),false);assert.ok(resumed.gate.every(g=>!g.id.includes('herbs')));validateWorld(resumed.snapshot(),config);assert.throws(()=>resumed.complete());
 }
});

test('generated cottage artwork follows rain and indoor transitions without changing authored text',async()=>{
 const lines=story.scenes.flatMap(s=>s.lines);
 const first=lines[0];assert.match(first.background,/cottage-day/);assert.equal(first.weather,'clear');
 const rain=lines.find(l=>l.text.includes('幾顆雨點落在窗台上'));assert.equal(rain.weather,'rain');assert.match(rain.background,/cottage-day/);
 const tea=story.scenes.find(s=>s.id==='tea').lines[0];assert.match(tea.background,/interior-rain/);assert.equal(tea.weather,'clear');
 const stop=lines.find(l=>l.text.includes('窗外的雨已經停了'));assert.match(stop.background,/cottage-day/);assert.equal(stop.weather,'clear');
 for(const scene of story.scenes)for(const line of scene.lines){await readFile(new URL('../public/'+line.background.slice(2),import.meta.url));if(scene.id==='night')assert.match(line.background,/inn-room-night/);}
 const chars=JSON.parse(await readFile(new URL('../src/content/characters.json',import.meta.url),'utf8'));assert.match(chars.ayme.variants.fantasy.neutral,/ayme-herbalist-neutral/);
});
