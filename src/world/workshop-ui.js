import {Woodwork,WOOD_LEVELS} from './woodwork.js';
import {mountWoodworkGame} from './woodwork-view.js';
import {mountMiniTutorial} from '../ui/minigame-tutorial.js';
import {renderQuestReader} from './quest-reader.js';
import {paginateText} from '../content/paginate-text.js';
const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const b=(label,fn)=>{const n=e('button','',label);n.type='button';n.onclick=fn;return n;};
export function mountWorkshop({app,config,characters,getLife,onSave,onChange,onCue=()=>{}}){
 const dialog=e('dialog','woodwork-dialog');dialog.setAttribute('aria-label','卡爾的木匠工作坊');app.append(dialog);let reader,cleanup=()=>{},teaching=false,game;
 const guide=mountMiniTutorial({app,onToggle:active=>teaching=active});
 const life=()=>getLife(),state=()=>life().state.workshop;
 function stop(){reader?.close();reader=null;cleanup();cleanup=()=>{};if(game&&life().state.pending&&state().phase==='play'){life().woodworkCheckpoint(game.snapshot());onSave();}game=null;}
 function close(){guide.close();stop();if(dialog.open)dialog.close();onChange();}
 dialog.addEventListener('cancel',()=>{guide.close();stop();onChange();});
 function header(title){const top=e('div','woodwork-top');top.append(e('strong','',title),b('稍後繼續',close));dialog.append(top);}
 function render(){
  stop();dialog.className='woodwork-dialog';dialog.replaceChildren();dialog.style.setProperty('--workshop-bg',`url("${new URL(config.questAssets.workshop,document.baseURI).href}")`);const phase=state().phase;
  if(['intro','aftermath','bakery','night'].includes(phase)){story();return;}
  header(life().state.pending.task==='carpenter-workbench'?'支線 04｜木匠的工作台':'卡爾工作坊 · 進階維修');
  if(phase==='learn'){dialog.append(e('p','','山田向卡爾學會了新技能「結構判讀」。'),b('開始維修',()=>{life().learnStructure();onSave();render();}));return;}
  if(phase==='choose'){
   if(!life().state.skills?.kentaro?.includes('structural-reading')){state().phase='learn';render();return;}
   dialog.append(e('h2','','先選今次維修的節奏'),e('p','','沿用山田的方向調整與長按固定。擾動會隨維修進度變化；保持中央；留意交叉箭嘴，反轉期間左鍵向右、右鍵向左，稍後恢復正常。進度滿後放手完成。'));
   const levels=e('div','woodwork-levels');for(const [id,rules] of Object.entries(WOOD_LEVELS)){const btn=b('',()=>{life().chooseWoodwork(id);onSave();render();});btn.append(e('strong','',rules.label),e('small','',`${id==='easy'?'較寬的綠區，較輕的擾動':id==='standard'?'正常綠區，留意不同方向的擾動':'較窄綠區，更頻密及強力的擾動'}`));levels.append(btn);}dialog.append(levels);return;
  }
  if(phase==='play'){
   const help=b('新手教學',()=>guide.show('woodwork-kentaro'));dialog.querySelector('.woodwork-top').append(help);game=new Woodwork(state().game);const box=e('section','');dialog.append(box);
   cleanup=mountWoodworkGame({box,game,onCue,isActive:()=>dialog.open&&!teaching&&!document.hidden,onChange:()=>{life().woodworkCheckpoint(game.snapshot());onSave();},onDone:()=>{life().woodworkCheckpoint(game.snapshot());state().phase=life().state.pending.task==='carpenter-workbench'?'aftermath':'settle';state().page=0;onSave();render();}});guide.enter('woodwork-kentaro');return;
  }
  if(phase==='reward'){
   const card=e('section','woodwork-skill-card');card.append(e('small','','山田專屬技能'),e('h2','','結構判讀'),e('p','','能夠分析多個零件之間的連動、支撐與受力關係。'),e('p','','結構判讀可提早察覺操作方向反轉；交叉箭嘴與按鍵圖示會顯示實際方向。完成故事後，卡爾工作坊開放重複維修委託。'));dialog.append(card,b('繼續 · 旅舍夜晚',()=>{state().phase='night';state().page=0;onSave();render();}));return;
  }
  if(phase==='settle'){life().complete();onSave();close();}
 }
 function story(){
  const scene=config.questStories['carpenter-workbench'].scenes.find(s=>s.id===state().phase),pages=scene.lines.flatMap(line=>paginateText(line.text).map((text,i)=>({...line,text,id:`${line.id}-${i}`})));
  reader=renderQuestReader({dialog,title:'支線 04｜木匠的工作台 · '+scene.title,pages,page:state().page,characters,background:pages[state().page]?.background||config.questAssets.workshop,onPage:page=>{state().page=page;onSave();render();},onEnd:()=>{state().phase={intro:'learn',aftermath:'bakery',bakery:'night',night:'settle'}[state().phase];state().page=0;onSave();render();},onPause:close,redraw:()=>{dialog.replaceChildren();story();}});
 }
 return {open(){render();if(!dialog.open)dialog.showModal();},close,get active(){return dialog.open;}};
}
