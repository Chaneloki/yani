import {renderQuestReader} from './quest-reader.js';
import {paginateText} from '../content/paginate-text.js';
export function mountHerbs({app,config,characters,getLife,onSave,onChange}){
 const dialog=document.createElement('dialog');dialog.className='first-wages-dialog';dialog.setAttribute('aria-label','支線 03 曬在窗邊的草藥');app.append(dialog);let reader;
 const content=config.questStories['windowsill-herbs'];
 const pages=()=>content.scenes.flatMap(scene=>scene.lines.flatMap(line=>paginateText(line.text).map((text,i)=>({...line,text,id:`${line.id}-${i}`,scene:scene.id,section:scene.title}))));
 function close(){reader?.close();if(dialog.open)dialog.close();onChange();}
 dialog.addEventListener('cancel',()=>{reader?.close();onChange();});
 function render(){
  reader?.close();dialog.replaceChildren();const life=getLife(),state=life.state.herbsStory,all=pages(),line=all[state.page];
  dialog.dataset.weather=line.weather||'clear';
  const start=all.findIndex(p=>p.scene===line.scene),end=all.findLastIndex(p=>p.scene===line.scene),segment=all.slice(start,end+1);
  reader=renderQuestReader({dialog,title:content.title+' · '+line.section,pages:segment,page:state.page-start,characters,background:line.background,
   onPage:page=>{state.page=start+page;onSave();render();},
   onEnd:()=>{if(end+1<all.length){state.page=end+1;onSave();render();}else{state.ready=true;life.complete();onSave();close();}},onPause:close,redraw:render});
 }
 return {open(){render();if(!dialog.open)dialog.showModal();},close,get active(){return dialog.open;}};
}
