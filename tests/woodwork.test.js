import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Woodwork,WOOD_LEVELS,validateWoodwork} from '../src/world/woodwork.js';
import {VillageLife,createWorld,validateWorld} from '../src/world/world-engine.js';
const config=JSON.parse(await readFile(new URL('../src/content/world.json',import.meta.url),'utf8'));
const story=JSON.parse(await readFile(new URL('../src/content/quests/carpenter-workbench.json',import.meta.url),'utf8'));
function play(g){for(let i=0;i<30000&&g.s.phase==='playing';i++){const c=g.core;g.update(.05,{left:g.reversed?c.alignment< -1:c.alignment>1,right:g.reversed?c.alignment>1:c.alignment< -1,brake:!c.ready});}assert.equal(g.s.phase,'success');return g;}
for(const level of Object.keys(WOOD_LEVELS))test(`existing Kentaro controls finish woodwork ${level} by releasing at full progress`,()=>{const g=new Woodwork(null,{level,seed:8243,skill:true});assert.equal(g.core.constructor.name,'SkyrailRescue');play(g);assert.equal(g.core.progress,1);validateWoodwork(g.snapshot());});
test('skill adds optional analysis and a wider, lighter-load alternative without extra input rules',()=>{const g=new Woodwork(null,{level:'hard'});assert.throws(()=>g.analyze(),/學會/);const skilled=new Woodwork(null,{level:'hard',skill:true});skilled.analyze();assert.equal(skilled.s.analyzing,true);const tolerance=skilled.tolerance,force=skilled.core.rules.windStrengthMin;skilled.brace();assert.ok(skilled.tolerance>tolerance);assert.ok(skilled.core.rules.windStrengthMin<force);assert.equal(skilled.core.rules.alignmentTolerance,skilled.tolerance);play(skilled);});
test('random mechanics and in-progress skill choices restore exactly',()=>{const g=new Woodwork(null,{skill:true});g.analyze();g.brace();for(let i=0;i<20;i++)g.update(.05,{left:true,brake:true});const restored=new Woodwork(g.snapshot());assert.deepEqual(restored.snapshot(),g.snapshot());for(let i=0;i<20;i++){const input={right:true};g.update(.05,input);restored.update(.05,input);}assert.deepEqual(restored.snapshot(),g.snapshot());});
test('manuscript is preserved including its night scene; playable gap is after Karl offers to teach',async()=>{const text=await readFile(new URL('../docs/manuscripts/side-quest-04-carpenter-user.txt',import.meta.url),'utf8');let active=false,skip=false;const expected=[];for(const line of text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)){if(line==='木匠工作坊'){active=true;continue;}if(!active)continue;if(line==='支線獎勵'){skip=true;continue;}if(line==='四、旅舍・夜晚'){skip=false;continue;}if(line==='五、支線完成後的遊戲狀態')break;if(line==='三、麵包店前'||skip)continue;expected.push(line);}assert.deepEqual(story.scenes.flatMap(s=>s.lines.map(l=>l.text)),expected);assert.equal(story.scenes[0].lines.at(-1).text,'「好！請多多指教！」');assert.equal(story.scenes[1].lines[0].text,'山田將它收起，又重新打開。');for(const line of story.scenes.flatMap(s=>s.lines))assert.equal(!!line.speaker,line.text.startsWith('「'));});
test('optional Kentaro quest gates skill and repeat repairs behind completed gameplay and story, pays once',()=>{const w=createWorld(config);w.completed['first-wages']=2;w.period=1;const l=new VillageLife(config,w),task=config.tasks.find(t=>t.id==='carpenter-workbench'),repeat=config.tasks.find(t=>t.id==='workshop-repair');l.visit('square');assert.equal(l.available(task),false);l.select('kentaro');assert.equal(l.available(repeat),false);l.accept(task.id);l.visit('workshop');l.begin(task.id);assert.notEqual(l.state.pending.companion,'together');assert.throws(()=>l.complete());l.state.workshop.phase='learn';l.learnStructure();l.chooseWoodwork('easy');const g=new Woodwork(l.state.workshop.game);play(g);l.woodworkCheckpoint(g.snapshot());assert.throws(()=>l.complete(),/故事/);l.state.workshop.phase='settle';l.complete();assert.deepEqual(l.state.skills.kentaro,['structural-reading']);assert.equal(l.state.karlFamiliarity,1);assert.equal(l.available(task),false);validateWorld(l.snapshot(),config);assert.throws(()=>l.complete());l.state.period=0;l.visit('square');assert.equal(l.available(repeat),true);l.accept(repeat.id);l.visit('workshop');l.begin(repeat.id);l.chooseWoodwork('hard');assert.equal(l.state.workshop.game.skill,true);assert.equal(l.state.workshop.phase,'play');assert.ok(l.gate.every(g=>!g.id.includes('carpenter')));});

