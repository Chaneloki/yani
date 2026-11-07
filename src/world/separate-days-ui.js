import {renderQuestReader} from './quest-reader.js';import {paginateText} from '../content/paginate-text.js';import {departurePages} from './departure-event.js';
export function mountSeparateDays({app,config,characters,getLife,onSave,onChange,onMusic=()=>{}}){
 const dialog=document.createElement('dialog');dialog.className='separate-days-dialog first-wages-dialog';dialog.setAttribute('aria-label','傍晚約會 各自的一天');app.append(dialog);let reader;const epochs={};
 const content=config.eventStories['separate-days'],scenes=departurePages(content,paginateText);
 function close(){reader?.close();reader=null;if(dialog.open)dialog.close();onMusic('warm-daily-life');onChange();}
 dialog.addEventListener('cancel',()=>{reader?.close();reader=null;onMusic('warm-daily-life');onChange();});
 function render(){reader?.close();dialog.replaceChildren();dialog.className='separate-days-dialog first-wages-dialog';const life=getLife(),s=life.state.separateDayEvent,scene=scenes[s.scene],line=scene.pages[s.page];dialog.dataset.dateScene=scene.id;onMusic(scene.bgm);const cameraKey=scene.id+':'+line.background;epochs[cameraKey]??=performance.now();
  reader=renderQuestReader({dialog,title:'傍晚約會｜各自的一天',pages:scene.pages,page:s.page,historyPages:scenes.slice(0,s.scene).flatMap(x=>x.pages).concat(scene.pages.slice(0,s.page+1)),endLabel:s.scene===scenes.length-1?'收好今晚的回憶 ↗':'繼續約會 ↗',characters,background:line.background,onPage:page=>{life.separateDayPage(s.scene,page);onSave();render();},onEnd:()=>{if(s.scene+1<scenes.length){life.separateDayNextScene();onSave();render();}else{life.finishSeparateDay();onSave();close();}},onPause:close,redraw:render});
  const next=dialog.querySelector('.quest-story-next');if(next)next.setAttribute('aria-label','繼續閱讀各自的一天');
  const background=document.createElement('div');background.className='date-scenery';background.style.backgroundImage=`url("${new URL(line.background,document.baseURI).href}")`;background.dataset.camera=String(!!scene.camera||!!line.cg);background.dataset.cg=String(!!line.cg);background.style.animationDelay=`-${performance.now()-epochs[cameraKey]}ms`;background.setAttribute('aria-hidden','true');dialog.prepend(background);
 }
 return {open(){if(getLife().state.separateDayEvent?.phase==='scheduled')getLife().beginSeparateDay();onSave();render();if(!dialog.open)dialog.showModal();},close,get active(){return dialog.open;}};
}
