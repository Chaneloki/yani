// One reveal per page. Injected timers keep cancellation and click behavior testable.
export class Typewriter {
  constructor({schedule=(fn,ms)=>setTimeout(fn,ms),unschedule=id=>clearTimeout(id),delay=32}={}) {
    this.schedule=schedule;this.unschedule=unschedule;this.delay=delay;this.timer=null;this.typing=false;this.generation=0;
  }
  cancel(){this.generation++;if(this.timer!==null)this.unschedule(this.timer);this.timer=null;this.typing=false;}
  start(text,write,complete=()=>{},instant=false){
    this.cancel();this.text=text;this.write=write;this.complete=complete;
    this.characters=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('zh-Hant',{granularity:'grapheme'}).segment(text)].map(s=>s.segment):Array.from(text);
    this.position=0;this.typing=this.characters.length>0;
    if(instant || !this.typing){this.finish();return;}
    write('');const generation=this.generation;
    const tick=()=>{
      if(generation!==this.generation)return;
      this.position++;write(this.characters.slice(0,this.position).join(''));
      if(this.position>=this.characters.length){this.timer=null;this.typing=false;complete();}
      else this.timer=this.schedule(tick,this.delay);
    };
    this.timer=this.schedule(tick,this.delay);
  }
  finish(){const active=this.typing;this.cancel();if(this.write){this.write(this.text);this.complete();}return active;}
}
