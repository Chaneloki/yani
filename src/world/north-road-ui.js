import {NorthRoad,NORTH_OBSERVATIONS} from './north-road.js';
import {renderQuestReader} from './quest-reader.js';
import {paginateText} from '../content/paginate-text.js';
const e=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const b=(text,fn)=>{const n=e('button','',text);n.type='button';n.onclick=fn;return n;};
export function mountNorthRoad({app,config,characters,getLife,onSave,onChange}){
 const dialog=e('dialog','north-road-dialog');dialog.setAttribute('aria-label','支線 06 走不到的北路');app.append(dialog);let model,reader,message='';
 const save=()=>{getLife().northCheckpoint(model.snapshot());onSave();};
 const stop=()=>{reader?.close();reader=null;};
 function close(){stop();if(dialog.open)dialog.close();onChange();}
 dialog.addEventListener('cancel',()=>{stop();onChange();});
 function act(fn){fn();save();render();}
 function render(){stop();dialog.className='north-road-dialog';dialog.replaceChildren();const s=model.s;
  if(s.phase==='settle'){getLife().complete();onSave();close();return;}
  if(['trail','reflection','night'].includes(s.phase)){story();return;}
  const top=e('div','north-road-top');top.append(e('h2','','走不到的北路'),b('稍後繼續',close));dialog.append(top);
  if(s.phase==='observe'){
   dialog.append(e('p','','留在安全的步道上，點選路況記號。觀察不消耗額外時段。'));
   const scene=e('div','north-road-scene');scene.setAttribute('aria-label','北路安全觀察位置');
   for(const [id,x,y] of [['sign',18,60],['bridge',55,34],['river',82,66]]){const point=b(`${s.observed.includes(id)?'✓ ':''}${{sign:'路標',bridge:'斷橋',river:'下游'}[id]}`,()=>act(()=>message=model.observe(id)));point.setAttribute('aria-label',NORTH_OBSERVATIONS[id].label);point.style.left=x+'%';point.style.top=y+'%';scene.append(point);}dialog.append(scene);
   const status=e('p','north-road-status',message||`已確認 ${s.observed.length} / 3 項路況`);status.setAttribute('role','status');dialog.append(status);
   if(getLife().state.pending.actor==='kentaro'&&getLife().state.skills?.kentaro?.includes('structural-reading')&&s.observed.includes('bridge'))dialog.append(e('p','north-road-skill','結構判讀：主要承重部分已損毀，不能靠幾件工具完成修復。'));
   const next=b('整理觀察記錄',()=>act(()=>model.continue()));next.disabled=s.observed.length!==3;dialog.append(next);return;
  }
  if(s.phase==='map'){
   dialog.append(e('p','','保留對岸道路的記錄，將橋的位置改成斷路標記。'));
   const comparison=e('div','north-road-comparison');for(const updated of [false,true]){const map=e('section','north-road-paper');map.append(e('h3','',updated?'調查後 · 已確認':'調查前 · 待確認'));map.innerHTML+='<svg viewBox="0 0 360 240" aria-label="'+(updated?'北路斷橋，無法通行':'口述地圖上的連續北路')+'"><path d="M15 100Q150 160 350 80" fill="none" stroke="#91b8b7" stroke-width="30"/><path d="M100 220L170 140M190 110L260 20" stroke="#8b7a55" stroke-width="7" fill="none"/>'+(updated?'<path d="m163 110 38 35m0-35-38 35" stroke="#b06b4f" stroke-width="8"/>':'<path d="M170 140L190 110" stroke="#8b7a55" stroke-width="7"/>')+'<text x="55" y="232" fill="#625c48" font-size="15">埃斯特拉村</text><text x="210" y="20" fill="#625c48" font-size="15">星燈之城方向</text></svg>';map.append(e('p','',updated?'石橋損毀，北路暫時無法通行。對岸道路仍保留。':'舊路標和村民口述，尚未實地核對。'));comparison.append(map);}dialog.append(comparison,b('標記斷橋 · 更新地圖',()=>act(()=>model.updateMap())));return;
  }
  if(s.phase==='return'){dialog.append(e('p','','調查已完成。帶著更新的地圖，沿原路回旅舍向多恩回報。'),b('沿原路回旅舍',()=>act(()=>model.returnInn())));return;}
  if(s.phase==='report'){dialog.append(e('h3','','向多恩回報'),e('p','','北橋中央橋身崩落；對岸道路仍在。從安全位置所見，附近沒有可通行的橋樑或渡河位置。'),e('p','','回報後記錄調查報酬，並開放向奧倫確認南方商道的調查方向。'),b('交回調查記錄 · 繼續旅舍夜晚',()=>act(()=>model.report())));}
 }
 function story(){const s=model.s;const pages=config.questStories['unreachable-north-road'].variants[s.variant][s.phase].flatMap(l=>paginateText(l.text).map((text,i)=>({...l,text,id:`${l.id}-${i}`})));const line=pages[Math.min(s.page,pages.length-1)];reader=renderQuestReader({dialog,title:'支線 06｜走不到的北路',pages,page:s.page,characters,background:line.background,onPage:page=>act(()=>s.page=page),onEnd:()=>act(()=>model.storyEnd()),onPause:close,redraw:()=>{dialog.replaceChildren();story();}});}
 return {open(){model=new NorthRoad(getLife().state.northRoad);message='';render();if(!dialog.open)dialog.showModal();},close,get active(){return dialog.open;}};
}
