const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const b=(label,fn,cls='')=>{const n=e('button',cls,label);n.type='button';n.onclick=fn;return n;};
export function mountWoodworkGame({box,game,onChange=()=>{},onDone=()=>{},onCue=()=>{},isActive=()=>true,practice=false}){
 let frame,last=performance.now(),saveElapsed=0,disposed=false,finished=false,lastMode=game.s.reversal.phase;
 const input={left:false,right:false,brake:false};box.classList.add('woodwork-game');
 const title=e('strong','woodwork-status',game.level.label+' · 機關維修'),hint=e('p','woodwork-hint');hint.setAttribute('role','status');
 const scene=e('div','rescue-mechanism');scene.innerHTML='<div class="rescue-gauge-heading"><span>方向</span><strong class="rescue-stability">待固定</strong></div><div class="rescue-dial"><div class="rescue-dial-ticks"></div><div class="rescue-safe-zone"></div><div class="rescue-cursor"><i></i><span>▼</span></div><div class="rescue-dial-center"></div></div><div class="rescue-dial-labels"><span>←</span><span>保持綠區</span><span>→</span></div><div class="rescue-brake-light"><i></i><span>固定桿待命</span></div>';
 const mapping=e('section','woodwork-direction-map');mapping.setAttribute('aria-label','目前操作方向');mapping.innerHTML='<div class="woodwork-map-title"><b class="woodwork-map-symbol">⇉</b><strong>正常方向</strong></div><div class="woodwork-mapping"><span class="woodwork-keycap woodwork-key-left">A / ←</span><span class="woodwork-keycap woodwork-key-right">D / →</span><svg viewBox="0 0 600 88" preserveAspectRatio="none" aria-hidden="true"><path class="woodwork-map-left"/><path class="woodwork-map-right"/></svg><b class="woodwork-output woodwork-output-left">←</b><b class="woodwork-output woodwork-output-right">→</b></div>';
 const forecast=e('small','woodwork-forecast','✦ 即將反轉');forecast.hidden=true;mapping.append(forecast);
 const toolbar=e('div','woodwork-toolbar'),controls=e('div','rescue-controls'),progress=e('progress');progress.max=1;progress.setAttribute('aria-label','維修進度');box.append(title,hint,scene,mapping,toolbar,progress,controls);
 const clear=()=>{input.left=input.right=input.brake=false;};
 const latch=b('▣ 點按固定',()=>{input.brake=!input.brake;latch.textContent=input.brake?'▣ 鬆開固定':'▣ 點按固定';});latch.title='點按模式；不用持續按住 Space';
 function skills(){toolbar.replaceChildren();if(game.s.skill){const analyze=b(game.s.analyzing?'✦ 判讀中':'✦ 結構判讀',()=>{game.analyze();skills();onChange();});analyze.setAttribute('aria-pressed',String(game.s.analyzing));analyze.title='提早察覺下一次方向反轉';toolbar.append(analyze);}toolbar.append(latch);}
 const keys={};
 for(const [name,label] of [['left','A / ←'],['brake','按住固定 · SPACE'],['right','D / →']]){const btn=b('',()=>{},name==='brake'?'rescue-brake':'');btn.dataset.hold=name;
  if(name==='brake')btn.textContent=label;else btn.innerHTML=`<small>${label}</small><strong>${name==='left'?'←':'→'}</strong>`;
  keys[name]=btn;btn.onpointerdown=event=>{event.preventDefault();btn.setPointerCapture(event.pointerId);input[name]=true;};btn.onpointerup=btn.onpointercancel=btn.onlostpointercapture=()=>input[name]=false;controls.append(btn);}
 function key(event,down){if(!isActive()||finished||event.target.closest('input,textarea,select'))return;const name={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'brake'}[event.code];if(name){event.preventDefault();input[name]=down;}}
 const down=event=>key(event,true),up=event=>key(event,false);window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
 function paint(){
  const c=game.core,r=game.s.reversal,reverse=game.reversed;
  box.dataset.woodReady=String(c.ready);box.dataset.woodPhase=game.s.phase;box.dataset.direction=r.phase;progress.value=c.progress;
  scene.querySelector('.rescue-cursor').style.left=`${50+c.alignment*.48}%`;const safe=scene.querySelector('.rescue-safe-zone');safe.style.left=`${50-game.tolerance*.48}%`;safe.style.width=`${game.tolerance*.96}%`;
  scene.querySelector('.rescue-stability').textContent=c.ready?'放手 ✓':!c.brake?'待固定':Math.abs(c.alignment)<game.tolerance?'✓ 對準':'← →';scene.querySelector('.rescue-brake-light span').textContent=c.brake?'固定中':'固定桿待命';scene.classList.toggle('is-aligned',Math.abs(c.alignment)<game.tolerance);scene.classList.toggle('is-braking',c.brake);
  hint.textContent=c.ready?'✓ 放開固定桿':r.phase==='warning'?'⇄ 即將反轉':reverse?'⇄ 左右反轉':r.phase==='restore'?'✓ 恢復正常':'按住固定　← → 調整';
  mapping.querySelector('.woodwork-map-symbol').textContent=reverse||r.phase==='warning'?'⇄':'⇉';mapping.querySelector('.woodwork-map-title strong').textContent=reverse?'左右反轉':r.phase==='warning'?'即將反轉':r.phase==='restore'?'恢復正常':'正常方向';
  mapping.querySelector('.woodwork-map-left').setAttribute('d',reverse?'M110 8C110 39 490 39 490 78M480 65L490 78L500 65':'M110 8V78M100 65L110 78L120 65');
  mapping.querySelector('.woodwork-map-right').setAttribute('d',reverse?'M490 8C490 48 110 48 110 78M100 65L110 78L120 65':'M490 8V78M480 65L490 78L500 65');
  for(const side of ['left','right']){const actual=reverse?(side==='left'?'right':'left'):side,arrow=actual==='left'?'←':'→';keys[side].querySelector('strong').textContent=arrow;keys[side].dataset.output=actual;keys[side].setAttribute('aria-label',`按${side==='left'?'左':'右'}鍵，向${actual==='left'?'左':'右'}移動${reverse?'，方向反轉中':''}`);keys[side].dataset.pressed=String(input[side]);}
  keys.brake.setAttribute('aria-label','按住固定桿');forecast.hidden=!game.forecast;mapping.setAttribute('aria-label',reverse?'方向反轉：左鍵向右，右鍵向左':r.phase==='warning'?'即將反轉，目前仍是正常方向':'正常方向：左鍵向左，右鍵向右');
  if(lastMode!==r.phase){lastMode=r.phase;if(['warning','reversed','restore'].includes(r.phase))onCue('repair-aligned');mapping.classList.remove('woodwork-mode-change');void mapping.offsetWidth;mapping.classList.add('woodwork-mode-change');onChange();}
 }
 function done(){finished=true;clear();hint.textContent='✓ 維修完成';controls.replaceChildren(b(practice?'完成練習 · 返回遊戲':'維修完成 · 繼續',onDone,'woodwork-finish'));onCue('repair-aligned');onChange();}
 const tick=now=>{if(disposed)return;const dt=Math.min(.05,(now-last)/1000);last=now;if(isActive()&&!finished){game.update(dt,input);paint();saveElapsed+=dt;if(saveElapsed>1){saveElapsed=0;onChange();}if(game.s.phase==='success')done();}else if(!isActive())clear();frame=requestAnimationFrame(tick);};skills();paint();if(game.s.phase==='success')done();frame=requestAnimationFrame(tick);
 return ()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);clear();};
}
