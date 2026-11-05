import {SKYRAIL_RULES} from './instructions.js';
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export const RUNES=[{x:12,y:70},{x:35,y:38},{x:61,y:58},{x:86,y:26}];
export class SkyrailRescue {
 constructor(role,{random=Math.random,rules={}}={}){
  if(!['kentaro','natsumi'].includes(role))throw Error('未知操作角色');
  this.rules={...SKYRAIL_RULES,...rules};
  for(const key of Object.keys(SKYRAIL_RULES).filter(k=>k!=='id'))if(!Number.isFinite(this.rules[key])||this.rules[key]<=0)throw Error(`無效關卡參數：${key}`);
  if(!Number.isInteger(this.rules.magicRounds))throw Error('無效符文關卡參數');
  this.random=random;this.role=role;this.phase='playing';this.alignment=-35+random()*70;this.progress=0;this.elapsed=0;this.brake=false;this.wasBrake=false;this.connected=1;this.tracing=false;this.ready=false;
  this.round=1;this.rounds=this.rules.magicRounds;this.mistakes=0;this.feedback='';this.feedbackUntil=0;this.pulseTime=0;this.pulseOffset=0;this.pulseActive=false;this.pulseRemaining=.6;this.driftTarget=(random()-.5)*8;this.drift=0;this.driftIn=.5+random();this.windIn=2;this.windDirection=random()<.5?-1:1;this.windStrength=this.rules.windStrengthMin+random()*this.rules.windStrengthRange;this.windWarning=false;this.windActive=false;this.setupRoute();
 }
 setupRoute(){const tail=[1,2,3];for(let i=2;i>0;i--){const j=Math.floor(this.random()*(i+1));[tail[i],tail[j]]=[tail[j],tail[i]];}this.route=[0,...tail];this.connected=1;this.tracing=false;this.roundPause=.45+this.random()*.4;this.pulseTime=0;this.pulseActive=false;this.pulseRemaining=this.rules.pulseGapMin+this.random()*this.rules.pulseGapRange;}
 get nextRune(){return this.route[this.connected];}
 get pulseOpen(){return this.roundPause<=0 && this.pulseActive;}
 get litRunes(){return this.route.slice(0,this.connected);}
 feedbackMessage(text){this.feedback=text;this.feedbackUntil=this.elapsed+1.2;}
 update(dt,input={}){
  if(this.phase!=='playing')return;
  dt=clamp(dt,0,.05);this.elapsed+=dt;if(this.elapsed>this.feedbackUntil)this.feedback='';
  if(this.role==='kentaro'){
   this.brake=!!input.brake;this.windIn-=dt;
   this.windWarning=this.windIn<this.rules.windLead && this.windIn>0;
   this.windActive=this.windIn<=0;
   if(this.windIn<=-.6){this.windIn=this.rules.windGapMin+this.random()*this.rules.windGapRange;this.windDirection=this.random()<.5?-1:1;this.windStrength=this.rules.windStrengthMin+this.random()*this.rules.windStrengthRange;this.windActive=false;}
   this.driftIn-=dt;if(this.driftIn<=0){this.driftTarget=(this.random()-.5)*9;this.driftIn=.45+this.random()*1.2;}this.drift+=(this.driftTarget-this.drift)*Math.min(1,dt*3);
   const direction=Number(!!input.right)-Number(!!input.left);
   const gust=this.windActive?this.windDirection*this.windStrength:this.drift;
   this.alignment=clamp(this.alignment+(direction*42+gust)*dt,-85,85);
   if(!this.ready){
    if(this.brake && Math.abs(this.alignment)<this.rules.alignmentTolerance)this.progress=clamp(this.progress+dt*this.rules.repairRate,0,1);
    else this.progress=clamp(this.progress-dt*(this.brake?.018:.055),0,1);
    this.ready=this.progress>=1;
   }
   if(this.ready && this.wasBrake && !this.brake)this.phase='success';
   this.wasBrake=this.brake;
  }else{
   this.brake=true;this.alignment+=(0-this.alignment)*Math.min(1,dt*2);this.roundPause=Math.max(0,this.roundPause-dt);this.pulseTime+=dt;if(this.roundPause<=0){this.pulseRemaining-=dt;if(this.pulseRemaining<=0){this.pulseActive=!this.pulseActive;this.pulseRemaining=this.pulseActive?this.rules.pulseWindowMin+this.random()*this.rules.pulseWindowRange:this.rules.pulseGapMin+this.random()*this.rules.pulseGapRange;}}
  }
 }
 beginTrace(x,y){if(this.phase!=='playing'||this.role!=='natsumi'||this.ready)return false;const start=RUNES[this.route[this.connected-1]];this.tracing=Math.hypot(x-start.x,y-start.y)<13;return this.tracing;}
 trace(x,y){if(!this.tracing)return false;const next=RUNES[this.nextRune];if(next&&Math.hypot(x-next.x,y-next.y)<13)return this.connect(this.nextRune);return false;}
 endTrace(){this.tracing=false;}
 connect(index){
  if(this.phase!=='playing'||this.role!=='natsumi'||this.ready||this.roundPause>0||index===this.route[this.connected-1])return false;
  if(index!==this.nextRune){this.mistakes++;this.feedbackMessage('魔力分散了，找出正在呼應的符文。');this.pulseRemaining+=.15;return false;}
  if(!this.pulseOpen){this.mistakes++;this.feedbackMessage('還未共鳴，等符文亮起再連接。');return false;}
  this.connected++;this.progress=((this.round-1)*3+this.connected-1)/(this.rounds*3);
  if(this.connected===RUNES.length){
   if(this.round===this.rounds){this.ready=true;this.tracing=false;this.feedbackMessage('軌道已接好，可以施法。');}
   else{this.round++;this.setupRoute();this.feedbackMessage('一段軌道已修復，下一組符文正在顯現。');}
  }else{this.pulseActive=false;this.pulseRemaining=this.rules.pulseGapMin+this.random()*this.rules.pulseGapRange;this.feedbackMessage('連接成功，等待下一枚符文回應。');}
  return true;
 }
 cast(){if(this.role==='natsumi'&&this.ready&&this.phase==='playing'){this.phase='success';return true;}return false;}
}
