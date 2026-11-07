import {createSeparateDay,validateSeparateDay,isSeparateWork} from './separate-days.js';
import {createDepartureEvent,validateDepartureEvent,departurePages,DIARY_FIRST_ENTRY} from './departure-event.js';
import {paginateText} from '../content/paginate-text.js';
import {createLedger,validateLedger} from './delivery-ledger.js';
import {createNorthRoad,validateNorthRoad} from './north-road.js';
import {createSecretMap,validateSecretMap} from './secret-map.js';
import {Woodwork,validateWoodwork} from './woodwork.js';
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
 for(const t of c.tasks){check(typeof t.id==='string'&&!['__proto__','constructor','prototype'].includes(t.id)&&!tasks.has(t.id)&&locations.has(t.location)&&['work','explore'].includes(t.kind)&&Array.isArray(t.slots)&&t.slots.length&&t.slots.every(p=>PERIODS.includes(p)),'活動資料無效');tasks.add(t.id);if(t.info)infos.add(t.info);for(const key of ['coins','xp'])if(t[key]!==undefined)check(Number.isSafeInteger(t[key])&&t[key]>=0,'活動獎勵無效');if(t.item)check(Object.hasOwn(c.items||{},t.item),'活動物品不存在');if(t.itemQuantity!==undefined)check(t.item&&Number.isSafeInteger(t.itemQuantity)&&t.itemQuantity>0,'活動物品數量無效');}
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
 if(w.separateWorkPlanned!==undefined)check(typeof w.separateWorkPlanned==='boolean','分頭工作安排無效');
 if(w.inviteCompanion!==undefined)check(typeof w.inviteCompanion==='boolean','同行邀請無效');
 if(w.sharedExperiences!==undefined)check(Array.isArray(w.sharedExperiences)&&w.sharedExperiences.every(id=>typeof id==='string'),'共同經歷無效');
 if(w.mainline!==undefined)check(w.mainline&&typeof w.mainline==='object'&&!Array.isArray(w.mainline)&&Object.entries(w.mainline).every(([id,v])=>['northRoadConfirmed','orenVerifiedRoute'].includes(id)&&typeof v==='boolean'),'主線情報無效');
 if(w.innShift)validateInn(w.innShift);
 if(w.pending&&['busy-inn-night','sort'].includes(w.pending.task)&&w.innShift)check(w.innShift.actor===w.pending.actor&&w.innShift.variant===(w.pending.companion==='together'?'together':w.pending.actor),'旅舍路線與同行紀錄不符');
 if(w.innEncounters!==undefined)check(w.innEncounters?.family?.helped===true&&Number.isFinite(w.innEncounters.family.quality)&&w.innEncounters?.merchant?.reservationKept===true,'旅客相遇紀錄無效');
 if(w.delivery)validateDelivery(w.delivery);
 if(w.pending?.task==='first-wages')check(w.delivery&&['pickup-story','packing','transport-first','wheel','transport-final','handoff','return','ending-story','reward'].includes(w.delivery.phase),'送貨活動缺少有效階段');
 if(w.tutorial)check(['offer','active','done','skipped'].includes(w.tutorial.status)&&Number.isInteger(w.tutorial.step)&&w.tutorial.step>=0&&w.tutorial.step<=6&&typeof w.tutorial.celebrated==='boolean','新手教學紀錄無效');
 if(w.skills!==undefined)check(w.skills&&typeof w.skills==='object'&&!Array.isArray(w.skills)&&Object.keys(w.skills).every(id=>people.includes(id))&&Object.values(w.skills).every(a=>Array.isArray(a)&&new Set(a).size===a.length&&a.every(id=>id==='structural-reading'))&&(!w.skills.natsumi?.length),'技能資料無效');
 if(w.karlFamiliarity!==undefined)check(w.karlFamiliarity===1&&!!w.completed['carpenter-workbench'],'卡爾熟悉度無效');
 if(w.workshop!==undefined){check(['intro','learn','choose','play','aftermath','bakery','reward','night','settle','done'].includes(w.workshop.phase)&&Number.isSafeInteger(w.workshop.page)&&w.workshop.page>=0,'工作坊故事進度無效');if(w.workshop.game)validateWoodwork(w.workshop.game);}
 if(w.separateDayEvent){const s=w.separateDayEvent;validateSeparateDay(s);const scenes=config.eventStories?.['separate-days']?departurePages(config.eventStories['separate-days'],paginateText):null;check(s.dueDay<=w.day&&s.scene<(scenes?.length||7)&&(!scenes||s.page<scenes[s.scene].pages.length)&&config.tasks.some(t=>t.id===s.work.task&&t.kind==='work'&&!t.together),'傍晚約會頁碼或工作無效');if(s.phase==='reading')check(!w.pending&&w.period===2&&w.departureEvent?.phase!=='reading','傍晚約會不能與其他活動同時進行');if(s.phase==='done')check(s.completedDay<=w.day,'約會日期超出目前進度');}
 if(w.departureEvent){validateDepartureEvent(w.departureEvent);const scenes=config.eventStories?.['beyond-the-map']?departurePages(config.eventStories['beyond-the-map'],paginateText):null;check(w.departureEvent.scene<(scenes?.length||8)&&(!scenes||w.departureEvent.page<scenes[w.departureEvent.scene].pages.length),'離村前夕頁碼超出範圍');check(!w.pending,'離村前夕不能與委託同時進行');if(w.departureEvent.phase==='done')check(w.inventory['shared-map']>=1&&w.inventory['travel-diary']>=1&&w.travelDiary?.entries?.some(e=>e.id==='estrala-eve'),'離村紀念物件缺失');}
 if(w.travelDiary!==undefined)check(w.travelDiary?.version===1&&Array.isArray(w.travelDiary.entries)&&w.travelDiary.entries.length<=500&&new Set(w.travelDiary.entries.map(e=>e.id)).size===w.travelDiary.entries.length&&w.travelDiary.entries.every(e=>typeof e.id==='string'&&typeof e.title==='string'&&Number.isSafeInteger(e.day)&&e.day>=2&&Array.isArray(e.lines)&&e.lines.every(l=>people.includes(l.author)&&typeof l.text==='string')),'共同旅行日記無效');
 if(w.deliveryLedger)validateLedger(w.deliveryLedger);
 if(w.pending?.task==='two-delivery-lists')check(w.deliveryLedger?.actor===w.pending.actor&&w.pending.companion==='together','貨單核對必須雙人同行');
 if(w.ledgerRelations!==undefined)check(w.ledgerRelations.lida===true&&w.ledgerRelations.dorn===true&&!!w.completed['two-delivery-lists'],'貨單人物關係紀錄無效');
 if(w.northRoad)validateNorthRoad(w.northRoad);
 if(w.pending?.task==='unreachable-north-road')check(w.northRoad&&w.northRoad.variant===(w.pending.companion==='together'?'together':w.pending.actor),'北路調查路線不符');
 if(w.secretMap)validateSecretMap(w.secretMap);
 if(w.childrenState!==undefined)check(w.childrenState.reconciled===true&&w.childrenState.miraDeparted===false&&!!w.completed['keep-the-promise'],'孩子相遇紀錄無效');
 if(w.pending?.task==='keep-the-promise')check(w.secretMap&&w.secretMap.variant===(w.pending.companion==='together'?'together':w.pending.actor),'秘密地圖路線不符');
 if(w.herbsStory!==undefined)check(Number.isSafeInteger(w.herbsStory.page)&&w.herbsStory.page>=0&&typeof w.herbsStory.ready==='boolean','草藥故事進度無效');
 if(w.herbsNotes!==undefined)check(Array.isArray(w.herbsNotes)&&w.herbsNotes.length===2&&w.herbsNotes.every(v=>typeof v==='string')&&w.aymeFamiliarity===1&&!!w.completed['windowsill-herbs'],'草藥情報紀錄無效');
 if(w.pending){const p=w.pending,t=config.tasks.find(t=>t.id===p.task);check(t&&people.includes(p.actor)&&p.actor===w.controlled&&['together','work','practice'].includes(p.companion)&&p.day===w.day&&p.period===w.period&&p.id===`${w.day}:${w.period}`,'進行中的活動無效');check(!t.together||p.companion==='together','協力任務必須同行');check(!t.actor||p.actor===t.actor,'角色專屬委託');check(!t.solo||p.companion!=='together','角色專屬活動須單獨進行');}
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
 idle(){check(this.state.separateDayEvent?.phase!=='reading','先完成或繼續《各自的一天》');check(!this.state.pending,'先完成或結束目前活動');check(this.state.departureEvent?.phase!=='reading','先完成或繼續《地圖以外的事情》');}
 random(){this.state.seed=(1664525*this.state.seed+1013904223)>>>0;return this.state.seed/4294967296;}
 available(task){if(this.canBeginSeparateDay||this.dateUsedThisEvening)return false;if(task.actor&&task.actor!==this.state.controlled)return false;if(task.requiresCompleted&&!this.state.completed[task.requiresCompleted])return false;return (this.freePlay||task.id==='first-wages')&&task.slots.includes(this.period)&&(!this.state.completed[task.id]||(task.repeatable&&this.state.completed[task.id]<this.state.day));}
 unlocked(location){return !location.requires||location.requires.every(id=>this.state.infos.includes(id));}
 visit(id){if(this.state.pending?.task==='first-wages'){const dest=this.state.delivery.phase==='return'?'garden':this.state.delivery.phase==='handoff'?'inn':null;check(id===dest,'先完成當前送貨階段');}else this.idle();const l=this.config.locations.find(l=>l.id===id);check(l&&this.unlocked(l),'此路線尚未開放');this.state.location=id;if(this.state.pending?.task==='first-wages'&&this.state.delivery.phase==='return'&&id==='garden'){this.state.delivery.phase='ending-story';this.state.delivery.page=0;}if((this.state.tutorial.status==='active')&&((this.state.tutorial.step===1&&id===this.config.questBoard)||(this.state.tutorial.step===3&&id===this.config.tasks.find(t=>t.id===this.tutorialTask).location)))this.state.tutorial.step++;}
 select(actor){this.idle();check(people.includes(actor),'未知角色');this.state.controlled=actor;if(this.state.tutorial.status==='active'&&this.state.tutorial.step===0)this.state.tutorial.step=1;}
 accept(id){this.idle();const t=this.config.tasks.find(t=>t.id===id);check(t&&t.kind==='work'&&this.state.location===this.config.questBoard&&this.available(t),'請到村中廣場委託處接取任務');if(!this.state.accepted.includes(id))this.state.accepted.push(id);if(id==='first-wages'&&!this.state.delivery)this.state.delivery=createDelivery();if(this.state.tutorial.status==='active'&&this.state.tutorial.step===2&&id===this.tutorialTask)this.state.tutorial.step=3;}
 begin(id){this.idle();check(!this.canBeginSeparateDay&&!this.dateUsedThisEvening,'今晚已安排兩人的約會，工作留待明天');const t=this.config.tasks.find(t=>t.id===id);check(t&&t.location===this.state.location&&this.available(t)&&(t.kind!=='work'||this.state.accepted.includes(id)),'委託尚未接取或現在不能進行');
  if(id==='first-wages')check(this.state.delivery?.phase==='pickup','先讀完公告板的委託故事');
  const r=this.random(),splitPlan=!!this.state.separateWorkPlanned&&t.kind==='work'&&!t.together;this.state.pending={id:`${this.state.day}:${this.state.period}`,task:id,actor:this.state.controlled,companion:splitPlan?'work':t.solo?'practice':t.together||this.state.inviteCompanion?'together':r<.45?'together':r<.75?'work':'practice',day:this.state.day,period:this.state.period};this.state.inviteCompanion=false;if(splitPlan)this.state.separateWorkPlanned=false;if(t.activity==='delivery-ledger')this.state.deliveryLedger=createLedger(this.state.controlled);if(t.activity==='north-road')this.state.northRoad=createNorthRoad(this.state.controlled,this.state.pending.companion==='together');if(t.activity==='secret-map')this.state.secretMap=createSecretMap(this.state.controlled,this.state.pending.companion==='together');if(t.activity==='woodwork')this.state.workshop={phase:id==='carpenter-workbench'?'intro':'choose',page:0,game:null};if(t.activity==='herbs-story')this.state.herbsStory={page:0,ready:false};if(t.activity==='inn-shift')this.state.innShift=createInn(this.state.controlled,this.state.pending.companion==='together',{repeat:id!=='busy-inn-night',seed:this.state.seed});if(id==='first-wages'){this.state.delivery.phase='pickup-story';this.state.delivery.page=0;}if(this.state.tutorial.status==='active'&&this.state.tutorial.step===4&&id===this.tutorialTask)this.state.tutorial.step=5;return clone(this.state.pending);
 }
 complete({success=true}={}){
  const p=this.state.pending;check(p,'沒有進行中的活動');check(!this.state.receipts.includes(p.id),'這個時段已結算');
  const t=this.config.tasks.find(t=>t.id===p.task),other=this.companion;
  if(p.task==='first-wages'&&success)check(this.state.delivery?.phase==='reward'&&this.state.delivery.signed&&this.state.delivery.fixed,'先完成運送、簽收與交回清單');
  if(t.activity==='inn-shift'&&success)check(this.state.innShift?.phase==='settle'&&new InnShift(this.state.innShift).complete,'先完成旅舍基本工作與結尾故事');
  if(t.activity==='woodwork'&&success)check(this.state.workshop?.phase==='settle'&&this.state.workshop.game?.phase==='success'&&new Woodwork(this.state.workshop.game).core.phase==='success','先完成木架維修、驗收與故事');
  if(t.activity==='herbs-story'&&success)check(this.state.herbsStory?.ready,'先讀完草藥支線');
  if(t.activity==='secret-map'&&success)check(this.state.secretMap?.phase==='settle'&&this.state.secretMap.boxFound,'先找回盒子並完成孩子的故事');
  if(t.activity==='north-road'&&success)check(this.state.northRoad?.phase==='settle'&&this.state.northRoad.reported,'先完成道路觀察、地圖更新與回報');
  if(t.activity==='delivery-ledger'&&success)check(this.state.deliveryLedger?.phase==='settle'&&this.state.deliveryLedger.signed,'先完成貨單核對、現場查證與雙方確認');
  const report=[];
  if(success){const payout=(t.coins||0)+(t.activity==='inn-shift'?Math.floor(this.state.innShift.quality/25):0)+(p.task==='first-wages'&&this.state.delivery.fixed?(t.repairBonus||0):0);this.state.coins+=payout;this.state.xp[p.actor]+=t.xp||0;if(t.item)this.state.inventory[t.item]=(this.state.inventory[t.item]||0)+(t.itemQuantity||1);if(t.info&&!this.state.infos.includes(t.info))this.state.infos.push(t.info);this.state.completed[t.id]=this.state.day;this.state.accepted=this.state.accepted.filter(id=>id!==t.id);report.push(`完成「${t.title}」${t.coins?`，收入 ${payout} 金幣`:''}${t.info?'，取得一項情報':''}。`);}
  else report.push(`結束「${t.title}」，未領取委託報酬。`);
  if(p.companion==='work'){this.state.coins+=this.config.balance.companionWage;this.state.xp[other]++;report.push(`同伴完成工作，帶回 ${this.config.balance.companionWage} 金幣。`);}
  else if(p.companion==='practice'){this.state.xp[other]++;report.push('同伴完成練習，熟練度 +1。');}
  else{if(success)this.state.xp[other]+=t.xp||0;report.push('同伴與你同行。');}
  if(t.activity==='inn-shift'&&this.state.innShift){this.state.innShift.phase='done';if(success&&p.task==='busy-inn-night'){this.state.sharedExperiences??=[];this.state.sharedExperiences.push(`busy-inn-night:${this.state.innShift.variant}`);this.state.innEncounters={family:{helped:true,quality:this.state.innShift.quality},merchant:{reservationKept:true}};}}
  if(t.activity==='delivery-ledger'&&success){this.state.deliveryLedger.phase='done';this.state.ledgerRelations={lida:true,dorn:true};report.push('收到莉妲送的兩個番茄；莉妲與多恩的貨單往來已記錄。');}
  if(t.activity==='north-road'&&success){this.state.northRoad.phase='done';this.state.mainline??={};this.state.mainline.northRoadConfirmed=true;report.push('北方石橋損毀已確認；可向奧倫進一步確認南方商道。');}
  if(t.activity==='secret-map'&&success){this.state.secretMap.phase='done';this.state.childrenState={reconciled:true,miraDeparted:false};}
  if(t.activity==='woodwork'&&success){this.state.workshop.phase='done';if(p.task==='carpenter-workbench'){this.state.skills??={};this.state.skills.kentaro??=[];if(!this.state.skills.kentaro.includes('structural-reading'))this.state.skills.kentaro.push('structural-reading');this.state.karlFamiliarity=1;report.push('健太郎學會「結構判讀」，工作坊進階維修委託已開放。');}}
  if(t.activity==='herbs-story'&&success){this.state.herbsNotes=['星燈之城郊外的鏡面石門傳聞','山間驛站的舊圖記錄'];this.state.aymeFamiliarity=1;}
  if(p.task==='first-wages'){delete this.state.inventory['delivery-crates'];delete this.state.inventory['delivery-receipt'];if(success){this.state.delivery.phase='done';this.state.sharedExperiences??=[];if(!this.state.sharedExperiences.includes('first-wages'))this.state.sharedExperiences.push('first-wages');}else this.state.delivery={...createDelivery(),phase:'pickup'};}
  if(this.state.tutorial.status==='active'&&p.task===this.tutorialTask){if(success){this.state.tutorial.status='done';this.state.tutorial.step=6;}else this.state.tutorial.step=4;}
  if(!success&&p.task==='first-wages'&&!this.freePlay){this.state.pending=null;this.log('新手委託可重新嘗試；教學時段保留。');return report;}
  if(this.config.chapterGate.mode==='estrala-4'&&!this.state.separateDayEvent&&isSeparateWork(t,p,success))this.state.separateDayEvent=createSeparateDay({day:p.day,period:p.period,actor:p.actor,task:p.task});
  this.state.receipts.push(p.id);this.state.receipts=this.state.receipts.slice(-100);this.state.pending=null;this.log(report.join(' '));this.advance();return report;
 }
 get separateDayScenes(){const c=this.config.eventStories?.['separate-days'];check(c,'傍晚約會故事尚未載入');return departurePages(c,paginateText);}
 get canBeginSeparateDay(){return this.config.chapterGate.mode==='estrala-4'&&this.state.separateDayEvent?.phase==='scheduled'&&this.state.day>=this.state.separateDayEvent.dueDay&&this.period==='evening'&&!this.state.pending&&this.state.departureEvent?.phase!=='reading';}
 get dateUsedThisEvening(){return this.period==='evening'&&this.state.separateDayEvent?.phase==='done'&&this.state.separateDayEvent.completedDay===this.state.day;}
 beginSeparateDay(){this.idle();check(this.canBeginSeparateDay,'先完成首次白天分頭工作，傍晚在廣場碰面');this.separateDayScenes;this.state.separateDayEvent.phase='reading';this.state.location='square';}
 separateDayPage(scene,page){const s=this.state.separateDayEvent;check(s?.phase==='reading'&&s.scene===scene&&Number.isSafeInteger(page)&&page>=0&&page<this.separateDayScenes[scene].pages.length,'傍晚約會頁碼無效');s.page=page;}
 separateDayNextScene(){const s=this.state.separateDayEvent;check(s?.phase==='reading'&&s.scene+1<this.separateDayScenes.length,'沒有下一段約會故事');s.scene++;s.page=0;}
 finishSeparateDay(){const s=this.state.separateDayEvent;check(s?.phase==='reading'&&s.scene===this.separateDayScenes.length-1,'先閱讀約會各段故事');s.phase='done';s.completedDay=this.state.day;this.state.location='inn';this.log('首次分頭工作後，兩人一起吃果餅、在廣場跳舞，再到磨坊後的山坡看村莊燈火。');}
 get departureScenes(){const c=this.config.eventStories?.['beyond-the-map'];check(c,'離村前夕故事尚未載入');return departurePages(c,paginateText);}
 get canBeginDeparture(){return this.config.chapterGate.mode==='estrala-4'&&this.ready&&this.state.separateDayEvent?.phase==='done'&&!this.dateUsedThisEvening&&this.period==='evening'&&this.state.location==='inn'&&!this.state.pending&&!this.state.departureEvent;}
 get canLeave(){return this.ready&&(this.config.chapterGate.mode!=='estrala-4'||this.state.separateDayEvent?.phase==='done'&&this.state.departureEvent?.phase==='done');}
 beginDepartureEvent(){this.idle();check(this.canBeginDeparture,'先完成北路、奧倫出發安排與旅費物資，晚上回旅舍');this.departureScenes;this.state.departureEvent=createDepartureEvent();}
 departurePage(scene,page){const s=this.state.departureEvent;check(s?.phase==='reading'&&scene===s.scene&&Number.isSafeInteger(page)&&page>=0&&page<this.departureScenes[scene].pages.length,'離村前夕頁碼無效');s.page=page;}
 departureNextScene(){const s=this.state.departureEvent;check(s?.phase==='reading'&&s.scene+1<this.departureScenes.length,'沒有下一段離村故事');s.scene++;s.page=0;}
 finishDepartureEvent(){const s=this.state.departureEvent;check(s?.phase==='reading'&&s.scene===this.departureScenes.length-1,'先閱讀離村前夕各段故事');s.phase='done';this.state.inventory['shared-map']=Math.max(1,this.state.inventory['shared-map']||0);this.state.inventory['travel-diary']=Math.max(1,this.state.inventory['travel-diary']||0);this.state.travelDiary??={version:1,entries:[]};if(!this.state.travelDiary.entries.some(e=>e.id===DIARY_FIRST_ENTRY.id))this.state.travelDiary.entries.push({...clone(DIARY_FIRST_ENTRY),day:this.state.day});this.log('離村前夕，兩人開始共同旅行日記，將地圖與第一頁記錄收好。');}
 ledgerCheckpoint(snapshot){check(this.state.pending?.task==='two-delivery-lists'&&this.state.pending.companion==='together','沒有進行中的雙人貨單核對');validateLedger(snapshot);check(snapshot.actor===this.state.pending.actor,'不能更換控制角色');this.state.deliveryLedger=clone(snapshot);}
 northCheckpoint(snapshot){check(this.state.pending?.task==='unreachable-north-road','沒有進行中的北路調查');validateNorthRoad(snapshot);check(snapshot.variant===(this.state.pending.companion==='together'?'together':this.state.pending.actor),'不能更換調查路線');this.state.northRoad=clone(snapshot);if(['report','night','settle'].includes(snapshot.phase))this.state.location='inn';}
 secretCheckpoint(snapshot){check(this.state.pending?.task==='keep-the-promise','沒有進行中的秘密地圖');validateSecretMap(snapshot);check(snapshot.variant===(this.state.pending.companion==='together'?'together':this.state.pending.actor),'不能更換人物路線');this.state.secretMap=clone(snapshot);}
 learnStructure(){check(this.state.pending?.task==='carpenter-workbench'&&['learn','choose'].includes(this.state.workshop?.phase),'先聽卡爾講解');this.state.skills??={};this.state.skills.kentaro??=[];if(!this.state.skills.kentaro.includes('structural-reading'))this.state.skills.kentaro.push('structural-reading');this.state.workshop.phase='choose';}
 chooseWoodwork(level){check(this.state.pending&&this.config.tasks.find(t=>t.id===this.state.pending.task)?.activity==='woodwork'&&this.state.workshop?.phase==='choose','現在不能選擇維修難度');check(this.state.skills?.kentaro?.includes('structural-reading'),'先向卡爾學會結構判讀');this.state.workshop.game=new Woodwork(null,{level,skill:!!this.state.skills?.kentaro?.includes('structural-reading'),seed:this.state.seed}).snapshot();this.state.workshop.phase='play';}
 woodworkCheckpoint(snapshot){check(this.state.pending&&this.config.tasks.find(t=>t.id===this.state.pending.task)?.activity==='woodwork'&&this.state.workshop?.phase==='play','沒有進行中的木架維修');validateWoodwork(snapshot);check(snapshot.skill===!!this.state.skills?.kentaro?.includes('structural-reading'),'不能改變已學技能');this.state.workshop.game=clone(snapshot);}
 innCheckpoint(snapshot){check(this.state.pending&&['busy-inn-night','sort'].includes(this.state.pending.task),'沒有旅舍活動');validateInn(snapshot);check(snapshot.actor===this.state.pending.actor&&snapshot.variant===(this.state.pending.companion==='together'?'together':this.state.pending.actor),'不可更換旅舍故事版本');this.state.innShift=clone(snapshot);}
 advance(){if(this.state.period<2)this.state.period++;else this.night();}
 night(){this.state.rentDebt+=this.config.balance.rent;this.log(`本日住宿費 ${this.config.balance.rent} 金幣已記帳，可到旅舍付款。`);this.state.day++;this.state.period=0;this.state.location='inn';}
 sleep(){this.idle();check(!this.canBeginSeparateDay,'傍晚已約好碰面，先閱讀《各自的一天》');check(this.freePlay,'先完成新手委託，再自由安排日程');check(this.state.location==='inn'&&this.period==='evening','晚上回旅舍後才可睡覺');check(this.config.chapterGate.mode!=='estrala-4'||!this.ready||this.dateUsedThisEvening||this.state.departureEvent?.phase==='done','出發準備已備妥，先閱讀離村前夕《地圖以外的事情》');this.night();}
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
 planSeparateWork(){this.idle();check(this.freePlay,'先完成第一份工錢');check(!this.dateUsedThisEvening&&!this.canBeginSeparateDay,'先赴傍晚的約定');this.state.separateWorkPlanned=!this.state.separateWorkPlanned;if(this.state.separateWorkPlanned)this.state.inviteCompanion=false;}
 invite(){this.idle();check(this.freePlay,'新手委託兩人必定同行');this.state.inviteCompanion=!this.state.inviteCompanion;if(this.state.inviteCompanion)this.state.separateWorkPlanned=false;}
 get gate(){const w=this.state,c=this.config;if(c.chapterGate.mode==='estrala-4')return [{id:'intro',label:'完成新手委託《第一份工錢》',done:!!w.completed['first-wages']},{id:'north',label:'完成《走不到的北路》並向多恩回報',done:w.mainline?.northRoadConfirmed===true},{id:'oren',label:'取得奧倫確認的商道與同行資訊（內容準備中）',done:w.mainline?.orenVerifiedRoute===true},{id:'travel',label:`旅費 ${w.coins} / ${c.balance.travelGoal}、物資 ${w.inventory['travel-supplies']||0} / ${c.chapterGate.supplies}`,done:w.coins>=c.balance.travelGoal&&(w.inventory['travel-supplies']||0)>=c.chapterGate.supplies&&w.rentDebt===0}];return [{id:'money',label:`出發準備金 ${w.coins} / ${c.balance.travelGoal}`,done:w.coins>=c.balance.travelGoal},{id:'rent',label:'完成至少一次住宿付款，沒有欠款',done:w.rentPayments>=c.chapterGate.rentPayments&&w.rentDebt===0},{id:'route',label:`路線情報 ${c.chapterGate.infos.filter(i=>w.infos.includes(i)).length} / ${c.chapterGate.infos.length}`,done:c.chapterGate.infos.every(i=>w.infos.includes(i))}];}
 get ready(){return this.gate.every(g=>g.done);}
}
