export class HoldToAdvance {
 constructor({step,canRun=()=>true,onActive=()=>{},schedule=(fn,ms)=>setTimeout(fn,ms),unschedule=id=>clearTimeout(id),delay=450,interval=160}){Object.assign(this,{step,canRun,onActive,schedule,unschedule,delay,interval});this.timer=null;this.pressed=false;this.active=false;this.generation=0;}
 start(){if(this.pressed||!this.canRun())return;this.pressed=true;const generation=++this.generation;const tick=()=>{this.timer=null;if(!this.pressed||generation!==this.generation)return;if(!this.canRun()){this.stop();return;}if(!this.active){this.active=true;this.onActive(true);}if(this.step()===false){this.stop();return;}if(this.pressed&&generation===this.generation)this.timer=this.schedule(tick,this.interval);};this.timer=this.schedule(tick,this.delay);}
 stop(){this.generation++;this.pressed=false;if(this.timer!==null)this.unschedule(this.timer);this.timer=null;if(this.active){this.active=false;this.onActive(false);}}
}
