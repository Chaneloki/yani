import {createInn,validateInn,InnShift} from './inn-game.js';
import {CargoPacking} from './cargo-packing.js';
import {createDelivery,validateDelivery,packProduce} from './first-wages.js';
export const PERIODS=['morning','afternoon','evening'];
export const PERIOD_LABELS={morning:'早上',afternoon:'下午',evening:'晚上'};
const people=['kentaro','natsumi'];
const clone=v=>structuredClone(v);
const check=(ok,message)=>{if(!ok)throw Error(message);};
export function validateWorldConfig(c){
 check(c&&c.prototype===true&&c.map?.src&&Array.isArray(c.locations)&&Array.isArray(c.tasks),'生活資料格式無效');
 for(const key of ['startingCoins','rent','travelGoal','companionWage'])check(Number.isSafeInteger(c.balance?.[key])&&c.balance[key]>=0,'生活測試金額無效');
 const locations=new Set(),tasks=new Set(),infos=new Set();
 for(const l of c.locations){check(typeof l.id==='string'&&!locations.has(l.id)&&l.label&&Number.isFinite(l.x)&&l.x>=0&&l.x<=100&&Number.isFinite(l.y)&&l.y>=0&&l.y<=100,'地圖地點無效');locations.add(l.id);}
 check(locations.has(c.questBoard)&&locations.has('inn'),'委託處或旅舍不存在');
 for(const t of c.tasks){check(typeof t.id==='string'&&!['__proto__','constructor','prototype'].includes(t.id)&&!tasks.has(t.id)&&locations.has(t.location)&&['work','explore'].includes(t.kind)&&Array.isArray(t.slots)&&t.slots.length&&t.slots.every(p=>PERIODS.includes(p)),'活動資料無效');tasks.add(t.id);if(t.info)infos.add(t.info);for(const key of ['coins','xp'])if(t[key]!==undefined)check(Number.isSafeInteger(t[key])&&t[key]>=0,'活動獎勵無效');if(t.item)check(Object.hasOwn(c.items||{},t.item),'活動物品不存在');}
 check(tasks.has(c.tutorialTask||'sort')&&Array.isArray(c.chapterGate?.infos)&&c.chapterGate.infos.every(i=>infos.has(i))&&Number.isSafeInteger(c.chapterGate.rentPayments)&&c.chapterGate.rentPayments>=0,'主線準備或教程任務無效');
 for(const l of c.locations)if(l.requires)check(Array.isArray(l.requires)&&l.requires.every(i=>infos.has(i)),'地圖解鎖情報不存在');
 return true;
}
export function createWorld(config,{preview=false,seed=Math.floor(Math.random()*0xffffffff)}={}){
 return {version:1,unlocked:true,preview,day:2,period:0,location:'inn',controlled:'natsumi',coins:config.balance.startingCoins,rentDebt:config.onboarding?.required?config.balance.rent:0,rentPayments:0,inventory:{},xp:{kentaro:0,natsumi:0},infos:[],accepted:[],completed:{},pending:null,receipts:[],journal:[],tutorial:{status:'offer',step:0,celebrated:false},onboardingExempt:false,inviteCompanion:false,sharedExperiences:[],seed:seed>>>0};
}
export function validateWorld(w,config){
 check(w&&w.version===1&&w.unlocked===true,'生活存檔版本不相容');
 for(const key of ['day','period','coins','rentDebt','rentPayments','seed'])check(Number.isSafeInteger(w[key])&&w[key]>=0,`生活數值無效：${key}`);
 check(w.day>=2&&w.period<3&&w.seed<=0xffffffff&&people.includes(w.controlled),'生活時段／角色無效');
 check(config.locations.some(l=>l.id===w.location),'未知生活地點');
 check(typeof w.preview==='boolean','試玩標記無效');
 for(const key of ['infos','accepted','receipts','journal'])check(Array.isArray(w[key])&&w[key].length<=500,'生活紀錄無效');
 check(w.infos.every(i=>config.tasks.some(t=>t.info===i))&&w.accepted.every(i=>config.tasks.some(t=>t.id===i)),'未知任務或情報');
 for(const [id,count] of Object.entries(w.inventory||{}))check(Object.hasOwn(config.items,id)&&Number.isSafeInteger(count)&&count>=0,'背包物品無效');
 check(w.xp&&people.every(p=>Number.isSafeInteger(w.xp[p])&&w.xp[p]>=0),'熟練度無效');
 check(w.completed&&Object.entries(w.completed).every(([id,day])=>config.tasks.some(t=>t.id===id)&&Number.isSafeInteger(day)&&day>=2&&day<=w.day),'任務紀錄無效');
 check(w.receipts.every(r=>typeof r==='string')&&w.journal.every(r=>r&&typeof r.text==='string'&&Number.isInteger(r.day)),'結算紀錄無效');
 if(w.onboardingExempt!==undefined)check(typeof w.onboardingExempt==='boolean','新手進度標記無效');
 if(w.inviteCompanion!==undefined)check(typeof w.inviteCompanion==='boolean','同行邀請無效');
 if(w.sharedExperiences!==undefined)check(Array.isArray(w.sharedExperiences)&&w.sharedExperiences.every(id=>typeof id==='string'),'共同經歷無效');
 if(w.mainline!==undefined)check(w.mainline&&typeof w.mainline==='object'&&!Array.isArray(w.mainline)&&Object.entries(w.mainline).every(([id,v])=>['northRoadConfirmed','orenVerifiedRoute'].includes(id)&&typeof v==='boolean'),'主線情報無效');
 if(w.innShift)validateInn(w.innShift);
 if(w.pending&&['busy-inn-night','sort'].includes(w.pending.task)&&w.innShift)check(w.innShift.actor===w.pending.actor&&w.innShift.variant===(w.pending.companion==='together'?'together':w.pending.actor),'旅舍路線與同行紀錄不符');
 if(w.innEncounters!==undefined)check(w.innEncounters?.family?.helped===true&&Number.isFinite(w.innEncounters.family.quality)&&w.innEncounters?.merchant?.reservationKept===true,'旅客相遇紀錄無效');
 if(w.delivery)validateDelivery(w.delivery);
 if(w.pending?.task==='first-wages')check(w.delivery&&['pickup-story','packing','transport-first','wheel','transport-final','handoff','return','ending-story','reward'].includes(w.delivery.phase),'送貨活動缺少有效階段');
 if(w.tutorial)check(['offer','active','done','skipped'].includes(w.tutorial.status)&&Number.isInteger(w.tutorial.step)&&w.tutorial.step>=0&&w.tutorial.step<=6&&typeof w.tutorial.celebrated==='boolean','新手教學紀錄無效');
 if(w.pending){const p=w.pending,t=config.tasks.find(t=>t.id===p.task);check(t&&people.includes(p.actor)&&p.actor===w.controlled&&['together','work','practice'].includes(p.companion)&&p.day===w.day&&p.period===w.period&&p.id===`${w.day}:${w.period}`,'進行中的活動無效');check(!t.together||p.companion==='together','協力任務必須同行');}
 return true;
}
export class VillageLife {
 constructor(config,state){validateWorldConfig(config);this.config=config;validateWorld(state,config);this.state=clone(state);this.state.tutorial??={status:this.state.pending||this.state.completed.sort?'skipped':'offer',step:0,celebrated:false};this.state.onboardingExempt??=(!this.state.completed['first-wages']&&(this.state.day>2||this.state.period>0));if(this.state.tutorial.status==='active'&&!this.state.tutorial.task&&this.state.pending?.task==='sort')this.state.tutorial.task='sort';}
 snapshot(){return clone(this.state);}
 get freePlay(){return !this.config.onboarding?.required||this.state.onboardingExempt===true||!!this.state.completed['first-wages'];}
 get period(){return PERIODS[this.state.period];}
 get tutorialTask(){return this.state.tutorial.task||this.config.tutorialTask||'sort';}
 get companion(){return this.state.controlled==='kentaro'?'natsumi':'kentaro';}
 log(text){this.state.journal.push({day:this.state.day,period:this.period,text});this.state.journal=this.state.journal.slice(-100);}
 idle(){check(!this.state.pending,'先完成或結束目前活動');}
 random(){this.state.seed=(1664525*this.state.seed+1013904223)>>>0;return this.state.seed/4294967296;}
 available(task){if(task.requiresCompleted&&!this.state.completed[task.requiresCompleted])return false;return (this.freePlay||task.id==='first-wages')&&task.slots.includes(this.period)&&(!this.state.completed[task.id]||(task.repeatable&&this.state.completed[task.id]<this.state.day));}
 unlocked(location){return !location.requires||location.requires.every(id=>this.state.infos.includes(id));}
 visit(id){if(this.state.pending?.task==='first-wages'){const dest=this.state.delivery.phase==='return'?'garden':this.state.delivery.phase==='handoff'?'inn':null;check(id===dest,'先完成當前送貨階段');}else this.idle();const l=this.config.locations.find(l=>l.id===id);check(l&&this.unlocked(l),'此路線尚未開放');this.state.location=id;if(this.state.pending?.task==='first-wages'&&this.state.delivery.phase==='return'&&id==='garden'){this.state.delivery.phase='ending-story';this.state.delivery.page=0;}if((this.state.tutorial.status==='active')&&((this.state.tutorial.step===1&&id===this.config.questBoard)||(this.state.tutorial.step===3&&id===this.config.tasks.find(t=>t.id===this.tutorialTask).location)))this.state.tutorial.step++;}
 select(actor){this.idle();check(people.includes(actor),'未知角色');this.state.controlled=actor;if(this.state.tutorial.status==='active'&&this.state.tutorial.step===0)this.state.tutorial.step=1;}
 accept(id){this.idle();const t=this.config.tasks.find(t=>t.id===id);check(t&&t.kind==='work'&&this.state.location===this.config.questBoard&&this.available(t),'請到村中廣場委託處接取任務');if(!this.state.accepted.includes(id))this.state.accepted.push(id);if(id==='first-wages'&&!this.state.delivery)this.state.delivery=createDelivery();if(this.state.tutorial.status==='active'&&this.state.tutorial.step===2&&id===this.tutorialTask)this.state.tutorial.step=3;}
 begin(id){this.idle();const t=this.config.tasks.find(t=>t.id===id);check(t&&t.location===this.state.location&&this.available(t)&&(t.kind!=='work'||this.state.accepted.includes(id)),'委託尚未接取或現在不能進行');
  if(id==='first-wages')check(this.state.delivery?.phase==='pickup','先讀完公告板的委託故事');
  const r=this.random();this.state.pending={id:`${this.state.day}:${this.state.period}`,task:id,actor:this.state.controlled,companion:t.together||this.state.inviteCompanion?'together':r<.45?'together':r<.75?'work':'practice',day:this.state.day,period:this.state.period};this.state.inviteCompanion=false;if(t.activity==='inn-shift')this.state.innShift=createInn(this.state.controlled,this.state.pending.companion==='together',{repeat:id!=='busy-inn-night',seed:this.state.seed});if(id==='first-wages'){this.state.delivery.phase='pickup-story';this.state.delivery.page=0;}if(this.state.tutorial.status==='active'&&this.state.tutorial.step===4&&id===this.tutorialTask)this.state.tutorial.step=5;return clone(this.state.pending);
 }
 complete({success=true}={}){
  const p=this.state.pending;check(p,'沒有進行中的活動');check(!this.state.receipts.includes(p.id),'這個時段已結算');
  const t=this.config.tasks.find(t=>t.id===p.task),other=this.companion;
  if(p.task==='first-wages'&&success)check(this.state.delivery?.phase==='reward'&&this.state.delivery.signed&&this.state.delivery.fixed,'先完成運送、簽收與交回清單');
  if(t.activity==='inn-shift'&&success)check(this.state.innShift?.phase==='settle'&&new InnShift(this.state.innShift).complete,'先完成旅舍基本工作與結尾故事');
  const report=[];
  if(success){const payout=(t.coins||0)+(t.activity==='inn-shift'?Math.floor(this.state.innShift.quality/25):0)+(p.task==='first-wages'&&this.state.delivery.fixed?(t.repairBonus||0):0);this.state.coins+=payout;this.state.xp[p.actor]+=t.xp||0;if(t.item)this.state.inventory[t.item]=(this.state.inventory[t.item]||0)+1;if(t.info&&!this.state.infos.includes(t.info))this.state.infos.push(t.info);this.state.completed[t.id]=this.state.day;this.state.accepted=this.state.accepted.filter(id=>id!==t.id);report.push(`完成「${t.title}」${t.coins?`，收入 ${payout} 金幣`:''}${t.info?'，取得一項情報':''}。`);}
  else report.push(`結束「${t.title}」，未領取委託報酬。`);
  if(p.companion==='work'){this.state.coins+=this.config.balance.companionWage;this.state.xp[other]++;report.push(`同伴完成工作，帶回 ${this.config.balance.companionWage} 金幣。`);}
  else if(p.companion==='practice'){this.state.xp[other]++;report.push('同伴完成練習，熟練度 +1。');}
  else{if(success)this.state.xp[other]+=t.xp||0;report.push('同伴與你同行。');}
  if(t.activity==='inn-shift'&&this.state.innShift){this.state.innShift.phase='done';if(success&&p.task==='busy-inn-night'){this.state.sharedExperiences??=[];this.state.sharedExperiences.push(`busy-inn-night:${this.state.innShift.variant}`);this.state.innEncounters={family:{helped:true,quality:this.state.innShift.quality},merchant:{reservationKept:true}};}}
  if(p.task==='first-wages'){delete this.state.inventory['delivery-crates'];delete this.state.inventory['delivery-receipt'];if(success){this.state.delivery.phase='done';this.state.sharedExperiences??=[];if(!this.state.sharedExperiences.includes('first-wages'))this.state.sharedExperiences.push('first-wages');}else this.state.delivery={...createDelivery(),phase:'pickup'};}
  if(this.state.tutorial.status==='active'&&p.task===this.tutorialTask){if(success){this.state.tutorial.status='done';this.state.tutorial.step=6;}else this.state.tutorial.step=4;}
  if(!success&&p.task==='first-wages'&&!this.freePlay){this.state.pending=null;this.log('新手委託可重新嘗試；教學時段保留。');return report;}
  this.state.receipts.push(p.id);this.state.receipts=this.state.receipts.slice(-100);this.state.pending=null;this.log(report.join(' '));this.advance();return report;
 }
 innCheckpoint(snapshot){check(this.state.pending&&['busy-inn-night','sort'].includes(this.state.pending.task),'沒有旅舍活動');validateInn(snapshot);check(snapshot.actor===this.state.pending.actor&&snapshot.variant===(this.state.pending.companion==='together'?'together':this.state.pending.actor),'不可更換旅舍故事版本');this.state.innShift=clone(snapshot);}
 advance(){if(this.state.period<2)this.state.period++;else this.night();}
 night(){this.state.rentDebt+=this.config.balance.rent;this.log(`本日住宿費 ${this.config.balance.rent} 金幣已記帳，可到旅舍付款。`);this.state.day++;this.state.period=0;this.state.location='inn';}
 sleep(){this.idle();check(this.freePlay,'先完成新手委託，再自由安排日程');check(this.state.location==='inn'&&this.period==='evening','晚上回旅舍後才可睡覺');this.night();}
 wait(){this.idle();check(this.freePlay,'先完成新手委託，再自由安排日程');check(this.state.period<2,'晚上請回旅舍休息');this.log('跳過本時段；沒有工作或同伴報酬。');this.state.period++;}
 payRent(){this.idle();check(this.state.location==='inn'&&this.state.rentDebt>0,'沒有待付住宿費');check(this.state.coins>=this.state.rentDebt,'金幣不足，欠款會保留，不會卡住遊戲');this.state.coins-=this.state.rentDebt;this.state.rentDebt=0;this.state.rentPayments++;this.log('已付清住宿費。');}
 questStoryPage(page){check(this.state.delivery&&Number.isSafeInteger(page)&&page>=0,'故事頁碼無效');this.state.delivery.page=page;}
 questStoryEnd(){const d=this.state.delivery;check(d,'沒有委託故事');if(d.phase==='board-story')d.phase='pickup';else if(d.phase==='pickup-story')d.phase='packing';else if(d.phase==='ending-story')d.phase='reward';else throw Error('現在沒有待結束的故事');d.page=0;}
 pack(id,slot){check(this.state.pending?.task==='first-wages','沒有送貨委託');const all=packProduce(this.state.delivery,id,slot);if(all){this.state.inventory['delivery-crates']=2;this.state.delivery.phase='transport-first';}return all;}
 placeCargo(id,box,column,rotated=false){check(this.state.pending?.task==='first-wages'&&this.state.delivery.phase==='packing','現在不是裝箱階段');const game=new CargoPacking(this.state.delivery.cargo);game.place(id,box,column,rotated);this.state.delivery.cargo=game.snapshot();}
 removeCargo(id){check(this.state.delivery.phase==='packing','現在不是裝箱階段');const game=new CargoPacking(this.state.delivery.cargo);game.remove(id);this.state.delivery.cargo=game.snapshot();}
 testCargo(){check(this.state.delivery.phase==='packing','現在不是裝箱階段');const game=new CargoPacking(this.state.delivery.cargo);const result=game.test();this.state.delivery.cargo=game.snapshot();return result;}
 confirmCargo(){const game=new CargoPacking(this.state.delivery.cargo);check(this.state.pending?.task==='first-wages'&&this.state.delivery.phase==='packing'&&game.state.passed&&game.issues.length===0,'先通過晃動測試，確認貨物不會壓壞或失衡');this.state.delivery.packed=game.placements.map(p=>p.id);this.state.inventory['delivery-crates']=2;this.state.delivery.phase='transport-first';}
 deliveryCheckpoint(snapshot,halfway=false){check(this.state.pending?.task==='first-wages'&&['transport-first','transport-final'].includes(this.state.delivery.phase),'現在不是運送階段');check(snapshot.role===this.state.controlled,'操作角色無效');this.state.delivery.transport=structuredClone(snapshot);if(halfway){check(this.state.delivery.phase==='transport-first','突發問題只發生一次');this.state.delivery.phase='wheel';}else if(snapshot.game.phase==='success'){check(this.state.delivery.phase==='transport-final'&&this.state.delivery.fixed,'先處理輪軸問題');this.state.delivery.phase='handoff';this.state.location='inn';}}
 repairCheckpoint(snapshot){check(this.state.pending?.task==='first-wages'&&this.state.delivery.phase==='wheel','現在不是輪軸修理階段');this.state.delivery.repair=structuredClone(snapshot);}
 fixWheel(){check(this.state.pending?.task==='first-wages'&&this.state.delivery.phase==='wheel','現在沒有輪軸問題');check(this.state.delivery.repair?.locks===3,'先對準並扣緊三個固定點');this.state.delivery.fixed=true;this.state.delivery.phase='transport-final';}
 signDelivery(){check(this.state.pending?.task==='first-wages'&&this.state.delivery.phase==='handoff'&&this.state.location==='inn'&&this.state.inventory['delivery-crates']===2,'先將兩筐菜送到旅舍');delete this.state.inventory['delivery-crates'];this.state.inventory['delivery-receipt']=1;this.state.delivery.signed=true;this.state.delivery.phase='return';}
 startTutorial(){this.idle();const task=this.config.tutorialTask||'sort';check(!this.state.completed[task],'此委託已完成，請繼續自由探索');this.state.tutorial={status:'active',task,step:this.state.accepted.includes(task)?3:0,celebrated:false};}
 skipTutorial(){this.state.tutorial={status:'skipped',step:this.state.tutorial.step,celebrated:true};}
 invite(){this.idle();check(this.freePlay,'新手委託兩人必定同行');this.state.inviteCompanion=!this.state.inviteCompanion;}
 get gate(){const w=this.state,c=this.config;if(c.chapterGate.mode==='estrala-4')return [{id:'intro',label:'完成新手委託《第一份工錢》',done:!!w.completed['first-wages']},{id:'north',label:'完成《走不到的北路》（內容準備中）',done:w.mainline?.northRoadConfirmed===true},{id:'oren',label:'取得奧倫確認的商道與同行資訊（內容準備中）',done:w.mainline?.orenVerifiedRoute===true},{id:'travel',label:`旅費 ${w.coins} / ${c.balance.travelGoal}、物資 ${w.inventory['travel-supplies']||0} / ${c.chapterGate.supplies}`,done:w.coins>=c.balance.travelGoal&&(w.inventory['travel-supplies']||0)>=c.chapterGate.supplies&&w.rentDebt===0}];return [{id:'money',label:`出發準備金 ${w.coins} / ${c.balance.travelGoal}`,done:w.coins>=c.balance.travelGoal},{id:'rent',label:'完成至少一次住宿付款，沒有欠款',done:w.rentPayments>=c.chapterGate.rentPayments&&w.rentDebt===0},{id:'route',label:`路線情報 ${c.chapterGate.infos.filter(i=>w.infos.includes(i)).length} / ${c.chapterGate.infos.length}`,done:c.chapterGate.infos.every(i=>w.infos.includes(i))}];}
 get ready(){return this.gate.every(g=>g.done);}
}
