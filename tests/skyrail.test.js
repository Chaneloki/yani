import test from 'node:test';import assert from 'node:assert/strict';import {SkyrailRescue,RUNES} from '../src/minigames/skyrail.js';
const tick=(g,n,input)=>{for(let i=0;i<n;i++)g.update(.05,input);};
const waitForPulse=g=>{let i=0;while(!g.pulseOpen){g.update(.05);assert.ok(i++<60);}};
test('hero needs continued correction through changing wind, then release completes rescue',()=>{const g=new SkyrailRescue('kentaro',{random:()=>.5});let gusts=0;
 for(let i=0;i<1000&&!g.ready;i++){if(g.windActive)gusts++;g.update(.05,{brake:true,left:g.alignment>3,right:g.alignment< -3});}
 assert.ok(gusts>0);assert.equal(g.ready,true);assert.equal(g.phase,'playing');g.update(.05,{});assert.equal(g.phase,'success');});
test('holding without reacting loses alignment; wind has advance warning',()=>{const g=new SkyrailRescue('kentaro',{random:()=>.8});g.alignment=0;tick(g,25,{brake:true});assert.equal(g.windWarning,true);tick(g,200,{brake:true});assert.ok(Math.abs(g.alignment)>12);assert.equal(g.ready,false);});
test('background delays cannot skip progress and early release is recoverable',()=>{const g=new SkyrailRescue('kentaro',{random:()=>.5});g.alignment=0;g.update(100,{brake:true});assert.ok(g.progress<.02);g.update(.05,{});assert.equal(g.phase,'playing');});
test('witch must observe random route, pulse timing and three separate repair rounds',()=>{const g=new SkyrailRescue('natsumi',{random:()=>.1});assert.notDeepEqual(g.route,[0,1,2,3]);assert.equal(g.cast(),false);tick(g,14);g.pulseActive=false;g.pulseRemaining=1;assert.equal(g.connect(g.nextRune),false);assert.equal(g.mistakes,1);
 waitForPulse(g);const wrong=[1,2,3].find(i=>i!==g.nextRune);assert.equal(g.connect(wrong),false);assert.equal(g.mistakes,2);
 for(let i=0;i<9;i++){waitForPulse(g);assert.ok(g.connect(g.nextRune));assert.ok(g.progress<=1);}
 assert.equal(g.ready,true);assert.equal(g.round,3);assert.equal(g.progress,1);assert.equal(g.connect(4),false);assert.equal(g.phase,'playing');assert.ok(g.cast());assert.equal(g.phase,'success');});
test('witch can resume a drag at the last linked rune and route variations differ',()=>{const g=new SkyrailRescue('natsumi',{random:()=>.2});waitForPulse(g);const first=RUNES[g.route[0]],next=RUNES[g.nextRune];assert.ok(g.beginTrace(first.x,first.y));assert.ok(g.trace(next.x,next.y));g.endTrace();assert.equal(g.trace(next.x,next.y),false);const anchor=RUNES[g.route[g.connected-1]];assert.ok(g.beginTrace(anchor.x,anchor.y));assert.notDeepEqual(g.route,new SkyrailRescue('natsumi',{random:()=>.9}).route);});
test('role validation prevents unsupported controls',()=>{assert.throws(()=>new SkyrailRescue('other'));const g=new SkyrailRescue('kentaro');assert.equal(g.connect(1),false);assert.equal(g.beginTrace(12,70),false);assert.equal(g.cast(),false);});
