import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager, AUDIO_SETTINGS_KEY, readAudioSettings } from '../src/audio/audio-manager.js';
import { readStory } from '../scripts/read-story.mjs';
import { NovelEngine } from '../src/engine/engine.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};};
class FakeAudio {
 constructor(){this.paused=true;this.playCalls=0;this.currentTime=0;this.events={};}
 addEventListener(name,fn){this.events[name]=fn;}
 set src(value){this._src=value;this.currentTime=0;}
 get src(){return this._src;}
 removeAttribute(){this._src='';}
 pause(){this.paused=true;}
 async play(){this.playCalls++;if(this.failure)throw this.failure;this.paused=false;}
}
const assets={bgm:{warm:{src:'warm.mp3'},night:{src:'night.mp3'}},se:{tap:{src:'tap.wav'}}};
test('music waits for a gesture, loops, and does not restart on each line',async()=>{
 const a=new AudioManager(assets,memory(),()=>new FakeAudio());a.sync('warm');assert.equal(a.bgm.playCalls,0);
 await a.unlock();assert.equal(a.status,'playing');assert.equal(a.bgm.loop,true);
 a.bgm.currentTime=19;a.sync('warm');assert.equal(a.bgm.currentTime,19);assert.equal(a.bgm.playCalls,1);
 a.sync('night');await Promise.resolve();assert.equal(a.bgm.src,'night.mp3');assert.equal(a.bgm.currentTime,0);
 a.sync(null);assert.equal(a.bgm.paused,true);
});
test('BGM and SE volumes persist independently of story saves and pauses',async()=>{
 const storage=memory(),a=new AudioManager(assets,storage,()=>new FakeAudio());a.sync('warm');await a.unlock();
 a.setVolume('bgm',.25);a.setVolume('se',.9);assert.equal(a.bgm.volume,.25);
 await a.playSE('tap');assert.equal([...a.effects][0].volume,.9);
 a.setVolume('se',.3);assert.equal([...a.effects][0].volume,.3);assert.equal(a.bgm.volume,.25);
 await a.setEnabled(false);assert.equal(a.bgm.paused,true);
 const b=new AudioManager(assets,storage,()=>new FakeAudio());assert.deepEqual(b.settings,{bgmVolume:.25,seVolume:.3,bgmEnabled:false});
 b.sync('warm');await b.unlock();assert.equal(b.bgm.playCalls,0);
 await b.setEnabled(true);assert.equal(b.status,'playing');
});
test('invalid preferences, unavailable storage and denied playback are handled',async()=>{
 const storage=memory();storage.setItem(AUDIO_SETTINGS_KEY,'{');assert.equal(readAudioSettings(storage).bgmVolume,.5);
 storage.setItem(AUDIO_SETTINGS_KEY,JSON.stringify({bgmVolume:8,seVolume:-4,bgmEnabled:'bad'}));assert.deepEqual(readAudioSettings(storage),{bgmVolume:1,seVolume:0,bgmEnabled:true});
 const a=new AudioManager(assets,{getItem(){throw Error('blocked');},setItem(){throw Error('quota');}},()=>new FakeAudio());
 a.setVolume('bgm',.2);assert.equal(a.preferenceError,true);assert.equal(a.bgm.volume,.2);
 a.sync('warm');a.bgm.failure=Object.assign(Error('gesture'),{name:'NotAllowedError'});await a.unlock();assert.equal(a.status,'blocked');
 delete a.bgm.failure;await a.unlock();assert.equal(a.status,'playing');
});
test('scene and node music restore deterministically from story position',async()=>{
 const story=await readStory(),e=new NovelEngine(story);assert.equal(e.stage.bgm,'cheerful-school-days');
 e.go('prologue.natsumi.invitation');
 for(let i=0;!e.node.source.lines.includes(92) && i<30;i++)e.advance();
 assert.equal(e.stage.bgm,'playful-comedy');assert.equal(new NovelEngine(story,e.snapshot()).stage.bgm,'playful-comedy');
 e.go('prologue.kentaro.night');assert.equal(e.stage.bgm,'peaceful-night');
});
function fadeClock(){let time=0,id=0;const jobs=new Map();return {now:()=>time,schedule:fn=>{jobs.set(++id,fn);return id;},unschedule:id=>jobs.delete(id),tick(ms){time+=ms;const pending=[...jobs.values()];jobs.clear();for(const fn of pending)fn();},jobs};}
test('BGM crossfade blends two tracks, respects volume changes and releases outgoing audio',async()=>{
 const clock=fadeClock(),a=new AudioManager(assets,memory(),()=>new FakeAudio(),{duration:900,...clock});a.sync('warm');await a.unlock();const old=a.bgm;old.currentTime=12;a.sync('night');await Promise.resolve();await Promise.resolve();assert.equal(old.paused,false);assert.equal(a.bgm.volume,0);clock.tick(450);assert.equal(old.volume,.25);assert.equal(a.bgm.volume,.25);a.setVolume('bgm',.2);assert.equal(old.volume,.1);assert.equal(a.bgm.volume,.1);clock.tick(450);assert.equal(old.paused,true);assert.equal(a.outgoing,null);assert.equal(a.bgm.volume,.2);a.bgm.currentTime=7;a.sync('night');assert.equal(a.bgm.currentTime,7);
});
test('instant skipping and muting cancel pending fades without stale callbacks restarting sound',async()=>{
 const clock=fadeClock(),a=new AudioManager(assets,memory(),()=>new FakeAudio(),{duration:900,...clock});a.sync('warm');await a.unlock();const original=a.bgm;a.sync('night');await Promise.resolve();await Promise.resolve();clock.tick(200);a.sync('warm',{instant:true});await Promise.resolve();assert.equal(original.paused,true);assert.equal(a.outgoing,null);assert.equal(a.bgm.volume,.5);assert.equal(clock.jobs.size,0);a.sync('night');await Promise.resolve();await Promise.resolve();await a.setEnabled(false);clock.tick(1000);assert.equal(a.bgm.paused,true);assert.equal(a.outgoing,null);assert.equal(a.status,'paused');await a.setEnabled(true);assert.equal(a.bgm.paused,false);
});
test('SE waits for gesture, obeys mute, cleans up, and stops pending playback safely',async()=>{
 const a=new AudioManager(assets,memory(),()=>new FakeAudio());
 assert.equal(await a.playSE('tap'),false);await a.unlock();
 assert.equal(await a.playSE('unknown'),false);a.setVolume('se',0);assert.equal(await a.playSE('tap'),false);
 a.setVolume('se',.4);assert.equal(await a.playSE('tap'),true);const clip=[...a.effects][0];clip.events.ended();assert.equal(a.effects.size,0);
 let resolve;const late=new FakeAudio();late.play=()=>new Promise(r=>{resolve=()=>{late.paused=false;r();};});a.createAudio=()=>late;
 const pending=a.playSE('tap');a.stopSE();resolve();assert.equal(await pending,false);assert.equal(late.paused,true);assert.equal(a.effects.size,0);
});
