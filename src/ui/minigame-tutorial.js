import {createTutorialPractice,TUTORIALS} from './tutorial-practices.js';
export class TutorialProgress{
 constructor(storage){this.storage=storage;this.key='yamada-nishi:dynamic-tutorials:v1';this.data={};try{const d=JSON.parse(storage?.getItem(this.key)||'{}');if(d&&typeof d==='object'&&!Array.isArray(d))this.data=d;}catch{}}
 asked(id){return this.data[id]?.offered===true;}
 choose(id,choice){this.data[id]={offered:true,choice};try{this.storage?.setItem(this.key,JSON.stringify(this.data));}catch{}}
}
let shared=null;
const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const b=(text,fn)=>{const n=e('button','',text);n.type='button';n.onclick=fn;return n;};
export function mountMiniTutorial({app,onToggle=()=>{}}){
 if(!shared){let storage;try{storage=window.localStorage;}catch{}shared=new TutorialProgress(storage);}
 const dialog=e('dialog','mini-tutorial-dialog');dialog.setAttribute('aria-label','小遊戲新手教學');app.append(dialog);let cleanup=()=>{},activeId=null,generation=0;
 function close(){generation++;cleanup();cleanup=()=>{};if(dialog.open)dialog.close();onToggle(false);}
 dialog.addEventListener('cancel',event=>{event.preventDefault();if(activeId&&!shared.asked(activeId))shared.choose(activeId,'skip');close();});
 function practice(id){cleanup();cleanup=()=>{};dialog.replaceChildren();const head=e('div','mini-tutorial-top');head.append(e('strong','',TUTORIALS[id].title+' · 親手練習'),b('離開教學',close));dialog.append(head,e('p','mini-tutorial-lead','練習不扣時間、不改任務進度。完成後回到原本遊戲。'));const box=e('section','mini-practice');const cancel=b('離開練習',close);cancel.className='inn-close-work';box.append(cancel);dialog.append(box);cleanup=createTutorialPractice(id,box,close)||(()=>{});}
 function open(id,offer){if(!TUTORIALS[id])return;activeId=id;onToggle(true);dialog.replaceChildren();if(offer){dialog.append(e('small','mini-tutorial-eyebrow','第一次玩這款小遊戲'),e('h2','',TUTORIALS[id].title),e('p','mini-tutorial-lead','要先親手試一次嗎？會一步一步帶你操作，唔需要先讀一大段說明。'));const actions=e('div','mini-tutorial-choices');actions.append(b('要，帶我試一次',()=>{shared.choose(id,'practice');practice(id);}),b('跳過，直接玩',()=>{shared.choose(id,'skip');close();}));dialog.append(actions,e('small','mini-tutorial-foot','只會問一次；之後可隨時按「新手教學」重開。'));}else practice(id);if(!dialog.open)dialog.showModal();}
 return {enter(id){const request=++generation;queueMicrotask(()=>{if(request===generation&&!shared.asked(id))open(id,true);});},show(id){generation++;shared.choose(id,'practice');open(id,false);},close,get active(){return dialog.open;}};
}
