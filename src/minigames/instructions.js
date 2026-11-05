export const SKYRAIL_GUIDE={id:'skyrail-rescue',version:1,title:'列車協力救援',updated:'基本操作、陣風修正及三段符文共鳴'};
export class InstructionPreferences {
 constructor(storage){this.storage=storage;this.key='yamada-nishi:instructions:v1';this.memory={};try{const data=JSON.parse(storage?.getItem(this.key)||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))this.memory=data;}catch{}}
 state(guide){const saved=this.memory[guide.id];return {ask:!saved?.offered,updated:!!saved?.offered&&!(Number(saved.version)>=guide.version)};}
 acknowledge(guide){this.memory[guide.id]={offered:true,version:guide.version};try{this.storage?.setItem(this.key,JSON.stringify(this.memory));}catch{}}
}
// Stage-specific rules can grow without coupling difficulty to presentation or saves.
export const SKYRAIL_RULES=Object.freeze({id:'skyrail-01',windLead:.8,windGapMin:1.5,windGapRange:1.2,windStrengthMin:16,windStrengthRange:8,repairRate:.115,alignmentTolerance:12,magicRounds:3,pulseWindowMin:.7,pulseWindowRange:.55,pulseGapMin:.4,pulseGapRange:.6});
