import {SkyrailRescue} from '../minigames/skyrail.js';
export const WOOD_LEVELS={
 easy:{label:'輕鬆',tolerance:16,repairRate:.24,wind:13,gap:1.7},
 standard:{label:'標準',tolerance:11,repairRate:.19,wind:21,gap:1.2},
 hard:{label:'進階',tolerance:8,repairRate:.17,wind:28,gap:.9}
};
const check=(ok,message)=>{if(!ok)throw Error(message);};
export function validateWoodwork(s){
 check(s&&s.version===1&&Object.hasOwn(WOOD_LEVELS,s.level)&&['playing','success','inspect','adjust','test'].includes(s.phase),'維修進度無效');
 check(Number.isInteger(s.seed)&&s.seed>=0&&s.seed<=0xffffffff&&typeof s.skill==='boolean'&&typeof s.analyzing==='boolean'&&typeof s.braced==='boolean','維修技能資料無效');
 if(s.reversal)check(['normal','warning','reversed','restore'].includes(s.reversal.phase)&&Number.isFinite(s.reversal.remaining)&&s.reversal.remaining>=0&&Number.isSafeInteger(s.reversal.cycles)&&s.reversal.cycles>=0,'方向反轉紀錄無效');
 if(s.core)check(Number.isFinite(s.core.alignment)&&Math.abs(s.core.alignment)<=85&&Number.isFinite(s.core.progress)&&s.core.progress>=0&&s.core.progress<=1&&['playing','success'].includes(s.core.phase),'維修操作存檔無效');
 check(s.phase!=='success'||s.core?.phase==='success'&&s.core.progress===1,'維修尚未完成');return true;
}
// Stage adapter: retain the original Kentaro game, with occasional input reversal.
export class Woodwork{
 constructor(saved=null,{level='standard',skill=false,seed=541921}={}){
  this.s=saved?structuredClone(saved):{version:1,phase:'playing',level,skill,seed:seed>>>0,analyzing:false,braced:false,core:null};
  if(['inspect','adjust','test'].includes(this.s.phase)){this.s.phase='playing';if(this.s.core?.phase==='success')this.s.core=null;}
  validateWoodwork(this.s);const priorSeed=this.s.seed;
  this.core=new SkyrailRescue('kentaro',{random:()=>this.random(),rules:this.rules});
  if(this.s.core){Object.assign(this.core,this.s.core);this.s.seed=priorSeed;this.core.rules={...this.core.rules,...this.rules};}this.core.random=()=>this.random();
  delete this.s.link;
  this.s.reversal??={phase:'normal',remaining:2.2+this.random()*.8,cycles:0};
 }
 random(){this.s.seed=(1664525*this.s.seed+1013904223)>>>0;return this.s.seed/4294967296;}
 get level(){return WOOD_LEVELS[this.s.level];}
 get tolerance(){return this.level.tolerance+(this.s.braced?5:0);}
 get rules(){return {alignmentTolerance:this.tolerance,repairRate:this.level.repairRate,windStrengthMin:this.level.wind*(this.s.braced?.65:1),windStrengthRange:8,windGapMin:this.level.gap,windGapRange:1.1};}
 get reversed(){return this.s.reversal.phase==='reversed';}
 get forecast(){return this.s.skill&&this.s.analyzing&&this.s.reversal.phase==='normal'&&this.s.reversal.remaining<=1.2;}
 analyze(){check(this.s.skill,'先向卡爾學會結構判讀');this.s.analyzing=!this.s.analyzing;}
 brace(){check(this.s.skill&&this.s.phase==='playing','結構判讀解鎖後可使用支撐分流');this.s.braced=!this.s.braced;Object.assign(this.core.rules,this.rules);this.core.windStrength=Math.min(this.core.windStrength,this.rules.windStrengthMin+8);}
 mapInput(input={}){return this.reversed?{...input,left:!!input.right,right:!!input.left}:{...input};}
 update(dt,input={}){
  if(this.s.phase!=='playing')return;
  dt=Math.max(0,Math.min(.05,dt));
  // Choose the mapping before advancing its timer. Displayed mapping and next-frame input agree.
  const mapped=this.mapInput(input),section=Math.min(2,Math.floor(this.core.progress*3));Object.assign(this.core.rules,this.rules,{windStrengthMin:this.rules.windStrengthMin*(1+section*.1)});
  this.core.update(dt,mapped);if(this.core.phase==='success'){this.s.phase='success';return;}
  const r=this.s.reversal;r.remaining=Math.max(0,r.remaining-dt);
  if(r.remaining<=0){if(r.phase==='normal'){r.phase='warning';r.remaining=1.15;}else if(r.phase==='warning'){r.phase='reversed';r.remaining=3.2+this.random()*1.4;r.cycles++;}else if(r.phase==='reversed'){r.phase='restore';r.remaining=1;}else{r.phase='normal';r.remaining=4.5+this.random()*2.5;}}
 }
 snapshot(){this.s.core=structuredClone(Object.fromEntries(Object.entries(this.core).filter(([,v])=>typeof v!=='function'&&v!==undefined)));return structuredClone(this.s);}
}
