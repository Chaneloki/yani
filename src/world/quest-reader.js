import {Typewriter} from '../ui/typewriter.js';
const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const b=(text,fn,cls='')=>{const n=e('button',cls,text);n.type='button';n.onclick=fn;return n;};
// Shared visual-novel presentation for side stories; state stays with each quest.
export function renderQuestReader({dialog,title,pages,page,characters,background,onPage,onEnd,onPause,redraw}){
 const writer=new Typewriter();const line=pages[Math.min(page,pages.length-1)],speaker=line.speaker&&characters[line.speaker];
 dialog.classList.add('quest-story');dialog.style.setProperty('--quest-bg',`url("${new URL(background,document.baseURI).href}")`);
 const top=e('div','quest-story-top');top.append(e('span','',title),b('閱讀紀錄',()=>{writer.finish();const list=e('div','quest-backlog');list.append(b('返回閱讀',redraw));for(const p of pages.slice(0,page+1))list.append(e('p','',`${p.speaker?characters[p.speaker]?.shortName+'：':''}${p.text}`));dialog.replaceChildren(list);list.scrollTop=list.scrollHeight;}),b('稍後繼續',onPause));dialog.append(top);
 if(speaker){let expression='neutral';if(line.speaker==='kentaro'&&/可以買|分著吃|有點想試試看/.test(line.text))expression='happy';if(line.speaker==='kentaro'&&line.text==='「奈津美！」')expression='surprised';if(line.speaker==='natsumi'&&/很樂意|修橋的委託|在意那座橋/.test(line.text))expression='amused';const variant=line.speaker==='kentaro'?'hero':line.speaker==='natsumi'?'witch':'fantasy';const src=speaker.variants?.[variant]?.[expression]||speaker.variants?.[variant]?.neutral;if(src){const img=e('img','quest-story-portrait');img.src=src;img.alt=speaker.name;dialog.append(img);}}
 const box=e('article','quest-story-box');box.append(e('h3','',speaker?.shortName||'旁白'));const text=e('p','quest-story-text');text.setAttribute('aria-label',line.text);box.append(text);
 function advance(){if(writer.typing){writer.finish();return;}writer.cancel();if(page+1<pages.length)onPage(page+1);else onEnd();}
 const next=b('顯示全文 ↗',advance,'quest-story-next');box.append(next,b('快進本段文字',()=>{writer.cancel();onEnd();},'quest-story-skip'));box.onclick=event=>{if(!event.target.closest('button'))advance();};dialog.append(box);
 writer.start(line.text,t=>text.textContent=t,()=>next.textContent=page+1===pages.length?'繼續委託 ↗':'點擊繼續 ↗',matchMedia('(prefers-reduced-motion: reduce)').matches);
 return {close(){writer.cancel();}};
}
