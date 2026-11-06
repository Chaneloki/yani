import {validateCargo} from './cargo-packing.js';
import {RopeSequence} from './rope-sequence.js';
import {SkyrailRescue} from '../minigames/skyrail.js';
export const DELIVERY_RULES=Object.freeze({windLead:.65,windGapMin:.95,windGapRange:.95,windStrengthMin:19,windStrengthRange:10,repairRate:.14,alignmentTolerance:10,magicRounds:3,pulseWindowMin:.5,pulseWindowRange:.3,pulseGapMin:.3,pulseGapRange:.55});
export const PRODUCE=[
 {id:'pumpkin',label:'南瓜',icon:'🎃',weight:3,level:0},
 {id:'roots',label:'根菜',icon:'🥔',weight:3,level:0},
 {id:'carrots',label:'紅蘿蔔',icon:'🥕',weight:2,level:1},
 {id:'cabbage',label:'高麗菜',icon:'🥬',weight:2,level:1},
 {id:'greens',label:'嫩葉菜',icon:'🌱',weight:1,level:2},
 {id:'herbs',label:'香草',icon:'🌿',weight:1,level:2}
];
const check=(ok,msg)=>{if(!ok)throw Error(msg);};
export const DELIVERY_PHASES=['board-story','pickup','pickup-story','packing','transport-first','wheel','transport-final','handoff','return','ending-story','reward','done'];
export function createDelivery(){return {phase:'board-story',page:0,packed:Array(6).fill(null),packingHelp:false,fixed:false,signed:false,transport:null};}
export function validateDelivery(d){
 check(d&&DELIVERY_PHASES.includes(d.phase)&&Number.isSafeInteger(d.page)&&d.page>=0,'送貨進度無效');
 check(Array.isArray(d.packed)&&d.packed.length===6,'貨箱資料無效');const ids=d.packed.filter(Boolean);check(new Set(ids).size===ids.length&&d.packed.every((id,i)=>!id||PRODUCE.some(p=>p.id===id&&(d.cargo||p.level===i%3))),'貨物放置無效');
 check(typeof d.fixed==='boolean'&&typeof d.signed==='boolean'&&typeof d.packingHelp==='boolean','送貨狀態無效');
 if(d.cargo)validateCargo(d.cargo);
 if(d.repair){const r=d.repair;check(Number.isFinite(r.angle)&&r.angle>=0&&r.angle<360&&Number.isFinite(r.target)&&r.target>=0&&r.target<360&&Number.isInteger(r.locks)&&r.locks>=0&&r.locks<=3,'輪軸操作存檔無效');}
 if(d.transport){check(['kentaro','natsumi'].includes(d.transport.role)&&Number.isInteger(d.transport.seed),'運送存檔無效');const g=d.transport.game;check(g&&['playing','success'].includes(g.phase)&&Number.isFinite(g.progress)&&g.progress>=0&&g.progress<=1&&Number.isFinite(g.alignment)&&Math.abs(g.alignment)<=85,'運送操作存檔無效');}
 return true;
}
export function packProduce(delivery,id,slot){check(delivery.phase==='packing','目前不是整理階段');const item=PRODUCE.find(p=>p.id===id);check(item&&Number.isInteger(slot)&&slot>=0&&slot<6,'未知貨物或位置');check(!delivery.packed.includes(id)&&!delivery.packed[slot],'貨物或位置已使用');check(item.level===slot%3,item.level===0?'較重的蔬菜先放底層。':item.level===2?'容易壓壞的放上層，別壓到香草。':'這筐放中層比較穩。');delivery.packed[slot]=id;return delivery.packed.every(Boolean);}
export class DeliveryCart {
 constructor(role,snapshot=null){
  this.role=role;this.seed=snapshot?.seed??194521;this.game=role==='kentaro'?new SkyrailRescue(role,{random:()=>this.random(),rules:DELIVERY_RULES}):new RopeSequence(()=>this.random());
  if(snapshot){check(snapshot.role===role,'運送角色不可中途切換');if(role==='natsumi'&&snapshot.game.model!=='rope-sequence'){this.game.round=Math.min(3,snapshot.game.round||1);this.game.setupRoute();}else Object.assign(this.game,structuredClone(snapshot.game));this.seed=snapshot.seed;this.game.random=()=>this.random();}
 }
 random(){this.seed=(1664525*this.seed+1013904223)>>>0;return this.seed/4294967296;}
 update(dt,input){this.game.update(dt,input);}
 get halfway(){return this.role==='kentaro'?this.game.progress>=.45:this.game.round>=2;}
 get complete(){return this.game.phase==='success';}
 snapshot(){const game=Object.fromEntries(Object.entries(this.game).filter(([,v])=>typeof v!=='function'));return {role:this.role,seed:this.seed,game:structuredClone(game)};}
}
