import {createSeparateDay} from './separate-days.js';
import {createNorthRoad} from './north-road.js';
import {VillageLife,createWorld} from './world-engine.js';
import {createInn} from './inn-game.js';
import {createSecretMap} from './secret-map.js';
export const PREVIEW_QUESTS=['first-wages','busy-inn-night','windowsill-herbs','carpenter-workbench','keep-the-promise','unreachable-north-road','two-delivery-lists'];
export function previewStorageKey(state){if(state.previewKind==='separate-day')return 'yamada-nishi:event-preview:separate-days';if(state.previewKind==='departure')return 'yamada-nishi:event-preview:beyond-the-map';if(state.previewKind==='inn')return 'yamada-nishi:inn-preview';if(state.previewKind==='quest'){const p=state.previewQuest;if(!p||!PREVIEW_QUESTS.includes(p.id)||!['kentaro','natsumi'].includes(p.actor)||typeof p.together!=='boolean')throw Error('支線試玩資料無效');return `yamada-nishi:quest-preview:${p.id}:${p.together?'together-':''}${p.actor}`;}return 'yamada-nishi:world-preview';}
export function createQuestPreview(config,id,actor,together=false){
 const task=config.tasks.find(t=>t.id===id);if(!PREVIEW_QUESTS.includes(id)||!task||!['kentaro','natsumi'].includes(actor)||task.actor&&task.actor!==actor||task.solo&&together)throw Error('這個角色組合不能進入此支線');
 together=task.together||together;const w=createWorld(config,{preview:true});w.previewKind='quest';w.previewQuest={id,actor,together:!!together};w.tutorial.status='skipped';w.controlled=actor;
 if(id!=='first-wages')w.completed['first-wages']=w.day;
 w.period=task.slots.includes('afternoon')?1:task.slots.includes('morning')?0:2;
 const life=new VillageLife(config,w);life.visit(config.questBoard);life.accept(id);life.visit(task.location);
 if(id==='first-wages')return life.snapshot();
 life.begin(id);life.state.pending.companion=together?'together':'practice';
 if(task.activity==='inn-shift')life.state.innShift=createInn(actor,together,{seed:life.state.seed});
 if(task.activity==='north-road')life.state.northRoad=createNorthRoad(actor,together);
 if(task.activity==='secret-map')life.state.secretMap=createSecretMap(actor,together);
 return life.snapshot();
}

// A separate review fixture, never an override of the official preparation gates.
export function createDeparturePreview(config){const w=createWorld(config,{preview:true});w.previewKind='departure';w.tutorial.status='skipped';w.completed['first-wages']=w.day;w.completed['unreachable-north-road']=w.day;w.mainline={northRoadConfirmed:true,orenVerifiedRoute:true};w.coins=config.balance.travelGoal;w.rentDebt=0;w.inventory['travel-supplies']=config.chapterGate.supplies;w.period=2;w.location='inn';w.separateDayEvent={...createSeparateDay({day:w.day,period:1,actor:'natsumi',task:'unreachable-north-road'}),phase:'done',scene:6,completedDay:w.day};w.day++;const life=new VillageLife(config,w);life.beginDepartureEvent();return life.snapshot();}

export function createSeparateDayPreview(config){const w=createWorld(config,{preview:true});w.previewKind='separate-day';w.tutorial.status='skipped';w.completed['first-wages']=w.day;w.completed['unreachable-north-road']=w.day;w.mainline={northRoadConfirmed:true};w.coins=20+config.balance.companionWage;w.period=2;w.location='square';w.separateDayEvent=createSeparateDay({day:w.day,period:1,actor:'natsumi',task:'unreachable-north-road'});const life=new VillageLife(config,w);life.beginSeparateDay();return life.snapshot();}
