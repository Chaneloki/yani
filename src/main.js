import {mountVillage} from './world/village-ui.js';
import {CgDirection} from './ui/cg-direction.js';
import {SceneDissolve,PortraitReaction} from './ui/scene-direction.js';
import {SceneEffects} from './ui/scene-effects.js';
import {nextChapter} from './ui/chapter-transition.js';
import {HoldToAdvance} from './ui/hold-to-advance.js';
import { mountSkyrailGame } from './ui/skyrail-game.js';
import { BackgroundCamera } from './ui/background-camera.js';
import { Typewriter } from './ui/typewriter.js';
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
 const updates=await (await fetch(new URL('./content/changelog.json',import.meta.url))).json();
 const story=await loadStory(); let engine=new NovelEngine(story); const store=new SaveStore(story,window.localStorage);
 app.innerHTML=`<main class="shell"><header><a class="brand" href="./">山田 <span>×</span> 西<small>YAMADA & NISHI</small></a><div class="edition">INTERACTIVE STORY <span>／ FOUNDATION 01</span></div><div class="system-controls"><button id="immersive" aria-label="切換全螢幕">⛶</button><button id="system-menu" aria-label="系統選單">⚙</button></div></header><section class="novel" aria-label="視覺小說舞台"><div class="background" aria-hidden="true"></div><div class="scenery" aria-hidden="true"><div class="window"></div><div class="sun"></div><div class="horizon"></div><div class="vignette"></div></div><img class="cg" alt="場景插圖" hidden><video class="cg-video" aria-label="動態場景插圖" playsinline preload="metadata" hidden></video><div class="scene-meta"><span id="chapter"></span><span id="timeline"></span></div><div class="scene-title"><small>兩人的故事，從這裡開始</small><h1></h1><p>VISUAL NOVEL · ENGINE PREVIEW</p></div><div class="portraits"></div><div class="game-avatars" aria-label="遊戲角色背面" hidden></div><aside class="stage-media phone-preview" aria-label="手機圖片" hidden><div class="phone-status" aria-hidden="true">9:41 <span>● ▰</span></div><div class="phone-preview-heading">手機相簿</div><div class="phone-media-content"></div><div class="phone-home" aria-hidden="true"></div></aside><div class="reading"><div class="reading-top"><span id="perspective"></span><span id="content-status"></span></div><article class="dialogue"><div class="speaker"></div><div class="line-body"><div class="message-meta" hidden><span aria-hidden="true">✉</span><span id="message-label"></span></div><p id="text" aria-live="polite"></p></div><section class="message-thread" aria-label="本章手機訊息" hidden><img class="phone-contact-art" alt="" aria-hidden="true"><div class="phone-status" aria-hidden="true">9:41 <span>● ▰</span></div><div class="thread-header"><span id="phone-contact">✉ 本章聊天紀錄</span><button id="latest-message">最新訊息 ↓</button></div><div class="message-scroll" role="log" aria-label="已讀訊息，由舊至新" tabindex="0"></div><div class="phone-home" aria-hidden="true"></div></section><div class="choices"></div><button id="advance" class="advance">點擊繼續 <span>↗</span></button></article></div></section><footer><div class="footer-note"><i></i> 把時間留給彼此 <span>／ 開發試映</span></div><nav aria-label="故事功能"></nav></footer><div class="status" role="status" aria-live="polite"></div></main><dialog aria-labelledby="panel-title"><div class="panel-header"><h2 id="panel-title"></h2><button id="close-panel" aria-label="關閉">✕</button></div><div class="panel-body"></div></dialog>`;
 let village;
 const audio=new AudioManager(story.assets,window.localStorage);
 audio.bgm.id='bgm-player';audio.bgm.hidden=true;audio.bgm.setAttribute('aria-hidden','true');app.append(audio.bgm);
 document.addEventListener('pointerdown',()=>{void audio.unlock();},{passive:true});
 document.addEventListener('keydown',()=>{void audio.unlock();});
 const $=s=>app.querySelector(s); const modal=$('dialog'); let previousScene='',atHome=true;
 const typewriter=new Typewriter();
 const rescue=mountSkyrailGame({app,assets:story.assets,characters:story.characters,
  onComplete:role=>{engine.completeMinigame(role);autosave();render();},
  onSkip:()=>{engine.completeMinigame('read');autosave();render();}});
 const cgVideo=$('.cg-video');cgVideo.muted=true;cgVideo.playsInline=true;
 let currentCgVideo=null,cgVideoFailed=false;
 cgVideo.addEventListener('error',()=>{cgVideoFailed=true;cgVideo.hidden=true;});
 const scenicMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 const camera=new BackgroundCamera($('.background'),{reduced:()=>scenicMotion.matches});
 const cgCamera=new BackgroundCamera($('.cg'),{reduced:()=>scenicMotion.matches});
 scenicMotion.addEventListener('change',()=>{camera.reset();cgCamera.reset();if(scenicMotion.matches){cgVideo.pause();cgVideo.hidden=true;}});
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
 function render({sound=false}={}){
  if(!sound || fastForward.active)audio.stopSE();
  else if(engine.node.se)void audio.playSE(engine.node.se);
  typewriter.cancel();
  fastButton.hidden=engine.ended || engine.node.type==='choice' || !!engine.node.minigame;
  let revealTarget=$('#text'),revealAttachments=[];
  const s=engine.scene,n=engine.node,stage=engine.stage,bg=story.assets.backgrounds[stage.background];
  const reducedMotionNow=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nextCg=stage.cg&&story.assets.cg[stage.cg];
  const nextVisual={src:nextCg?(nextCg.type==='video'?nextCg.poster:nextCg.src):bg.src,position:nextCg?.position||'center'};
  const oldVisual=$('.novel').dataset.hasCg==='true'?$('.cg'):$('.background');
  sceneDissolve.update(`${stage.background}/${stage.cg||''}`,nextVisual,{skip:fastForward.active||reducedMotionNow,oldTransform:getComputedStyle(oldVisual).transform,oldPosition:getComputedStyle(oldVisual).objectPosition,oldFrame:oldVisual.dataset.framed==='true'?{top:getComputedStyle(oldVisual).top,height:getComputedStyle(oldVisual).height}:null});
  cgViewButton.hidden=!stage.cg;if(!stage.cg&&cgViewing)setCgViewing(false);
  audio.sync(stage.bgm ?? null,{instant:fastForward.active||reducedMotionNow});
  $('.novel').dataset.lighting=stage.lighting || 'normal';
  sceneEffects.play(`${s.id}/${n.id}`,n.effect,{reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches,fast:fastForward.active});
  $('.novel').dataset.theme=bg.theme; $('.novel').dataset.hasBackground=String(!!bg.src); $('.novel').dataset.memory=String(s.memory===true); $('.background').style.backgroundImage=bg.src?`url("${new URL(bg.src,document.baseURI).href}")`:'';
  camera.update(`${s.id}/${stage.background}`,stage.cg?null:(stage.camera ?? null));
  if(previousScene!==s.id){$('.novel').classList.remove('enter');void $('.novel').offsetWidth;$('.novel').classList.add('enter');previousScene=s.id;}
  // Phone photos are a cue on this page, not a persistent scene layer.
  const phoneMedia=n.stage?.media || null;
  $('.stage-media').hidden=!phoneMedia || n.channel==='message';
  $('.stage-media').dataset.orientation=phoneMedia && story.assets.messageImages[phoneMedia].height>story.assets.messageImages[phoneMedia].width?'portrait':'landscape';
  $('.phone-media-content').replaceChildren(...(phoneMedia?attachmentButtons({attachments:[phoneMedia]}):[]));
  $('.novel').dataset.phonePhoto=String(!!phoneMedia && n.channel!=='message');
  const avatars=stage.gameAvatars || [];
  $('.game-avatars').hidden=!avatars.length || n.showGameAvatars!==true || !!stage.cg;
  $('.game-avatars').replaceChildren(...avatars.map(p=>{
    const image=el('img');image.src=new URL(story.characters[p.character].variants[p.variant][p.expression],document.baseURI).href;
    image.alt=`${story.characters[p.character].shortName}的遊戲角色 · 背面`;
    return image;
  }));
  const cg=stage.cg && story.assets.cg[stage.cg];
  $('.novel').dataset.hasCg=String(!!cg);
  $('.cg').style.transformOrigin=cg?.cameraOrigin || '50% 45%';

  const poster=cg?.type==='video'?cg.poster:cg?.src;
  $('.cg').style.objectPosition=cg?.position || 'center';
  $('.cg').hidden=!poster;if(poster){$('.cg').src=new URL(poster,document.baseURI).href;$('.cg').alt=cg.label || '場景插圖';}
  if(cg?.cameraSequence&&cg.type==='image'){cgCamera.reset();cgDirection.update(stage.cg,cg,{skip:fastForward.active||reducedMotionNow});}else{cgDirection.reset();$('.cg').style.transform='';cgCamera.update(stage.cg || 'none',cg?.type==='image'?(cg.camera || null):null);}
  if(cg?.type==='video'){
    if(currentCgVideo!==stage.cg){
      cgVideo.pause();currentCgVideo=stage.cg;cgVideoFailed=false;
      cgVideo.src=new URL(cg.src,document.baseURI).href;cgVideo.poster=poster?new URL(poster,document.baseURI).href:'';
      cgVideo.loop=cg.loop===true;cgVideo.setAttribute('aria-label',cg.label || '動態場景插圖');
      if(!scenicMotion.matches)void cgVideo.play().catch(()=>{});
    }
    cgVideo.hidden=cgVideoFailed || scenicMotion.matches;
  }else{cgVideo.pause();cgVideo.hidden=true;currentCgVideo=null;}

  const chapter=story.chapters.find(c=>c.id===s.chapterId);
  $('#chapter').textContent=`${chapter.title} ／ ${s.title}`;
  $('#content-status').textContent=chapter.demo?'DEMO · 非正式劇情':`${chapter.title.split(' · ')[0]} · 故事正文`;
  $('#timeline').textContent=s.timeline; $('.scene-title h1').textContent=s.title;
  $('#perspective').hidden=s.chapterId!=='prologue';
  $('#perspective').textContent=s.chapterId==='prologue'?`${story.characters[s.perspective].shortName} 視角`:'';
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
    const contact=story.characters[s.perspective==='natsumi'?'kentaro':'natsumi'];
    $('.phone-contact-art').src=new URL(contact.variants.real.neutral,document.baseURI).href;
    $('#phone-contact').textContent=`${story.characters[s.perspective==='natsumi'?'kentaro':'natsumi'].shortName} · 訊息`;
    const messages=chapterMessages(story,engine.state),rows=[];let lastScene='';
    for(const {scene,node} of messages){
      if(lastScene!==scene.id){rows.push(el('p','message-date',scene.timeline));lastScene=scene.id;}
      const bubble=el('article','thread-bubble');bubble.dataset.direction=node.speaker===s.perspective?'sent':'received';
      const messageText=el('p','',node.text),attachments=attachmentButtons(node);
      if(scene.id===s.id && node.id===n.id){revealTarget=messageText;revealAttachments=attachments;bubble.dataset.currentMessage='true';}
      bubble.append(el('small','',`${story.characters[node.speaker].shortName} · ${node.speaker===s.perspective?'傳出':'收到'}`),messageText,...attachments);rows.push(bubble);
    }
    $('.message-scroll').dataset.followBottom='true';
    $('.message-scroll').replaceChildren(...rows);
    $('.message-scroll').scrollTop=$('.message-scroll').scrollHeight;
  }

  $('.portraits').replaceChildren(...stage.portraits.map(p=>{
    const c=story.characters[p.character],expression=n.speaker===p.character && c.variants[p.variant][n.portraitExpression]?n.portraitExpression:p.expression,src=c.variants[p.variant][expression],card=el('div',`portrait ${p.position}`);
    card.dataset.layout=c.portraitLayout || 'full';card.classList.toggle('has-art',!!src);card.classList.toggle('active',n.speaker===p.character || (n.type==='narration' && p.character===s.perspective));card.style.setProperty('--character-color',c.color);
    if(src){const img=el('img');img.src=new URL(src,document.baseURI).href;img.alt=`${c.name} · ${p.variant} · ${expression}`;img.onerror=()=>{img.remove();card.append(el('p','',`${c.shortName} · 圖像未能載入`));};card.append(img);}
    else {card.append(el('div','placeholder-figure'),el('span','portrait-mark',p.character==='natsumi'?'西':'山田'),el('p','',c.shortName),el('small','',`${{real:'日常',hero:'勇者',witch:'魔女'}[p.variant]} / ${p.expression==='smile'?'微笑':'自然'} · 立繪預留`));}
    return card;
  }));
  portraitReaction.play(`${s.id}/${n.id}`,n.portraitMotion,$('.portrait.active'),{skip:fastForward.active||reducedMotionNow||!!stage.cg});
  $('.choices').replaceChildren(...(n.options||[]).map((o,i)=>button(`${String(i+1).padStart(2,'0')}  ${o.text}`,()=>{engine.choose(o.id);autosave();render({sound:true});},'choice')));
  const settled=()=>{
    revealTarget.removeAttribute('aria-label');
    revealAttachments.forEach(a=>{a.hidden=false;});
    $('.choices').hidden=false;
    $('#advance').hidden=n.type==='choice';$('#advance').disabled=engine.ended && s.chapterId!=='chapter-02';
    $('#advance').textContent=engine.ended?(s.chapterId==='chapter-02'?'進入村莊 · 解鎖踩地圖 ↗':(s.endLabel || '本段讀畢 · 可從章節選單重看')):(nextChapter(story,s,n)?`下一章 · ${nextChapter(story,s,n).next.title.split(' · ')[0]} ↗`:(n.minigame?'開始列車救援 ↗':(n.advanceLabel || '點擊繼續 ↗')));
    $('.novel').dataset.typing='false';
    const log=$('.message-scroll');if(n.channel==='message' && log.dataset.followBottom==='true')log.scrollTop=log.scrollHeight;
  };
  revealTarget.style.minHeight='';
  revealTarget.style.minHeight=`${revealTarget.getBoundingClientRect().height}px`;
  revealTarget.setAttribute('aria-label',n.text);revealTarget.setAttribute('aria-live','off');
  revealAttachments.forEach(a=>{a.hidden=true;});$('.choices').hidden=true;
  $('#advance').hidden=false;$('#advance').disabled=false;$('#advance').textContent='顯示全文 ↗';
  $('.novel').dataset.typing='true';
  typewriter.start(n.text,text=>{revealTarget.textContent=text;},settled,window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 }
 $('.message-scroll').onscroll=()=>{const log=$('.message-scroll');log.dataset.followBottom=String(log.scrollHeight-log.clientHeight-log.scrollTop<3);};
 let messageGesture=null;
 $('.message-scroll').onpointerdown=e=>{messageGesture={x:e.clientX,y:e.clientY,scroll:$('.message-scroll').scrollTop};};
 $('.message-scroll').onpointerup=e=>{
   const gesture=messageGesture;messageGesture=null;
   if(gesture && !e.target.closest('button') && e.target.closest('[data-current-message=true]') && Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)<8 && Math.abs($('.message-scroll').scrollTop-gesture.scroll)<3)next();
 };
 $('.message-scroll').onpointercancel=()=>{messageGesture=null;};
 $('#latest-message').onclick=()=>{$('.message-scroll').scrollTop=$('.message-scroll').scrollHeight;};
 const oldSceneImage=el('img','scene-dissolve-layer');oldSceneImage.alt='';oldSceneImage.setAttribute('aria-hidden','true');oldSceneImage.hidden=true;$('.novel').append(oldSceneImage);
 const sceneDissolve=new SceneDissolve(oldSceneImage),portraitReaction=new PortraitReaction();
 const cgAtmosphere=el('div','cg-atmosphere');cgAtmosphere.setAttribute('aria-hidden','true');cgAtmosphere.hidden=true;$('.novel').append(cgAtmosphere);
 const cgBackdrop=el('div','cg-wide-backdrop');cgBackdrop.setAttribute('aria-hidden','true');cgBackdrop.hidden=true;$('.novel').prepend(cgBackdrop);
 const cgDirection=new CgDirection($('.cg'),cgAtmosphere,{backdrop:cgBackdrop});
 window.addEventListener('resize',()=>{const id=engine.stage.cg,cg=id&&story.assets.cg[id];if(!atHome&&cg?.cameraSequence)cgDirection.update(id,cg,{skip:fastForward.active||window.matchMedia('(prefers-reduced-motion: reduce)').matches});});
 scenicMotion.addEventListener('change',()=>{const id=engine.stage.cg,cg=id&&story.assets.cg[id];if(!atHome&&cg?.cameraSequence)cgDirection.update(id,cg,{skip:fastForward.active||scenicMotion.matches});});
 let cgViewing=false;
 const cgViewButton=button('◉',()=>setCgViewing(true),'cg-view-button');cgViewButton.id='cg-view';cgViewButton.setAttribute('aria-label','隱藏介面欣賞 CG');cgViewButton.title='欣賞 CG（H）';cgViewButton.hidden=true;$('.system-controls').prepend(cgViewButton);
 const cgReturnButton=button('返回閱讀 · H',()=>setCgViewing(false),'cg-view-return');$('.novel').append(cgReturnButton);
 function setCgViewing(value){if(value&&!engine.stage.cg)return;fastForward.stop();if(value)typewriter.finish();cgViewing=value;$('.shell').classList.toggle('cg-viewing',value);if(value)cgReturnButton.focus({preventScroll:true});else if(!atHome)$('#advance').focus({preventScroll:true});}
 document.addEventListener('keydown',e=>{if(atHome||modal.open||imageViewer.open||rescue.dialog.open)return;if(e.target.closest('input,textarea,select'))return;if(e.code==='KeyH'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.repeat){e.preventDefault();setCgViewing(!cgViewing);}else if(cgViewing&&['Escape','Space','Enter','ArrowRight'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();setCgViewing(false);}});
 const effectOverlay=el('div','scene-effect-overlay');effectOverlay.setAttribute('aria-hidden','true');$('.novel').append(effectOverlay);
 const sceneEffects=new SceneEffects([$('.background'),$('.cg'),$('.portraits')],effectOverlay);
 const fastButton=button('⏩ 長按快進',()=>{},'fast-forward');fastButton.id='fast-forward';fastButton.title='按住快進，放手即停；章末、選項及小遊戲入口會自動停下';fastButton.setAttribute('aria-label','長按快進');fastButton.setAttribute('aria-pressed','false');$('.dialogue').append(fastButton);
 const fastForward=new HoldToAdvance({
  canRun:()=>!atHome&&!cgViewing&&!modal.open&&!imageViewer.open&&!rescue.dialog.open&&!engine.ended&&engine.node.type!=='choice'&&!engine.node.minigame&&!nextChapter(story,engine.scene,engine.node),
  step:()=>{typewriter.finish();if(!engine.advance())return false;autosave();render();typewriter.finish();return true;},
  onActive:active=>{if(active)audio.stopSE();cgDirection.setFast(active);fastButton.textContent=active?'⏩ 快進中 · 放手停止':'⏩ 長按快進';fastButton.setAttribute('aria-pressed',String(active));}
 });
 fastButton.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();fastButton.setPointerCapture(e.pointerId);fastForward.start();};
 fastButton.onpointerup=fastButton.onpointercancel=fastButton.onlostpointercapture=()=>fastForward.stop();
 fastButton.oncontextmenu=e=>e.preventDefault();
 fastButton.onkeydown=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();if(!e.repeat)fastForward.start();}};
 fastButton.onkeyup=e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();fastForward.stop();}};
 fastButton.onblur=()=>fastForward.stop();window.addEventListener('blur',()=>fastForward.stop());document.addEventListener('visibilitychange',()=>{if(document.hidden)fastForward.stop();});
 function showChapterTransition(transition){
  const body=panel('章節交接');body.classList.add('chapter-transition');
  const card=el('section','chapter-transition-card');card.append(el('small','chapter-complete',`${transition.current.title.split(' · ')[0]} · 完`),el('p','chapter-finished-title',transition.current.title.split(' · ').slice(1).join(' · ')),el('div','chapter-divider','◇'),el('small','chapter-next-label','NEXT CHAPTER · 下一章'),el('h3','chapter-next-title',transition.next.title.split(' · ')[0]),el('p','chapter-next-subtitle',transition.next.title.split(' · ').slice(1).join(' · ')),button('繼續下一章 ↗',()=>{modal.close();engine.advance();autosave();render({sound:true});$('#advance').focus({preventScroll:true});},'chapter-continue'),button('留在本章',()=>modal.close(),'chapter-stay'));body.append(card);
 }
 function next(){if(cgViewing){setCgViewing(false);return;}if(atHome || modal.open || imageViewer.open || rescue.dialog.open)return;if(typewriter.typing){typewriter.finish();return;}if(engine.ended&&engine.scene.chapterId==='chapter-02'){enterVillage();return;}if(engine.node.minigame){rescue.open(engine.node.minigame);return;}const transition=nextChapter(story,engine.scene,engine.node);if(transition){showChapterTransition(transition);return;}if(engine.advance()){autosave();render({sound:true});}}
 $('#advance').onclick=next;
 $('.novel').onclick=e=>{if(cgViewing){setCgViewing(false);return;}if(!e.target.closest('button,.message-thread'))next();};
 document.addEventListener('keydown',e=>{if(!e.repeat && !atHome && !modal.open && !imageViewer.open && !rescue.dialog.open && ['Space','ArrowRight'].includes(e.code) && (!e.target.closest('button,a,input,select,.message-thread') || e.target.id==='advance')){e.preventDefault();next();}});
 function panel(title){fastForward.stop();$('.panel-body').classList.remove('chapter-transition');$('#panel-title').textContent=title;$('.panel-body').replaceChildren();modal.showModal();return $('.panel-body');}
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
      const action=()=>{if(mode==='save'){store.save(slot,engine.snapshot());notify('進度已儲存');}else{const fresh=store.load(slot);if(!fresh)throw Error('沒有存檔');engine=new NovelEngine(story,fresh.state);if(fresh.state.mode==='world')enterVillage(fresh.state.world);else showGame();notify(fresh.migrated?'已將舊進度對應至新版章節；原存檔仍保留':'已還原閱讀進度與舞台');}if(modal.open)modal.close();};
      if(mode==='save'&&(data||error)) {modal.close();confirmPanel('覆蓋這個存檔槽的現有內容？',action);}
      else if(mode==='load'){modal.close();confirmPanel('讀取這份存檔，取代目前閱讀進度？',action);}
      else safe(action);
    });b.disabled=mode==='load'&&(!data||!!error);card.append(b);body.append(card);
  }
 }
 $('nav').append(button('章節',()=>{const body=panel('故事目錄');body.append(el('p','muted','序章以奈津美、健太郎的雙視角呈現約會前夕。可依序閱讀，亦可自由選擇視角。'));
   function sceneButton(sceneId,title){const s=story.scenes[sceneId];return button(s.chapterId==='prologue'?`${title}　／ ${story.characters[s.perspective].shortName}`:title,()=>{modal.close();confirmPanel('從這個場景開頭閱讀？目前手動存檔會保留。',()=>{engine.go(s.id);autosave();render();});},'chapter-button');}
   for(const c of story.chapters){
     body.append(el('h3','',c.title));
     for(const a of c.activities || [])body.append(button(`互動遊戲 · ${a.title}`,()=>{modal.close();confirmPanel('從列車協力救援開始？手動存檔會保留。',()=>{engine.jumpToNode(a.scene,a.node);autosave();render();typewriter.finish();rescue.open(engine.node.minigame);});},'chapter-button'));
     if(c.entries){for(const entry of c.entries)body.append(sceneButton(entry.scene,entry.title));
       const details=el('details','scene-list');details.append(el('summary','',`展開${c.title.split(' · ')[0]}場景`));for(const s of c.scenes)details.append(sceneButton(s.id,s.title));body.append(details);
     }else{const details=el('details','scene-list');details.append(el('summary','',c.demo?'開發示範（非正式劇情）':'場景清單'));for(const s of c.scenes)details.append(sceneButton(s.id,s.title));body.append(details);}
   }
 }),button('閱讀紀錄',()=>{const body=panel('走過的字句');for(const h of engine.state.history){const s=story.scenes[h.sceneId],n=s.nodes.find(n=>n.id===h.nodeId);const item=el('article','history-entry');item.dataset.channel=n.channel || 'speech';item.append(el('small','',s.chapterId==='prologue'?`${s.title} · ${story.characters[s.perspective].shortName}視角`:s.title),el('strong','',n.speaker?`${story.characters[n.speaker].shortName}${n.channel==='message'?' · 訊息':''}`:'旁白'),el('p','',n.text),...attachmentButtons({...n,attachments:[...(n.attachments || []),...(n.stage?.media?[n.stage.media]:[])]}));body.append(item);}
   modal.scrollTop=modal.scrollHeight;
 }),button('存檔',()=>slots('save')),button('讀檔',()=>slots('load')),button('設定',()=>openAudioSettings({panel,audio,el,button,modal})));
 $('#system-menu').onclick=()=>{const body=panel('系統選單');body.append(el('p','muted',`山田 × 西 · ${story.chapters.find(c=>c.id===engine.scene.chapterId).title}`));for(const b of $('nav').querySelectorAll('button'))body.append(button(b.textContent,()=>{modal.close();b.click();},'menu-button'));body.append(button('返回開始畫面',()=>{modal.close();showHome();},'menu-button'));body.append(button('切換全螢幕',()=>{modal.close();$('#immersive').click();},'menu-button'));};
 $('#immersive').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else notify('此瀏覽器未提供全螢幕模式；已使用自適應舞台。');}catch{notify('目前無法啟用全螢幕模式。');}};
 const home=el('section','title-screen');home.setAttribute('aria-label','開始畫面');
 const titleArt=story.assets.titleBackground?.src;
 if(titleArt)home.style.setProperty('--title-art',`url("${new URL(titleArt,document.baseURI).href}")`);
 home.innerHTML=`<div class="title-content"><div class="title-actions"></div></div>`;
 const cover=story.assets.titleVideo;
 const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let coverVideo=null;
 if(cover?.src){
   home.classList.add('has-cover');
   coverVideo=el('video','title-video');coverVideo.muted=true;coverVideo.loop=true;coverVideo.playsInline=true;
   coverVideo.preload='metadata';coverVideo.setAttribute('aria-hidden','true');coverVideo.tabIndex=-1;
   coverVideo.src=new URL(cover.src,document.baseURI).href;
   if(cover.poster){coverVideo.poster=new URL(cover.poster,document.baseURI).href;home.style.setProperty('--title-art',`url("${coverVideo.poster}")`);}
   home.prepend(coverVideo);
   reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)coverVideo.pause();else if(atHome)void coverVideo.play().catch(()=>{});});
 }
 app.append(home);
 function showGame(){village?.hide();engine.state.mode='story';atHome=false;coverVideo?.pause();home.hidden=true;$('.shell').hidden=false;render();$('#advance').focus({preventScroll:true});}
 function showHome(){village?.hide();audio.stopSE();cgDirection.reset();setCgViewing(false);sceneDissolve.reset();portraitReaction.reset();fastForward.stop();sceneEffects.reset();if(rescue.dialog.open)rescue.close();typewriter.cancel();camera.reset();cgCamera.reset();cgVideo.pause();currentCgVideo=null;atHome=true;if(coverVideo && !reducedMotion.matches)void coverVideo.play().catch(()=>{});$('.shell').hidden=true;home.hidden=false;audio.sync(story.titleBgm ?? null);home.querySelector('.title-primary').focus({preventScroll:true});notify('');}
 function choosePerspective(){
   const body=panel('從誰的視角開始？');
   body.append(el('p','muted','同一段約會前夕，兩份不同的心情。選擇一個視角，開始閱讀序章。'));
   const cards=el('div','perspective-cards');
   for(const entry of story.chapters.find(c=>c.id==='prologue').entries){
     const c=story.characters[entry.perspective];
     const card=button('',()=>{
       const start=()=>{engine=new NovelEngine({...story,start:entry.scene});modal.close();showGame();autosave();};
       let hasAutosave=false;try{hasAutosave=!!store.storage.getItem(store.key('auto'));}catch{}
       if(hasAutosave){modal.close();confirmPanel('從這個視角重新開始？自動存檔會更新，手動存檔會保留。',start);}else safe(start);
     },'perspective-card');
     card.append(el('span','card-eyebrow',entry.perspective==='natsumi'?'NATSUMI NISHI':'KENTARO YAMADA'),el('strong','',c.shortName+'視角'),el('span','',entry.title),el('span','card-arrow','開始閱讀 ↗'));
     cards.append(card);
   }
   body.append(cards);
 }
 const actions=home.querySelector('.title-actions');
 const start=button('',()=>{let data=null;try{data=store.load('auto');}catch{}if(data?.state.world){engine=new NovelEngine(story,data.state);if(data.state.mode==='world')enterVillage(data.state.world);else showGame();}else choosePerspective();},'title-action title-primary');start.append(el('span','','開始故事'),el('small','','↗'));
 const load=button('',()=>slots('load'),'title-action');load.append(el('span','','讀取存檔'),el('small','','↗'));
 const log=button('',()=>{const body=panel('更新日誌');for(const update of updates){const item=el('article','update-entry');item.append(el('time','',update.date),el('h3','',update.title));const list=el('ul','');for(const line of update.items)list.append(el('li','',line));item.append(list);body.append(item);}},'title-action');log.append(el('span','','更新日誌'),el('small','','↗'));
 const preview=button('踩地圖 · 玩法試玩',()=>{let state=null;try{state=JSON.parse(localStorage.getItem('yamada-nishi:world-preview'));}catch{}try{enterVillage(state || village.create({preview:true}));}catch{enterVillage(village.create({preview:true}));}},'title-action');
 const innPreview=button('旅舍 · 獨立試玩',()=>{const body=panel('旅舍小遊戲 · 選擇試玩版本');body.append(el('p','','獨立試玩不影響故事或踩地圖進度。'));try{const saved=JSON.parse(localStorage.getItem('yamada-nishi:inn-preview'));if(saved?.pending&&saved.previewKind==='inn')body.append(button('繼續上次旅舍試玩',()=>{modal.close();enterVillage(saved);village.resume();}));}catch{}for(const [label,actor,together]of [['山田單獨','kentaro',false],['西單獨','natsumi',false],['兩人同行 · 控制山田','kentaro',true],['兩人同行 · 控制西','natsumi',true]])body.append(button(label,()=>{modal.close();enterVillage(village.createInnPreview(actor,together));village.resume();}));},'title-action');
 actions.append(start,load,log,preview,innPreview);
 village=mountVillage({app,config:story.world,characters:story.characters,onSave:state=>{if(state.preview){try{localStorage.setItem(state.previewKind==='inn'?'yamada-nishi:inn-preview':'yamada-nishi:world-preview',JSON.stringify(state));}catch{notify('試玩進度未能保存。');}}else{engine.state.world=state;engine.state.mode='world';autosave();}},onTitle:showHome,onSettings:()=>openAudioSettings({panel,audio,el,button,modal}),onSaves:()=>{const body=panel('生活存讀檔');body.append(button('存檔',()=>{modal.close();slots('save');}),button('讀檔',()=>{modal.close();slots('load');}));},onStory:showGame,onCue:id=>void audio.playSE(id)});
 function enterVillage(state=engine.state.world){fastForward.stop();typewriter.cancel();setCgViewing(false);cgDirection.reset();sceneEffects.reset();cgVideo.pause();coverVideo?.pause();audio.stopSE();atHome=true;home.hidden=true;$('.shell').hidden=true;const next=state || village.create();village.show(next);audio.sync('warm-daily-life');if(!next.preview){engine.state.world=next;engine.state.mode='world';autosave();}}
 $('nav').append(button('踩地圖',()=>{if(engine.state.world)enterVillage();else notify('完成第二章後開放；開始畫面有獨立玩法試玩。');}));
 $('.brand').onclick=e=>{e.preventDefault();showHome();};
 showHome();
 // Do not overwrite an earlier autosave before the player has chosen to continue or load it.
} catch(e){app.replaceChildren(el('main','fatal',`無法啟動：${e.message}`));}
