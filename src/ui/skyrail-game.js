import {InstructionPreferences,SKYRAIL_GUIDE} from '../minigames/instructions.js';
import {mountRescueInstructions} from './rescue-instructions.js';
import {RescueCompanion,successExchange} from '../minigames/rescue-companion.js';
import {SkyrailRescue,RUNES} from '../minigames/skyrail.js';
export function mountSkyrailGame({app,assets,characters,onComplete,onSkip}){
 const dialog=document.createElement('dialog');dialog.id='skyrail-game';dialog.tabIndex=-1;dialog.setAttribute('aria-labelledby','skyrail-title');
 dialog.innerHTML=`<header class="rescue-header"><div><span class="rescue-eyebrow">星軌列車 · 協力救援</span><h2 id="skyrail-title">這次，換你來操作。</h2></div><button class="rescue-close" aria-label="關閉列車小遊戲">✕</button></header><div class="rescue-content"></div>`;
 dialog.addEventListener('selectstart',event=>event.preventDefault());
 dialog.addEventListener('dragstart',event=>event.preventDefault());
 app.append(dialog);const content=dialog.querySelector('.rescue-content');let game=null,frame=null,last=0,input={},lastMessage='',successShown=false,tracePoint=null,companion=null,lastReaction=0,stageOptions={},guideFlashTimer=null;
 let localStorage=null;try{localStorage=window.localStorage;}catch{}
 const instructionPreferences=new InstructionPreferences(localStorage);
 const guideInfo=()=>stageOptions.guide || SKYRAIL_GUIDE;
 const instructions=mountRescueInstructions({app,
  onChoice:()=>instructionPreferences.acknowledge(guideInfo()),
  onResume:()=>{if(dialog.open && game?.phase==='playing'){last=0;if(frame===null)frame=requestAnimationFrame(loop);dialog.focus();}}});
 function showInstructions(){stop();instructionPreferences.acknowledge(guideInfo());clearTimeout(guideFlashTimer);const b=content.querySelector('.rescue-guide-button');b?.classList.remove('has-update');b?.removeAttribute('data-update');instructions.guide(game.role);}
 function enter(role){start(role);const status=instructionPreferences.state(guideInfo());if(status.ask){stop();instructions.offer(role);}else if(status.updated){const b=content.querySelector('.rescue-guide-button');b.classList.add('has-update');b.dataset.update='玩法已更新';guideFlashTimer=setTimeout(()=>{b.classList.remove('has-update');b.removeAttribute('data-update');},6000);}}
 const image=id=>new URL(characters[id].variants[id==='kentaro'?'hero-back':'witch-back'].neutral,document.baseURI).href;
 const bg=new URL(assets.backgrounds['skyrail-train-derailment-day'].src,document.baseURI).href;
 function stop(){if(frame!==null)cancelAnimationFrame(frame);frame=null;input={};game?.endTrace();}
 function close(){stop();clearTimeout(guideFlashTimer);dialog.close();instructions.close();}
 dialog.querySelector('.rescue-close').onclick=close;
 dialog.addEventListener('close',()=>{stop();instructions.close();});
 const release=()=>{input={};game?.endTrace();};window.addEventListener('blur',release);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 function select(){
  clearTimeout(guideFlashTimer);delete dialog.dataset.role;stop();game=null;content.innerHTML=`<p class="rescue-intro">接手最後一次救援。選擇你想操作的一方，另一位會配合你；不用限時，也不影響故事結局。</p><div class="rescue-role-grid"><button data-role="kentaro" class="rescue-role"><img src="${image('kentaro')}" alt="勇者背影"><div><small>勇者</small><strong>健太郎</strong><p>拉住制動桿，抵住不同方向的陣風。持續對準車廂，等奈津美接好軌道再放手。</p><span>操作機關 ↗</span></div></button><button data-role="natsumi" class="rescue-role"><img src="${image('natsumi')}" alt="魔女背影"><div><small>魔女</small><strong>奈津美</strong><p>觀察三組不同的符文次序，抓住亮起的時機連接。健太郎會替你拉住車廂。</p><span>連接魔法 ↗</span></div></button></div><div class="rescue-entry-footer"><span>鍵盤、滑鼠及觸控均可操作</span><button class="rescue-read">只閱讀這段劇情</button></div>`;
  for(const b of content.querySelectorAll('[data-role]'))b.onclick=()=>enter(b.dataset.role);
  content.querySelector('.rescue-read').onclick=()=>{close();onSkip();};
 }
 function announce(message){if(message===lastMessage)return;lastMessage=message;const status=content.querySelector('.rescue-status');if(status)status.textContent=message;}
 function start(role){
  clearTimeout(guideFlashTimer);stop();tracePoint=null;game=new SkyrailRescue(role,{rules:stageOptions.rules || {}});companion=new RescueCompanion(role);lastReaction=0;last=0;lastMessage='';successShown=false;
  dialog.dataset.role=role;
  content.innerHTML=`<div class="rescue-flight" style="--rescue-bg:url('${bg}')">
   <div class="rescue-landscape" aria-hidden="true"></div><div class="rescue-speedlines" aria-hidden="true"></div>
   <div class="rescue-play-top"><div><small>星軌列車／最後的連接</small><strong>${role==='kentaro'?'穩住車廂':'編織魔力軌道'}</strong></div><div class="rescue-play-tools"><button class="rescue-guide-button" aria-label="玩法說明">ⓘ 玩法說明</button><button class="rescue-switch">換角色</button></div></div>
   <div class="rescue-mission"><span class="rescue-step">${role==='kentaro'?'01 · 拉住　02 · 對準　03 · 放開':'01 · 連接　02 · 蓄能　03 · 施法'}</span><p>${role==='kentaro'?'讓車廂保持在中央，替奈津美爭取時間。':'沿著符文引導魔力，健太郎會替你穩住車廂。'}</p></div>
   <div class="rescue-live-cue" aria-live="polite"></div><div class="rescue-beat" role="status" hidden></div><div class="rescue-action-area">
    <div class="rescue-mechanism" ${role==='kentaro'?'':'hidden'}><div class="rescue-gauge-heading"><span>連接裝置</span><strong class="rescue-stability">尚未制動</strong></div><div class="rescue-dial"><div class="rescue-dial-ticks"></div><div class="rescue-safe-zone"></div><div class="rescue-cursor"><i></i><span>▼</span></div><div class="rescue-dial-center"></div></div><div class="rescue-dial-labels"><span>← 向左修正</span><span>對準中心</span><span>向右修正 →</span></div><div class="rescue-brake-light"><i></i><span>制動桿待命</span></div></div>
    <svg viewBox="0 0 480 260" class="rescue-board" aria-label="魔法符文連線操作區" ${role==='kentaro'?'hidden':''}><defs><filter id="magic-bloom"><feGaussianBlur stdDeviation="3"/></filter></defs><path class="rescue-spell-guide" d="${RUNES.map((r,i)=>`${i?'L':'M'} ${r.x*4.8} ${r.y*2.6}`).join(' ')}"/><polyline class="rescue-spell-path" points=""/>${RUNES.map((r,i)=>`<g data-rune="${i}" class="rescue-rune" role="button" tabindex="${role==='natsumi'?0:-1}" aria-label="符文 ${i+1}"><circle class="rescue-rune-hit" cx="${r.x*4.8}" cy="${r.y*2.6}" r="46"/><circle class="rescue-rune-halo" cx="${r.x*4.8}" cy="${r.y*2.6}" r="35"/><circle class="rescue-rune-ring" cx="${r.x*4.8}" cy="${r.y*2.6}" r="27"/><path class="rescue-rune-glyph" d="M ${r.x*4.8} ${r.y*2.6-17} l 12 17 -12 17 -12 -17 Z"/><text x="${r.x*4.8}" y="${r.y*2.6+5}">${i+1}</text></g>`).join('')}</svg>
   </div>
   <div class="rescue-partner"><img src="${image(role==='kentaro'?'natsumi':'kentaro')}" alt=""><div><small>${role==='kentaro'?'奈津美 · 魔女':'健太郎 · 勇者'}／協力中</small><span class="rescue-scene-label" aria-live="polite">${role==='kentaro'?'等你把車廂對準':'正替你拉住制動桿'}</span></div><span class="rescue-link-mark" aria-hidden="true">◇</span></div>
   <div class="rescue-energy"><div class="rescue-segments" aria-label="三段軌道修復進度">${[1,2,3].map(i=>`<div data-segment="${i}"><i>0${i}</i><span>第${['一','二','三'][i-1]}段</span><b>待修復</b></div>`).join('')}</div><div class="rescue-progress-label"><span>魔力軌道</span><strong class="rescue-percent">0%</strong></div><div class="rescue-progress" role="progressbar" aria-label="軌道修復進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div>
   <div class="rescue-sparks" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i style="--spark:${i}"></i>`).join('')}</div><div class="rescue-finish-flash" aria-hidden="true"></div>
  </div>
  <div class="rescue-command"><p class="rescue-status" role="status" aria-live="polite"></p><div class="rescue-controls">${role==='kentaro'?'<button data-hold="left" aria-label="車廂向左調整"><small>← / A</small>向左</button><button data-hold="brake" class="rescue-brake" aria-pressed="false"><small>SPACE</small>按住制動桿</button><button data-hold="right" aria-label="車廂向右調整"><small>→ / D</small>向右</button>':'<button class="rescue-cast" disabled><span>✧</span> 連接符文後施法</button>'}</div><button class="rescue-latch" hidden>鎖定制動桿（點按模式）</button><p class="rescue-help">${role==='kentaro'?'按住空白鍵制動，方向鍵或 A／D 調整。亦可用下方按鈕點按操作。':'看清下一枚符文，等亮起時拖曳或點選。鍵盤按 1–4 選符文；接好三段軌道後施法。'}</p></div>
  <div class="rescue-success" hidden><small>星軌重新連接</small><strong>協力成功</strong><p>車廂已回到軌道上。</p><section class="rescue-result-dialogue" aria-label="救援後的對話"></section><div><button class="rescue-return">繼續故事 ↗</button><button class="rescue-retry">再玩一次</button></div></div>`;
  content.querySelector('.rescue-switch').onclick=select;content.querySelector('.rescue-guide-button').onclick=showInstructions;
  content.querySelector('.rescue-return').onclick=()=>{const selected=game.role;close();onComplete(selected);};
  content.querySelector('.rescue-retry').onclick=()=>start(role);
  for(const b of content.querySelectorAll('[data-hold]')){
   const name=b.dataset.hold;
   let pressedAt=0;
   b.onpointerdown=e=>{pressedAt=performance.now();e.preventDefault();b.setPointerCapture(e.pointerId);input[name]=true;};
   b.onpointerup=()=>{input[name]=false;if(name!=='brake' && performance.now()-pressedAt<250)game.alignment=Math.max(-85,Math.min(85,game.alignment+(name==='right'?8:-8)));};b.onpointercancel=()=>{input[name]=false;};
   b.onlostpointercapture=()=>{input[name]=false;};
  }
  const latch=content.querySelector('.rescue-latch');
  if(role==='kentaro'){latch.hidden=false;latch.onclick=()=>{input.brake=!input.brake;latch.textContent=input.brake?'鬆開制動桿':'鎖定制動桿（點按模式）';};}
  const board=content.querySelector('.rescue-board');
  const point=e=>{const r=board.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100};};
  board.onpointerdown=e=>{if(role!=='natsumi')return;e.preventDefault();const p=point(e);const rune=e.target.closest('[data-rune]');if(rune && Number(rune.dataset.rune)!==game.route[game.connected-1])game.connect(Number(rune.dataset.rune));else if(game.beginTrace(p.x,p.y))board.setPointerCapture(e.pointerId);};
  board.onpointermove=e=>{if(role==='natsumi'){const p=point(e);tracePoint=p;game.trace(p.x,p.y);}};
  board.onpointerup=board.onpointercancel=()=>game.endTrace();
  for(const r of content.querySelectorAll('[data-rune]'))r.onkeydown=e=>{if(role==='natsumi' && ['Enter',' '].includes(e.key)){e.preventDefault();game.connect(Number(r.dataset.rune));}};
  const cast=content.querySelector('.rescue-cast');if(cast)cast.onclick=()=>game.cast();
  announce(role==='kentaro'?'按住制動桿，再將車廂調到綠色區域。':'從第一枚符文開始，把魔力連向下一枚。');
  dialog.focus();frame=requestAnimationFrame(loop);
 }
 function loop(time){
  if(!dialog.open || !game)return;
  const dt=last?(time-last)/1000:0;last=time;game.update(dt,input);
  const percent=Math.round(game.progress*100);
  content.querySelector('.rescue-percent').textContent=percent+'%';content.querySelector('.rescue-progress').setAttribute('aria-valuenow',percent);content.querySelector('.rescue-progress i').style.width=percent+'%';
  const flight=content.querySelector('.rescue-flight');
  flight.style.setProperty('--tilt',`${game.alignment*.025}deg`);
  flight.classList.toggle('is-braking',game.brake);flight.classList.toggle('is-aligned',Math.abs(game.alignment)<game.rules.alignmentTolerance);flight.classList.toggle('is-ready',game.ready);flight.classList.toggle('is-success',game.phase==='success');
  const safeZone=content.querySelector('.rescue-safe-zone');safeZone.style.left=`${50-game.rules.alignmentTolerance*.48}%`;safeZone.style.width=`${game.rules.alignmentTolerance*.96}%`;
  const cursor=content.querySelector('.rescue-cursor');cursor.style.left=`${50+game.alignment*.48}%`;
  const lit=game.role==='kentaro'?[0,1,2,3].slice(0,1+Math.floor(game.progress*3)):game.litRunes;
  for(const r of content.querySelectorAll('[data-rune]')){const index=Number(r.dataset.rune);r.classList.toggle('lit',lit.includes(index));r.classList.toggle('next',!game.ready&&index===game.nextRune);r.classList.toggle('resonating',game.pulseOpen);}
  const spellPoints=lit.map(i=>`${RUNES[i].x*4.8},${RUNES[i].y*2.6}`);
  if(game.tracing && tracePoint)spellPoints.push(`${tracePoint.x*4.8},${tracePoint.y*2.6}`);
  content.querySelector('.rescue-spell-path').setAttribute('points',spellPoints.join(' '));
  content.querySelector('.rescue-spell-guide').setAttribute('d',game.route.map((i,index)=>`${index?'L':'M'} ${RUNES[i].x*4.8} ${RUNES[i].y*2.6}`).join(' '));
  const cue=content.querySelector('.rescue-live-cue');
  if(game.role==='kentaro'){
   flight.classList.toggle('has-gust',game.windActive);flight.classList.toggle('gust-warning',game.windWarning);
   cue.textContent=game.ready?'軌道完成 · 鬆開制動桿':game.windWarning?`${game.windDirection>0?'右':'左'}向陣風將至 · 準備反向修正`:game.windActive?`${game.windDirection>0?'→':'←'} 陣風推動中`:'保持在中央 · 留意風向';
   content.querySelector('.rescue-stability').textContent=game.ready?'可以放開':!game.brake?'尚未制動':Math.abs(game.alignment)<game.rules.alignmentTolerance?'已對準':'調整方向';
   content.querySelector('.rescue-brake-light span').textContent=game.brake?'制動桿已拉住':'制動桿待命';
   content.querySelector('.rescue-brake').setAttribute('aria-pressed',String(game.brake));

   if(game.ready)announce('軌道接好了 · 鬆開制動桿，讓車廂回到軌道。');
   else if(!game.brake)announce('先按住制動桿，避免車廂下墜。');
   else if(Math.abs(game.alignment)>=game.rules.alignmentTolerance)announce('左右調整車廂，讓金色指針落入綠色區域。');
   else announce('保持制動桿按住，奈津美正在接軌道。');
  }else{
   const cast=content.querySelector('.rescue-cast');cast.disabled=!game.ready;cast.textContent=game.ready?'施放魔法 · 完成軌道':'連接符文後施法';

   cue.textContent=game.ready?'三段軌道已修復':`軌道 ${game.round} / ${game.rounds} · ${game.roundPause>0?'符文正在顯現':`下一枚 ${game.nextRune+1} · ${game.pulseOpen?'現在連接':'等待共鳴'}`}`;
   announce(game.feedback || (game.ready?'符文已接好，施放魔法讓軌道成形。':game.pulseOpen?`符文 ${game.nextRune+1} 正在呼應，現在連接。`:'暫時穩住，等下一枚符文亮起。'));
  }
  const reaction=companion.update(game);
  const partnerLine=content.querySelector('.rescue-scene-label');if(partnerLine.textContent!==reaction.text)partnerLine.textContent=reaction.text;
  const beat=content.querySelector('.rescue-beat');beat.hidden=!reaction.beat;beat.textContent=reaction.beat;beat.dataset.kind=reaction.kind;
  if(lastReaction!==reaction.serial){lastReaction=reaction.serial;const partner=content.querySelector('.rescue-partner');partner.classList.remove('is-speaking');void partner.offsetWidth;partner.classList.add('is-speaking');}
  cue.dataset.state=game.ready?'ready':game.role==='natsumi'?(game.pulseOpen?'active':'wait'):(game.windWarning||game.windActive?'warning':Math.abs(game.alignment)<game.rules.alignmentTolerance&&game.brake?'active':'wait');
  for(const segment of content.querySelectorAll('[data-segment]')){const i=Number(segment.dataset.segment),done=game.progress>=i/3,active=!done&&game.progress>=(i-1)/3;segment.dataset.state=done?'done':active?'active':'pending';segment.querySelector('b').textContent=done?'已接通':active?'修復中':'待修復';}
  if(game.phase==='success' && !successShown){successShown=true;const exchange=content.querySelector('.rescue-result-dialogue');exchange.replaceChildren(...successExchange(game.role).map(line=>{const p=document.createElement('p'),name=document.createElement('b'),text=document.createElement('span');name.textContent=characters[line.speaker].shortName;text.textContent=line.text;p.append(name,text);return p;}));content.querySelector('.rescue-success>p').textContent=`車廂已回到軌道上。用時 ${Math.round(game.elapsed)} 秒${game.role==='natsumi'?` · 魔力失誤 ${game.mistakes} 次`:''}`;release();content.querySelector('.rescue-success').hidden=false;content.querySelector('.rescue-controls').hidden=true;content.querySelector('.rescue-latch').hidden=true;content.querySelector('.rescue-return').focus();announce('協力成功，車廂已回到軌道。');}
  if(game.phase==='playing')frame=requestAnimationFrame(loop);else frame=null;
 }
 dialog.addEventListener('keydown',e=>{
  if(!game || game.phase!=='playing')return;
  const key=e.key.toLowerCase();const map={' ':'brake',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
  if(game.role==='kentaro' && map[key]){e.preventDefault();input[map[key]]=true;if(!e.repeat && map[key]!=='brake')game.alignment=Math.max(-85,Math.min(85,game.alignment+(map[key]==='right'?4:-4)));}
  if(game.role==='natsumi' && /^[1234]$/.test(key)){e.preventDefault();game.connect(Number(key)-1);}
  if(game.role==='natsumi' && key===' '){e.preventDefault();game.cast();}
 });
 dialog.addEventListener('keyup',e=>{const name={' ':'brake',arrowleft:'left',a:'left',arrowright:'right',d:'right'}[e.key.toLowerCase()];if(name){e.preventDefault();input[name]=false;}});
 return {dialog,open(options={}){stageOptions=options;select();dialog.showModal();content.querySelector('[data-role]').focus();},close};
}
