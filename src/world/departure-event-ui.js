import {renderQuestReader} from './quest-reader.js';import {paginateText} from '../content/paginate-text.js';import {departurePages} from './departure-event.js';
export function mountDepartureEvent({app,config,characters,getLife,onSave,onChange,onMusic=()=>{}}){
 const dialog=document.createElement('dialog');dialog.className='departure-event-dialog first-wages-dialog';dialog.setAttribute('aria-label','離村前夕 地圖以外的事情');app.append(dialog);let reader;
 const content=config.eventStories['beyond-the-map'],scenes=departurePages(content,paginateText);
 function close(){reader?.close();reader=null;if(dialog.open)dialog.close();onMusic('warm-daily-life');onChange();}
 dialog.addEventListener('cancel',()=>{reader?.close();reader=null;onMusic('warm-daily-life');onChange();});
 function render(){reader?.close();dialog.replaceChildren();dialog.className='departure-event-dialog first-wages-dialog';const life=getLife(),s=life.state.departureEvent,scene=scenes[s.scene],line=scene.pages[s.page];dialog.dataset.paper=String(line.presentation==='journal');onMusic(['together','diary','saturday'].includes(scene.id)?'heartwarming-romance':'peaceful-night');
  reader=renderQuestReader({dialog,title:'離村前夕｜地圖以外的事情',pages:scene.pages,page:s.page,historyPages:scenes.slice(0,s.scene).flatMap(x=>x.pages).concat(scene.pages.slice(0,s.page+1)),endLabel:s.scene===scenes.length-1?'收好地圖與日記 ↗':'繼續閱讀 ↗',characters,background:line.background,onPage:page=>{life.departurePage(s.scene,page);onSave();render();},onEnd:()=>{if(s.scene+1<scenes.length){life.departureNextScene();onSave();render();}else{life.finishDepartureEvent();onSave();close();}},onPause:close,redraw:render});
  const next=dialog.querySelector('.quest-story-next');if(next)next.setAttribute('aria-label','繼續閱讀地圖以外的事情');
  if(line.presentation==='journal'){const paper=document.createElement('aside');paper.className='departure-written-note';paper.setAttribute('aria-label','共同旅行日記上的字句');paper.textContent=line.text;dialog.append(paper);}
 }
 return {open(){if(!getLife().state.departureEvent)getLife().beginDepartureEvent();onSave();render();if(!dialog.open)dialog.showModal();},close,get active(){return dialog.open;}};
}
