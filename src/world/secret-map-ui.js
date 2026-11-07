import {SecretMap,SECRET_LANDMARKS} from './secret-map.js';
import {renderQuestReader} from './quest-reader.js';
import {paginateText} from '../content/paginate-text.js';
const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const b=(text,fn,cls='')=>{const n=e('button',cls,text);n.type='button';n.onclick=fn;return n;};
export function mountSecretMap({app,config,characters,getLife,onSave,onChange}){
 const dialog=e('dialog','secret-map-dialog');dialog.setAttribute('aria-label','支線 05 說好了要保密');app.append(dialog);let reader,model,message='';
 const state=()=>getLife().state;
 function save(){getLife().secretCheckpoint(model.snapshot());onSave();}
 function stop(){reader?.close();reader=null;}
 function close(){stop();if(dialog.open)dialog.close();onChange();}
 dialog.addEventListener('cancel',()=>{stop();onChange();});
 function act(fn){fn();save();render();}
 function header(){const top=e('header','secret-map-top');top.append(e('strong','','支線 05｜說好了要保密'),b('稍後繼續',close));dialog.append(top);}
 function render(){stop();dialog.className='secret-map-dialog';delete dialog.dataset.questCg;dialog.replaceChildren();const s=model.s;
  if(s.phase==='settle'){getLife().complete();onSave();close();return;}
  if(s.phase==='respond'){header();dialog.append(e('p','secret-map-intro','托比握著盒子，等待你的回應。'),b('陪佢親自去問米拉',()=>act(()=>model.respond('accompany'))),b('留喺旁邊，畀佢一點時間',()=>act(()=>model.respond('wait'))));return;}
  if(s.phase!=='explore'){story();return;}
  header();dialog.append(e('p','secret-map-intro','點地圖記號，再觀察村裡相似的地方。沒有時間限制。'));
  const layout=e('div','secret-map-layout'),map=e('section','secret-paper-map');map.setAttribute('aria-label','托比與米拉的幻想地圖');map.innerHTML='<svg viewBox="0 0 600 410" aria-hidden="true"><path class="secret-drawn-river" d="M20 260Q150 180 270 280T580 180"/><path class="secret-drawn-path" d="M100 130Q250 80 315 240T510 110"/><path class="secret-drawn-mountains" d="M55 155L100 65L130 110L160 40L205 145M75 116L100 99L115 117M143 79L160 69L177 92"/><path class="secret-drawn-castle" d="M430 150V80L450 50L470 80V150M470 150V110H500V150M500 150V75L520 45L540 75V150ZM448 150V127Q457 113 465 127V150"/><circle cx="290" cy="240" r="11"/><path class="secret-sea" d="M330 360Q350 350 370 360T410 360T450 360"/></svg>';
  for(const [id,l] of Object.entries(SECRET_LANDMARKS)){const btn=b('',()=>act(()=>model.visit(id)),'secret-map-mark');btn.dataset.landmark=id;btn.dataset.active=String(id===s.place);btn.style.left=l.x+'%';btn.style.top=({rocks:27,canal:64,mill:25}[id])+'%';btn.append(e('span','',s.found.includes(id)?'✓':id==='rocks'?'△':id==='canal'?'≈':'♜'),e('strong','',l.name));btn.setAttribute('aria-label',`${l.name}${s.found.includes(id)?'，已確認':''}`);map.append(btn);}map.append(e('span','secret-sea-label','還沒畫完的海……'));layout.append(map);
  const scene=e('section','secret-observation');scene.setAttribute('aria-label','觀察村莊場景');scene.style.setProperty('--secret-scene',`url("${new URL(config.questAssets.secretLandmarks,document.baseURI).href}")`);
  const strip=e('div','secret-location-label',SECRET_LANDMARKS[s.place].name);scene.append(strip);
  for(const [object,label,x,y] of SECRET_LANDMARKS[s.place].objects){const point=b('',()=>{const result=model.inspect(object);message=result.text;save();render();},'secret-hotspot');point.style.left=x+'%';point.style.top=y+'%';point.setAttribute('aria-label','觀察'+label);point.title=label;point.append(e('span','','⌕'));scene.append(point);}layout.append(scene);dialog.append(layout);
  const footer=e('div','secret-map-feedback');footer.setAttribute('role','status');footer.append(e('strong','',message||`已認出 ${s.found.length} / 3 個地點`));if(s.found.length===3&&s.encountered&&s.routeRead)footer.append(e('p','','三個記號對上了。再看看小木屋旁移動過的東西。'));
  const hint=b('看看地圖上的提示',()=>{message=s.place==='rocks'?'三座高低不同的山，旁邊畫著一棵樹。':s.place==='canal'?'一條彎彎的水路，經過村裡的小橋。':'尖屋頂和一扇小窗。找到木屋後，再留意旁邊的花盆。';render();});footer.append(hint);dialog.append(footer);
 }
 function story(){
  const s=model.s,lines=config.questStories['keep-the-promise'].variants[s.variant][s.phase];if(!lines)throw Error('支線故事段落不存在：'+s.phase);
  const pages=lines.flatMap(line=>paginateText(line.text).map((text,i)=>({...line,text,id:`${line.id}-${i}`,speaker:line.speaker==='$actor'?state().pending.actor:line.speaker})));
  const line=pages[Math.min(s.page,pages.length-1)];reader=renderQuestReader({dialog,title:'支線 05｜說好了要保密',pages,page:s.page,characters,background:line.background,onPage:page=>act(()=>s.page=page),onEnd:()=>act(()=>model.storyEnd()),onPause:close,redraw:()=>{dialog.replaceChildren();story();}});
 }
 return {open(){model=new SecretMap(state().secretMap);message='';render();if(!dialog.open)dialog.showModal();},close,get active(){return dialog.open;}};
}
