import test from 'node:test';
import assert from 'node:assert/strict';
import { Typewriter } from '../src/ui/typewriter.js';
function fixture(){let id=0;const jobs=new Map();const writer=new Typewriter({schedule:f=>{jobs.set(++id,f);return id;},unschedule:id=>jobs.delete(id)});return {writer,jobs,tick(){const [key,fn]=jobs.entries().next().value; jobs.delete(key);fn();}};}
test('reveals Chinese and emoji by grapheme, completing only once',()=>{
 const f=fixture();let text,done=0;
 f.writer.start('你👩‍🔧好',t=>text=t,()=>done++);assert.equal(text,'');assert.equal(f.writer.typing,true);
 f.tick();assert.equal(text,'你');f.tick();assert.equal(text,'你👩‍🔧');f.tick();assert.equal(text,'你👩‍🔧好');
 assert.equal(done,1);assert.equal(f.writer.typing,false);assert.equal(f.jobs.size,0);
});
test('first click reveals full text without advancing; next click advances',()=>{
 const f=fixture();let text,advances=0;
 f.writer.start('尚未顯示完的句子。',t=>text=t);
 const click=()=>{if(f.writer.typing){f.writer.finish();return;}advances++;};
 f.tick();click();assert.equal(text,'尚未顯示完的句子。');assert.equal(advances,0);assert.equal(f.jobs.size,0);
 click();assert.equal(advances,1);
});
test('new page and cancellation invalidate stale callbacks and reduced motion shows all immediately',()=>{
 const f=fixture();let text,done=0;
 f.writer.start('舊文字',t=>text=t);const stale=[...f.jobs.values()][0];
 f.writer.start('新文字',t=>text=t,()=>done++);stale();assert.equal(text,'');f.tick();assert.equal(text,'新');
 f.writer.cancel();assert.equal(f.jobs.size,0);assert.equal(done,0);
 f.writer.start('立即顯示',t=>text=t,()=>done++,true);assert.equal(text,'立即顯示');assert.equal(done,1);assert.equal(f.writer.typing,false);
});

test('default timer callbacks run with browser-compatible function wrappers',async()=>{
 const writer=new Typewriter({delay:1});let text;
 await new Promise(resolve=>writer.start('你好',t=>text=t,resolve));
 assert.equal(text,'你好');assert.equal(writer.typing,false);
});
