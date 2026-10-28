import { loadStory } from './content/load.js';
import { NovelEngine } from './engine/engine.js';
import { SaveStore } from './engine/storage.js';
import { AudioManager } from './audio/audio-manager.js';
import { openAudioSettings } from './ui/settings.js';
import { chapterMessages } from './engine/messages.js';
const app = document.querySelector('#app');
const el = (tag, className, text) => { const e = document.createElement(tag); if(className) e.className=className; if(text !== undefined) e.textContent=text; return e; };
function button(text, action, className='') { const b=el('button',className,text); b.type='button'; b.onclick=action; return b; }
try {
 const story=await loadStory(); let engine=new NovelEngine(story); const store=new SaveStore(story,window.localStorage);
 app.innerHTML=`<main class="shell"><header><a class="brand" href="./">山田 <span>×</span> 西<small>YAMADA & NISHI</small></a><div class="edition">INTERACTIVE STORY <span>／ FOUNDATION 01</span></div><div class="system-controls"><button id="immersive" aria-label="切換全螢幕">⛶</button><button id="system-menu" aria-label="系統選單">⚙</button></div></header><section class="novel" aria-label="視覺小說舞台"><div class="background" aria-hidden="true"></div><div class="scenery" aria-hidden="true"><div class="window"></div><div class="sun"></div><div class="horizon"></div><div class="vignette"></div></div><img class="cg" alt="場景插圖" hidden><div class="scene-meta"><span id="chapter"></span><span id="timeline"></span></div><div class="scene-title"><small>兩人的故事，從這裡開始</small><h1></h1><p>VISUAL NOVEL · ENGINE PREVIEW</p></div><div class="portraits"></div><div class="stage-media" hidden></div><div class="reading"><div class="reading-top"><span id="perspective"></span><span id="content-status"></span></div><article class="dialogue"><div class="speaker"></div><div class="line-body"><div class="message-meta" hidden><span aria-hidden="true">✉</span><span id="message-label"></span></div><p id="text" aria-live="polite"></p></div><section class="message-thread" aria-label="本章手機訊息" hidden><div class="thread-header"><span>✉ 本章聊天紀錄</span><button id="latest-message">最新訊息 ↓</button></div><div class="message-scroll" role="log" aria-label="已讀訊息，由舊至新" tabindex="0"></div></section><div class="choices"></div><button id="advance" class="advance">點擊繼續 <span>↗</span></button></article></div></section><footer><div class="footer-note"><i></i> 把時間留給彼此 <span>／ 開發試映</span></div><nav aria-label="故事功能"></nav></footer><div class="status" role="status" aria-live="polite"></div></main><dialog aria-labelledby="panel-title"><div class="panel-header"><h2 id="panel-title"></h2><button id="close-panel" aria-label="關閉">✕</button></div><div class="panel-body"></div></dialog>`;
 const audio=new AudioManager(story.assets,window.localStorage);
 audio.bgm.id='bgm-player';audio.bgm.hidden=true;audio.bgm.setAttribute('aria-hidden','true');app.append(audio.bgm);
 document.addEventListener('pointerdown',()=>{void audio.unlock();},{passive:true});
 document.addEventListener('keydown',()=>{void audio.unlock();});
 const $=s=>app.querySelector(s); const modal=$('dialog'); let previousScene='';
 const imageViewer=el('dialog','media-viewer');imageViewer.setAttribute('aria-label','圖片預覽');
 const imageTitle=el('h2',''),imageClose=button('✕',()=>imageViewer.close());imageClose.setAttribute('aria-label','關閉圖片');
 const imageHeading=el('div','panel-header');imageHeading.append(imageTitle,imageClose);
 const fullImage=el('img','message-full-image');imageViewer.append(imageHeading,fullImage);app.append(imageViewer);
 imageViewer.onclick=e=>{if(e.target===imageViewer){const r=imageViewer.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)imageViewer.close();}};
 function attachmentButtons(node){return (node.attachments || []).map(id=>{
   const asset=story.assets.messageImages[id];
   const b=button('',()=>{imageTitle.textContent=asset.label;fullImage.src=new URL(asset.src,document.baseURI).href;fullImage.alt=asset.alt || asset.label;imageViewer.showModal();},'message-photo');
   const category=asset.kind==='sticker'?'貼圖':['illustration','screenshot'].includes(asset.kind)?'圖片':'照片';b.dataset.kind=asset.kind || 'photo';
   b.style.setProperty('--image-ratio',`${asset.width || 320} / ${asset.height || 240}`);
   b.setAttribute('aria-label',`放大${category}：${asset.label}`);
   const img=el('img');img.src=new URL(asset.src,document.baseURI).href;img.alt=asset.alt || asset.label;img.width=asset.width || 320;img.height=asset.height || 240;
   // Retain bottom anchoring after the image finishes decoding.
   img.onload=()=>{const log=$('.message-scroll');if(b.closest('.message-scroll') && log.dataset.followBottom==='true')log.scrollTop=log.scrollHeight;};
   b.append(img,el('span','',`點擊放大${category} ↗`));return b;
 });}
 const notify=text=>{$('.status').textContent=text;};
 const safe=action=>{try {action();}catch(e){notify(e.message || '操作失敗');}};
 function autosave(){safe(()=>store.save('auto',engine.snapshot()));}
 function render(){
  const s=engine.scene,n=engine.node,stage=engine.stage,bg=story.assets.backgrounds[stage.background];
  audio.sync(stage.bgm ?? null);
  $('.novel').dataset.theme=bg.theme; $('.novel').dataset.hasBackground=String(!!bg.src); $('.novel').dataset.memory=String(s.memory===true); $('.background').style.backgroundImage=bg.src?`url("${new URL(bg.src,document.baseURI).href}")`:'';
  if(previousScene!==s.id){$('.novel').classList.remove('enter');void $('.novel').offsetWidth;$('.novel').classList.add('enter');previousScene=s.id;}
  $('.stage-media').hidden=!stage.media;
  $('.stage-media').dataset.orientation=stage.media && story.assets.messageImages[stage.media].height>story.assets.messageImages[stage.media].width?'portrait':'landscape';
  $('.stage-media').replaceChildren(...(stage.media?attachmentButtons({attachments:[stage.media]}):[]));
  const cg=stage.cg && story.assets.cg[stage.cg]; $('.cg').hidden=!cg; if(cg) $('.cg').src=new URL(cg.src,document.baseURI).href;
  const chapter=story.chapters.find(c=>c.id===s.chapterId);
  $('#chapter').textContent=`${chapter.title} ／ ${s.title}`;
  $('#content-status').textContent=chapter.demo?'DEMO · 非正式劇情':'序章 · 作者原稿';
  $('#timeline').textContent=s.timeline; $('.scene-title h1').textContent=s.title;
  $('#perspective').textContent=`${story.characters[s.perspective].shortName} 視角`;
  $('.speaker').textContent=n.type==='narration'?'旁白':n.type==='choice'?'你的選擇':`${story.characters[n.speaker].shortName}${n.type==='thought'?' · 心聲':n.channel==='message'?' · 訊息':n.channel==='recollection'?' · 訊息回想':''}`;
  $('#text').textContent=n.text; $('.dialogue').dataset.type=n.type;
  const isMessage=['message','recollection'].includes(n.channel);
  $('.dialogue').dataset.channel=n.channel || 'speech';
  $('.novel').dataset.channel=n.channel || 'speech';
  $('.novel').dataset.nodeType=n.type;
  $('.novel').dataset.showPortrait=String(n.showPortrait ?? (n.type==='dialogue' && !(n.channel==='message' && n.speaker===s.perspective)));
  $('.novel').dataset.direction=n.speaker===s.perspective?'sent':'received';
  $('.dialogue').dataset.direction=n.speaker===s.perspective?'sent':'received';
  $('.message-meta').hidden=!isMessage;
  $('#message-label').textContent=n.channel==='recollection'?'訊息回想':`手機訊息 · ${n.speaker===s.perspective?'傳出':'收到'}`;
  $('.line-body').classList.remove('message-arrive');
  if(isMessage){void $('.line-body').offsetWidth;$('.line-body').classList.add('message-arrive');}

  $('.message-thread').hidden=n.channel!=='message';
  if(n.channel==='message'){
    const messages=chapterMessages(story,engine.state),rows=[];let lastScene='';
    for(const {scene,node} of messages){
      if(lastScene!==scene.id){rows.push(el('p','message-date',scene.timeline));lastScene=scene.id;}
      const bubble=el('article','thread-bubble');bubble.dataset.direction=node.speaker===s.perspective?'sent':'received';
      bubble.append(el('small','',`${story.characters[node.speaker].shortName} · ${node.speaker===s.perspective?'傳出':'收到'}`),el('p','',node.text),...attachmentButtons(node));rows.push(bubble);
    }
    $('.message-scroll').dataset.followBottom='true';
    $('.message-scroll').replaceChildren(...rows);
    $('.message-scroll').scrollTop=$('.message-scroll').scrollHeight;
  }

  $('.portraits').replaceChildren(...stage.portraits.map(p=>{
    const c=story.characters[p.character],src=c.variants[p.variant][p.expression],card=el('div',`portrait ${p.position}`);
    card.classList.toggle('has-art',!!src);card.classList.toggle('active',n.speaker===p.character || (n.type==='narration' && p.character===s.perspective));card.style.setProperty('--character-color',c.color);
    if(src){const img=el('img');img.src=new URL(src,document.baseURI).href;img.alt=`${c.name} · ${p.variant} · ${p.expression}`;img.onerror=()=>{img.remove();card.append(el('p','',`${c.shortName} · 圖像未能載入`));};card.append(img);}
    else {card.append(el('div','placeholder-figure'),el('span','portrait-mark',p.character==='natsumi'?'西':'山田'),el('p','',c.shortName),el('small','',`${{real:'日常',hero:'勇者',witch:'魔女'}[p.variant]} / ${p.expression==='smile'?'微笑':'自然'} · 立繪預留`));}
    return card;
  }));
  $('.choices').replaceChildren(...(n.options||[]).map((o,i)=>button(`${String(i+1).padStart(2,'0')}  ${o.text}`,()=>{engine.choose(o.id);autosave();render();},'choice')));
  $('#advance').hidden=n.type==='choice';$('#advance').disabled=engine.ended;$('#advance').textContent=engine.ended?(s.endLabel || '本段讀畢 · 可從章節選單重看'):(n.advanceLabel || '點擊繼續 ↗');
 }
 $('.message-scroll').onscroll=()=>{const log=$('.message-scroll');log.dataset.followBottom=String(log.scrollHeight-log.clientHeight-log.scrollTop<3);};
 $('#latest-message').onclick=()=>{$('.message-scroll').scrollTop=$('.message-scroll').scrollHeight;};
 function next(){if(modal.open || imageViewer.open)return;if(engine.advance()){autosave();render();}}
 $('#advance').onclick=next;
 $('.novel').onclick=e=>{if(!e.target.closest('button,.message-thread'))next();};
 document.addEventListener('keydown',e=>{if(!modal.open && !imageViewer.open && ['Space','ArrowRight'].includes(e.code) && !e.target.closest('button,a,input,select,.message-thread')){e.preventDefault();next();}});
 function panel(title){$('#panel-title').textContent=title;$('.panel-body').replaceChildren();modal.showModal();return $('.panel-body');}
 $('#close-panel').onclick=()=>modal.close();
 modal.onclick=e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}};
 function confirmPanel(text,action){const body=panel('確認操作');body.append(el('p','',text),button('確定',()=>{modal.close();safe(action);},'primary'),button('取消',()=>modal.close()));}
 function slots(mode){
  const body=panel(mode==='save'?'把這一刻留下':'回到故事裡');
  body.append(el('p','muted','存檔僅保存在目前瀏覽器。清除網站資料會移除存檔。'));
  for(const slot of (mode==='save'?['1','2','3']:['auto','1','2','3'])){
    let data=null,error='';try{data=store.load(slot);}catch(e){error=e.message;}
    const card=el('div','slot'),label=slot==='auto'?'自動存檔':`手動存檔 ${slot}`;
    card.append(el('strong','',label),el('p','muted',error || (data?`${story.scenes[data.state.sceneId].title} · ${new Date(data.savedAt).toLocaleString('zh-Hant')}`:'尚未存檔')));
    const b=button(mode==='save'?'儲存':'讀取',()=>{
      const action=()=>{if(mode==='save'){store.save(slot,engine.snapshot());notify('進度已儲存');}else{const fresh=store.load(slot);if(!fresh)throw Error('沒有存檔');engine=new NovelEngine(story,fresh.state);render();notify('已還原進度、視角與舞台');}if(modal.open)modal.close();};
      if(mode==='save'&&(data||error)) {modal.close();confirmPanel('覆蓋這個存檔槽的現有內容？',action);}
      else if(mode==='load'){modal.close();confirmPanel('讀取這份存檔，取代目前閱讀進度？',action);}
      else safe(action);
    });b.disabled=mode==='load'&&(!data||!!error);card.append(b);body.append(card);
  }
 }
 $('nav').append(button('章節',()=>{const body=panel('故事目錄');body.append(el('p','muted','序章以奈津美、健太郎的雙視角呈現約會前夕。可依序閱讀，亦可自由選擇視角。'));
   function sceneButton(sceneId,title){const s=story.scenes[sceneId];return button(`${title}　／ ${story.characters[s.perspective].shortName}`,()=>{modal.close();confirmPanel('從這個場景開頭閱讀？目前手動存檔會保留。',()=>{engine.go(s.id);autosave();render();});},'chapter-button');}
   for(const c of story.chapters){
     body.append(el('h3','',c.title));
     if(c.entries){for(const entry of c.entries)body.append(sceneButton(entry.scene,entry.title));
       const details=el('details','scene-list');details.append(el('summary','','展開序章場景'));for(const s of c.scenes)details.append(sceneButton(s.id,s.title));body.append(details);
     }else{const details=el('details','scene-list');details.append(el('summary','',c.demo?'開發示範（非正式劇情）':'場景清單'));for(const s of c.scenes)details.append(sceneButton(s.id,s.title));body.append(details);}
   }
 }),button('閱讀紀錄',()=>{const body=panel('走過的字句');for(const h of engine.state.history){const s=story.scenes[h.sceneId],n=s.nodes.find(n=>n.id===h.nodeId);const item=el('article','history-entry');item.dataset.channel=n.channel || 'speech';item.append(el('small','',`${s.title} · ${story.characters[s.perspective].shortName}視角`),el('strong','',n.speaker?`${story.characters[n.speaker].shortName}${n.channel==='message'?' · 訊息':''}`:'旁白'),el('p','',n.text),...attachmentButtons({...n,attachments:[...(n.attachments || []),...(n.stage?.media?[n.stage.media]:[])]}));body.append(item);}
   modal.scrollTop=modal.scrollHeight;
 }),button('存檔',()=>slots('save')),button('讀檔',()=>slots('load')),button('設定',()=>openAudioSettings({panel,audio,el,button,modal})));
 $('#system-menu').onclick=()=>{const body=panel('系統選單');body.append(el('p','muted','山田 × 西 · 序章'));for(const b of $('nav').querySelectorAll('button'))body.append(button(b.textContent,()=>{modal.close();b.click();},'menu-button'));body.append(button('切換全螢幕',()=>{modal.close();$('#immersive').click();},'menu-button'));};
 $('#immersive').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else notify('此瀏覽器未提供全螢幕模式；已使用自適應舞台。');}catch{notify('目前無法啟用全螢幕模式。');}};
 render();notify('');
 // Do not overwrite an earlier autosave before the player has chosen to continue or load it.
} catch(e){app.replaceChildren(el('main','fatal',`無法啟動：${e.message}`));}