test('Karl teaches the skill before the challenge; learning alone does not unlock repeat work or finish the story',()=>{
 const w=createWorld(config);w.completed['first-wages']=2;w.period=1;w.controlled='kentaro';const l=new VillageLife(config,w);
 l.visit('square');l.accept('carpenter-workbench');l.visit('workshop');l.begin('carpenter-workbench');assert.throws(()=>l.learnStructure(),/卡爾/);
 l.state.workshop.phase='choose';assert.throws(()=>l.chooseWoodwork('easy'),/卡爾/);l.state.workshop.phase='learn';l.learnStructure();assert.ok(l.state.skills.kentaro.includes('structural-reading'));assert.equal(l.state.completed['carpenter-workbench'],undefined);assert.equal(l.available(config.tasks.find(t=>t.id==='workshop-repair')),false);l.chooseWoodwork('easy');assert.equal(l.state.workshop.game.skill,true);assert.throws(()=>l.complete());
});


test('left and right reverse through the same mapping for keyboard and touch; hold is unchanged',()=>{
 for(const reversed of [false,true])for(const side of ['left','right']){
  const g=new Woodwork(null,{skill:true});g.s.reversal={phase:reversed?'reversed':'normal',remaining:99,cycles:0};g.core.alignment=0;g.core.windIn=99;g.core.driftTarget=g.core.drift=0;g.core.driftIn=99;
  const input={[side]:true,brake:true};g.update(.05,input);assert.equal(Math.sign(g.core.alignment),(side==='left'?-1:1)*(reversed?-1:1));assert.equal(g.core.brake,true);assert.deepEqual(input,{[side]:true,brake:true});
 }
});
test('warning precedes reversal without changing inputs early; restoration returns the original mapping',()=>{
 const g=new Woodwork(null,{skill:true});g.s.reversal={phase:'normal',remaining:.01,cycles:0};g.update(.02,{});assert.equal(g.s.reversal.phase,'warning');assert.equal(g.reversed,false);assert.equal(g.mapInput({left:true}).left,true);
 for(let i=0;i<24;i++)g.update(.05,{});assert.equal(g.s.reversal.phase,'reversed');assert.equal(g.s.reversal.cycles,1);assert.equal(g.mapInput({left:true}).right,true);
 g.s.reversal.remaining=.01;g.update(.02,{});assert.equal(g.s.reversal.phase,'restore');assert.equal(g.mapInput({left:true}).left,true);for(let i=0;i<21;i++)g.update(.05,{});assert.equal(g.s.reversal.phase,'normal');
});
test('reversal repeats and preserves its exact countdown and seed across save/load',()=>{
 const g=new Woodwork(null,{skill:true,seed:82});for(let i=0;i<300;i++)g.update(.05,{});assert.ok(g.s.reversal.cycles>=1);const restored=new Woodwork(g.snapshot());for(let i=0;i<400;i++){g.update(.05,{});restored.update(.05,{});}assert.deepEqual(restored.snapshot(),g.snapshot());assert.ok(g.s.reversal.cycles>1);
});
test('structural reading forecasts a reversal but does not hide or cancel the actual input change',()=>{
 const g=new Woodwork(null,{skill:true});g.s.reversal.remaining=.8;assert.equal(g.forecast,false);g.analyze();assert.equal(g.forecast,true);g.s.reversal.phase='reversed';assert.equal(g.mapInput({left:true}).right,true);
});
test('old joint-selection snapshots migrate without keeping a blocked-progress condition',()=>{
 const g=new Woodwork(null,{skill:true});const saved=g.snapshot();delete saved.reversal;saved.link={round:0,engaged:true,anchor:'left',target:'right',hold:0};saved.core.progress=.5;const restored=new Woodwork(saved);assert.equal(restored.s.link,undefined);assert.equal(restored.core.progress,.5);assert.equal(restored.s.reversal.phase,'normal');
});
