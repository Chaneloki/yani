import {innGuide} from './inn-guide.js';
import {mountMiniTutorial} from '../ui/minigame-tutorial.js';
import {roomInteraction,lockInteraction,lampInteraction} from './inn-interactions.js';
import {renderQuestReader} from './quest-reader.js';
import {InnShift,INN_DIFFICULTIES,INN_SPOTS,INN_ITEMS,innPath,createInn} from './inn-game.js';
import {paginateText} from '../content/paginate-text.js';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(label,fn,cls='')=>{const n=el('button',cls,label);n.type='button';n.onclick=fn;return n;};
const names={kentaro:'健太郎',natsumi:'奈津美'};
export function mountInn({app,config,characters,getLife,onSave,onChange,onCue=()=>{}}){
 const dialog=el('dialog','inn-shift-dialog');dialog.setAttribute('aria-label','旅舍忙碌的一晚');dialog.tabIndex=-1;app.append(dialog);
 let miniTeaching=false;const miniGuide=mountMiniTutorial({app,onToggle:value=>miniTeaching=value});
 let reader=null,model,raf=null,path=[],last=0,step=0,saveClock=0,uiClock=0,context='',seenCalls=new Set(),callId=null,callUntil=0,work=null,speechOpen=false,workCleanup=()=>{},paused=false,removeKeys=()=>{};
 const life=()=>getLife(),save=()=>{life().innCheckpoint(model.snapshot());onSave();};
 function halt(){workCleanup();workCleanup=()=>{};work?.remove();work=null;reader?.close();reader=null;if(raf)cancelAnimationFrame(raf);raf=null;removeKeys();if(model&&life().state.pending)save();}
 function close(){miniGuide.close();if(work?.dataset.complete==='true')work.querySelector('.inn-finish-work')?.click();halt();speech.close();speechOpen=false;dialog.close();onChange();}
 const speech=el('dialog','inn-speech-dialog');speech.setAttribute('aria-label','旅客對話');app.append(speech);speech.addEventListener('close',()=>{speechOpen=false;last=performance.now();});
 function speak(name,text){speechOpen=true;path=[];speech.replaceChildren(el('small','','正在交談'),el('h2','',name),el('p','',text.replace(/^[^：]+：/,'')),button('知道了 · 繼續工作',()=>speech.close(),'inn-primary'));onCue('book-page');speech.showModal();}
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 function run(fn){try{fn();save();context='';refresh();}catch(error){model.s.feedback=error.message;refreshStatus();}}
 function top(){const h=el('header','inn-title');h.append(el('div','',model.s.repeat?'旅舍值班':'支線 02｜旅舍忙碌的一晚'),button('稍後繼續',close));dialog.append(h);}
 function story(){
  reader?.close();const s=model.s,segment=s.phase==='intro'?'intro':'ending',content=config.questStories['busy-inn-night'];const lines=content.variants[s.variant][segment];
  const pages=lines.flatMap((text,index)=>paginateText(text).map((text,part)=>({text,id:`${s.variant}-${segment}-${index}-${part}`,speaker:content.speakers[s.variant][segment][index]})));
  const roomAt=lines.findIndex(text=>text.startsWith('當晚，山田回到房間')||text.startsWith('西回到房間'));const pageLine=pages[Math.min(s.page,pages.length-1)];const lineIndex=+pageLine.id.split('-').at(-2);
  dialog.replaceChildren();dialog.classList.add('quest-story');
  reader=renderQuestReader({dialog,title:'支線 02｜旅舍忙碌的一晚',pages,page:s.page,characters:{...characters,mother:{name:'女旅人',shortName:'女旅人'}},background:segment==='ending'&&roomAt>=0&&lineIndex>=roomAt?'./assets/backgrounds/bg-estrala-inn-room-night.webp':config.questAssets.inn,onPage:page=>{s.page=page;save();story();},onEnd:()=>{s.page=0;s.phase=segment==='intro'?'playing':'settle';save();render();},onPause:close,redraw:story});
 }
 function render(){halt();dialog.replaceChildren();dialog.classList.remove('inn-reading','quest-story');top();const s=model.s;
  if(['intro','ending'].includes(s.phase)){story();return;}
  if(s.phase==='settle'){dialog.append(el('h2','','今晚安頓好了'),el('p','',`四間客房完成安排，預約房間如約保留。服務完成度 100% · ${INN_DIFFICULTIES[s.difficulty]?.label||'輕鬆'}${s.partner?' · 雙人':''} · 服務評價 ${Math.round(s.quality)}`),el('p','',`基本工錢 ${config.tasks.find(t=>t.id===life().state.pending.task).coins} + 效率加給 ${model.bonus} 金幣`),button('領取工錢 · 結束值班',()=>{save();life().complete();onSave();model=null;dialog.close();onChange();},'inn-primary'));return;}
  if(!s.difficultyChosen){dialog.append(el('h2','','今次想怎樣值班？'),el('p','',s.partner?'雙人值班：需求較密集，額外燈具工作要親自處理。同級工作量高於單人。':'單人值班：兩位角色都能完成全部工作，可按喜好選擇節奏。'));const choices=el('div','inn-difficulties');for(const [id,c]of Object.entries(INN_DIFFICULTIES)){const total=(s.partner?c.duo:c.solo).reduce((n,items)=>n+items.length,0),repairs=s.partner?c.duoJobs:c.soloJobs;const btn=button('',()=>{model.chooseDifficulty(id);save();render();},'inn-difficulty');btn.append(el('strong','',c.label),el('span','',`${total} 項旅客服務 · 1 處門鎖${repairs?` + ${repairs} 處燈具`:''}`),el('small','',id==='easy'?'慢慢熟習，等候較寬裕':id==='standard'?'工作交錯，需要安排先後':'客人較快到達，需求更密集'));choices.append(btn);}dialog.append(choices);return;}
  s.tutorial??={status:'skipped',step:0};if(s.tutorial.status==='offer'){dialog.append(el('h2','','先一起做一遍？'),el('p','','第一次值班，可以先接待一位客人並照顧他的需要，也可以先接待所有人。教學會跟隨你的進度提供建議，不限制工作次序；期間暫停等候與新客人抵達。'),button('帶我做一次',()=>{s.tutorial.status='active';s.tutorial.step=0;save();render();},'inn-primary'),button('跳過，直接開始值班',()=>{s.tutorial.status='skipped';save();render();}));return;}
  const guide=el('section','inn-guide');guide.setAttribute('aria-live','polite');dialog.append(guide);
  const hud=el('div','inn-hud');hud.innerHTML='<span class="inn-shift-time"></span><span class="inn-carry"></span><span class="inn-score"></span>';dialog.append(hud);
  const help=el('details','inn-help');help.append(el('summary','','怎樣操作？'),el('p','','點房門、工作站或需求氣泡，角色便會沿通道自動走過去。到達後使用旁邊的操作按鈕。旅客會逐步提出需求，房間上的氣泡會保留未處理要求。每次拿兩件物品；按客房的「整理」親手歸位。等候只影響加給，沒有倒數失敗。'));dialog.append(help);
  const layout=el('div','inn-layout'),stage=el('div','inn-stage');stage.setAttribute('aria-label','可走動的旅舍平面場景');
  for(let n=1;n<=4;n++){const room=button('',()=>go(`room${n}`),'inn-room');room.style.left=`${(n-1)*4/18*100}%`;room.style.width=`${4/18*100}%`;room.dataset.spot=`room${n}`;room.setAttribute('aria-label',`0${n} 號房`);room.append(el('span','inn-room-name',`ROOM 0${n}`),el('span','inn-bed',''),...(n===1?[el('span','inn-bed inn-bed-second','')]:[]),el('span','inn-room-state'),el('span','inn-door-art','進入'));stage.append(room);}
  stage.append(el('div','inn-corridor','客房走廊'),el('div','inn-lobby-floor'));
  const route=document.createElementNS('http://www.w3.org/2000/svg','svg');route.classList.add('inn-route-path');route.setAttribute('viewBox','0 0 180 120');route.setAttribute('preserveAspectRatio','none');const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');route.append(line);stage.append(route);
  for(const [id,spot]of Object.entries(INN_SPOTS)){if(id.startsWith('room'))continue;const station=el('div',`inn-station inn-station-${id}`);const target=button(spot.label,()=>go(id),'inn-spot');target.dataset.spot=id;target.setAttribute('aria-label',spot.label);target.append(el('small','',{desk:'接待・登記',kitchen:'熱水・餐點',store:'毛巾・備品'}[id]));station.append(el('span','inn-station-icon',{desk:'▤',kitchen:'♨',store:'▥'}[id]),target);stage.append(station);}
  stage.append(el('span','inn-entry','入口 ↑'),el('div','inn-guest-line'),el('div','inn-request-bubbles'));
  for(const [who,id]of [['player',s.actor],...(s.partner?[['partner',s.actor==='kentaro'?'natsumi':'kentaro']]:[])]){const sprite=el('div',`inn-avatar inn-${who}`);const img=el('span','inn-sprite');img.style.backgroundImage=`url("${new URL(config.rpgSprites[id],document.baseURI).href}")`;img.setAttribute('role','img');img.setAttribute('aria-label',names[id]);sprite.append(img,el('small','',who==='player'?'你':names[id]));stage.append(sprite);}
  const aside=el('aside','inn-tasks');aside.append(el('section','inn-live-call'),el('section','inn-context'));layout.append(stage,aside);dialog.append(layout);
  const notice=el('div','inn-notice');notice.setAttribute('role','status');dialog.append(notice);if(s.partner){const partner=el('div','inn-partner-line');partner.setAttribute('role','status');dialog.append(partner);}
  const movement=el('div','inn-travel-status','點房門或工作站，角色會自動走過去。');movement.setAttribute('role','status');dialog.append(movement);
  const blur=()=>{paused=true;},focus=()=>{paused=false;last=performance.now();};window.addEventListener('blur',blur);window.addEventListener('focus',focus);removeKeys=()=>{window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);};
  context='';refresh();last=performance.now();step=0;uiClock=0;saveClock=0;paused=false;
  const tick=now=>{const dt=Math.min(.1,(now-last)/1000);last=now;if(!paused&&!document.hidden&&!speechOpen&&!miniTeaching){uiClock+=dt;saveClock+=dt;if(!work){step+=dt;if(step>.14){step=0;if(path.length){const next=path.shift();model.move(next.x-s.player.x,next.y-s.player.y);}}}if(s.tutorial?.status!=='active'&&work?.dataset.complete!=='true')model.update(dt);if(s.phase!=='playing'){save();render();return;}updatePositions();if(uiClock>.3){uiClock=0;refresh();}if(saveClock>5){saveClock=0;save();}}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
 }
 function go(id){path=innPath(model.s.player,INN_SPOTS[id]);dialog.querySelectorAll('[data-destination]').forEach(n=>n.removeAttribute('data-destination'));dialog.querySelector(`[data-spot="${id}"]`)?.setAttribute('data-destination','true');const status=dialog.querySelector('.inn-travel-status');if(status)status.textContent=path.length?`正在前往${INN_SPOTS[id].label}…`:`已到達${INN_SPOTS[id].label}，可以開始工作。`;context='';refresh();}
 function updatePositions(){const line=dialog.querySelector('.inn-route-path polyline');if(line)line.setAttribute('points',path.length?[model.s.player,...path].map(p=>`${(p.x+.5)*10},${(p.y+.5)*10}`).join(' '):'');if(path.length===0){const dest=dialog.querySelector('[data-destination]');if(dest){dialog.querySelector('.inn-travel-status').textContent=`已到達${INN_SPOTS[dest.dataset.spot].label}，請選擇操作。`;dest.removeAttribute('data-destination');}}for(const who of ['player','partner']){const p=model.s[who],node=dialog.querySelector(`.inn-${who}`);if(p&&node){node.style.left=`${(p.x+.5)/18*100}%`;node.style.top=`${(p.y+.5)/12*100}%`;node.style.setProperty('--sprite-y',`${(p.facing||0)/3*100}%`);node.dataset.walking=String(who==='player'?path.length>0:!!model.s.aiJob);}}}
 function refreshStatus(){const s=model.s;const q=dialog.querySelector('.inn-notice');if(q)q.textContent=s.feedback;const workNotice=dialog.querySelector('.inn-work-notice');if(workNotice)workNotice.textContent=model.calls.length?`${model.calls[model.calls.length-1].text} 可以先做完手上工作，亦可返回處理。`:'';const p=dialog.querySelector('.inn-partner-line');if(p)p.textContent=s.partnerLine||`${names[s.actor==='kentaro'?'natsumi':'kentaro']}正在留意客人的需要。`;}
 function refresh(){if(!dialog.querySelector('.inn-stage'))return;const s=model.s;
  dialog.querySelector('.inn-shift-time').textContent=`值班 ${Math.floor(s.elapsed/60)}:${String(Math.floor(s.elapsed%60)).padStart(2,'0')} · 無倒數失敗`;
  dialog.querySelector('.inn-carry').textContent=`手上 ${s.player.bag.length}/2：${s.player.bag.map(i=>INN_ITEMS[i]).join('、')||'空手'}`;
  dialog.querySelector('.inn-score').textContent=`${INN_DIFFICULTIES[s.difficulty]?.label||'輕鬆'}${s.partner?' · 雙人':''} · 服務評價 ${Math.round(s.quality)}`;refreshStatus();updatePositions();
  dialog.querySelectorAll('.inn-room').forEach((n,i)=>{const r=s.rooms[i];n.dataset.ready=String(r.cleaned.length===3);n.querySelector('.inn-room-state').textContent=r.locked?'門鎖卡住':r.guest?model.s.guests.find(g=>g.id===r.guest).name:i===3?'常客預訂':i===1&&!s.moved?'換房預留':r.cleaned.length===3?'可入住':`待整理 ${r.cleaned.length}/3`;});
  dialog.querySelector('.inn-guest-line').textContent=model.arrived.some(g=>!g.room)?`等候接待：${model.arrived.filter(g=>!g.room).length} 組`:'';
  refreshCalls();
  renderGuide();
  const nearby=Object.keys(INN_SPOTS).find(id=>model.at(id));const stamp=JSON.stringify([model.activeMaintenance,nearby,s.player.bag,s.rooms,s.guests.map(g=>[g.asked,g.room,g.served,model.requests(g),g.arrival<=s.elapsed]),s.aiJob,s.consent,s.moved]);if(context===stamp){renderGuide();return;}context=stamp;const panel=dialog.querySelector('.inn-context');panel.replaceChildren(el('h3','',nearby?INN_SPOTS[nearby].label:'點地點走過去'));
  if(!nearby){panel.append(el('p','','點房門、工作站或客人的氣泡，角色會沿走廊自動前往。'));return;}
  if(nearby==='desk'){
   for(const g of model.arrived){
    if(!g.asked){panel.append(button(`詢問${g.name}`,()=>run(()=>{model.ask(g.id);speak(g.name,s.feedback);})));continue;}
    if(g.room)continue;
    const plan=model.roomPlan(g.id),label=el('label','inn-room-select',`${g.name}安排至：`),select=el('select');select.setAttribute('aria-label',`${g.name}的房間`);const opt=el('option','',`0${plan.room} 號房${plan.room===4?'（預約）':plan.room===1?'（雙床）':''}`);opt.value=plan.room;select.append(opt);label.append(select);panel.append(label,el('p','inn-booking-help',plan.reason));
    if(!plan.ready&&plan.spot!=='desk')panel.append(button(`前往${INN_SPOTS[plan.spot].label}準備客房`,()=>go(plan.spot),'inn-primary'));
    const confirm=button(`確認${g.name}入住`,()=>run(()=>model.assign(g.id,plan.room)));confirm.disabled=!plan.ready;panel.append(confirm);
   }
   if(s.consent&&!s.moved){const ready=s.rooms[1].cleaned.length===3&&!s.rooms[1].locked&&!s.rooms[1].guest;const move=button('由多恩確認換至 02 房',()=>run(()=>model.relocate()));move.disabled=!ready;panel.append(move);if(!ready)panel.append(el('small','inn-booking-help','02 號房是換房預留，先整理好，並非所有房間都已住滿。'));}
   if(s.guests[3].asked&&!s.guests[3].served.includes('luggage'))panel.append(button('拿常客行李',()=>run(()=>model.take('luggage'))));
  }
  if(nearby==='kitchen')for(const i of ['water','meal'])panel.append(button(`取${INN_ITEMS[i]}`,()=>run(()=>model.take(i))));
  if(nearby==='store')panel.append(button('取乾淨毛巾',()=>run(()=>model.take('towel'))));
  if(nearby.startsWith('room')){for(const job of model.activeMaintenance.filter(j=>nearby===`room${j.room}`))panel.append(button('調整床頭燈',()=>lampChallenge(job.id)));const r=s.rooms[+nearby.slice(4)-1];if(r.locked)panel.append(button('調整門鎖',()=>lockChallenge()));else if(r.cleaned.length<3)panel.append(button('親手整理客房',()=>cleanChallenge(r.id)));const g=s.guests.find(g=>g.id===r.guest);if(g)for(const item of model.requests(g).filter(i=>s.player.bag.includes(i)))panel.append(button(`交給${g.name}：${INN_ITEMS[item]}`,()=>run(()=>model.serve(g.id,item))));}
  if(nearby.startsWith('room')){const guest=s.guests.find(g=>g.room===+nearby.slice(4));if(guest)for(const item of model.requests(guest).filter(i=>!s.player.bag.includes(i)))panel.append(el('p','inn-local-request',`${guest.name}：可以幫我送一份${INN_ITEMS[item]}嗎？`),button(`去${item==='towel'?'儲物室':item==='luggage'?'櫃檯':'廚房'}取${INN_ITEMS[item]}`,()=>go(item==='towel'?'store':item==='luggage'?'desk':'kitchen')));}
  s.player.bag.forEach((item,i)=>{const station=item==='towel'?'store':item==='luggage'?'desk':'kitchen';if(nearby===station)panel.append(button(`放回${INN_ITEMS[item]}`,()=>run(()=>model.returnItem(i))));});
  if(s.partner){panel.append(button(s.aiAuto?'同伴自主協助：開':'同伴自主協助：關',()=>run(()=>s.aiAuto=!s.aiAuto)));if(!s.aiJob)for(const g of model.arrived.filter(g=>g.asked&&g.room&&nearby===`room${g.room}`))for(const item of model.requests(g))panel.append(button(`請${names[s.actor==='kentaro'?'natsumi':'kentaro']}送${INN_ITEMS[item]}至 0${g.room}`,()=>run(()=>model.delegate(g.id,item))));}
  renderGuide();
 }
 function refreshCalls(){
  const s=model.s,box=dialog.querySelector('.inn-live-call'),bubbles=dialog.querySelector('.inn-request-bubbles');if(!box)return;
  box.hidden=false;
  const calls=model.calls,newCalls=calls.filter(c=>!seenCalls.has(c.id));let call=calls.find(c=>c.id===callId);
  if(newCalls.length){call=newCalls[newCalls.length-1];newCalls.forEach(c=>seenCalls.add(c.id));callUntil=s.elapsed+12;}
  else if(!call||s.elapsed>=callUntil){call=calls[(calls.findIndex(c=>c.id===callId)+1)%Math.max(1,calls.length)];callUntil=s.elapsed+12;}
  const next=call?.id||'quiet';if(box.dataset.call!==next){box.classList.remove('inn-call-new');void box.offsetWidth;box.classList.add('inn-call-new');box.dataset.call=next;const parts=call?.id.split(':')||[],guest=s.guests.find(g=>g.id===parts[1]);box.replaceChildren(el('small','inn-call-label',parts[0]==='service'?'客人正在呼喚':'現場通知'),el('strong','inn-call-speaker',guest?.name||'旅舍'),el('p','inn-call-quote',parts[0]==='service'?`「可以幫我送一份${INN_ITEMS[parts[2]]}嗎？」`:call?.text||'暫時沒有新的要求，可以預先準備客房。'));if(newCalls.length)onCue('book-page');if(call)box.append(button('過去看看',()=>go(call.spot),'inn-primary'));}callId=call?.id||null;
  const stamp=calls.map(c=>c.id).join('|');if(bubbles.dataset.calls===stamp)return;bubbles.dataset.calls=stamp;bubbles.replaceChildren();
  for(const spot of new Set(calls.map(c=>c.spot))){const group=calls.filter(c=>c.spot===spot),p=INN_SPOTS[spot];const bubble=button(spot==='desk'?`🔔 ${group.length}`:group[0].id==='lock'?'🔧 門鎖':group[0].id.startsWith('lamp:')?'💡 燈具':`💬 ${INN_ITEMS[group[0].id.split(':')[2]]||'需要幫忙'}${group.length>1?' +'+(group.length-1):''}`,()=>go(spot),'inn-request-bubble');bubble.setAttribute('aria-label',group.map(c=>c.text).join(' '));bubble.title=group.map(c=>c.text).join('\n');bubble.style.left=`${(p.x+.5)/18*100}%`;bubble.style.top=spot==='desk'?'55%':'9%';bubbles.append(bubble);}
 }
 function renderGuide(){
  const s=model.s,t=s.tutorial,bar=dialog.querySelector('.inn-guide');if(!bar)return;
  dialog.querySelectorAll('.inn-guide-target').forEach(n=>n.classList.remove('inn-guide-target'));
  if(t?.status!=='active'){bar.hidden=true;dialog.querySelector('.inn-task-list')?.classList.remove('inn-learning-tasks');return;}bar.hidden=false;
  const recommendation=innGuide(s);t.step=recommendation.step;
  if(t.step===6){if(bar.dataset.step==='6')return;bar.dataset.step='6';bar.replaceChildren(el('strong','','✓ 你已經完成一次接待、整理同送物！'),el('p','','接下來可自由安排工作。客人會陸續抵達，等候只影響加給；留意客人同房間冒出的需求氣泡，點氣泡就可以帶路。'),button('明白了 · 開始值班',()=>{t.status='done';s.feedback='接下來準備其他房間，等新客人抵達吧。';save();context='';refresh();},'inn-primary'));return;}
  const {title,text,spot,actions}=recommendation;const stamp=JSON.stringify([t.step,title,model.at(spot)]);
  if(bar.dataset.step!==stamp){bar.dataset.step=stamp;bar.replaceChildren(el('small','','建議下一步 · 可自由安排工作 · 教學期間暫停等候'),el('strong','',title),el('p','',text),button(model.at(spot)?'開啟工作區':`帶我去${INN_SPOTS[spot].label}`,()=>{if(model.at(spot)){const target=Array.from(dialog.querySelectorAll('.inn-context button')).find(btn=>actions.includes(btn.textContent));target?.focus();target?.scrollIntoView({block:'nearest'});}else go(spot);},'inn-guide-go'),button('跳過教學',()=>{t.status='skipped';save();context='';refresh();},'inn-guide-skip'));}
  dialog.querySelector(`[data-spot="${spot}"]`)?.classList.add('inn-guide-target');
  for(const btn of dialog.querySelectorAll('.inn-context button'))if(actions.includes(btn.textContent))btn.classList.add('inn-guide-target');
  const list=dialog.querySelector('.inn-task-list');if(list)list.classList.add('inn-learning-tasks');
 }
 function overlay(title){work=el('section','inn-work-overlay');work.setAttribute('aria-label',title);work.append(el('h2','',title));const leave=()=>{workCleanup();workCleanup=()=>{};work.remove();work=null;context='';save();refresh();dialog.focus({preventScroll:true});};work.append(button('返回工作',leave,'inn-close-work'));work.append(el('p','inn-work-notice'));dialog.append(work);return {box:work,leave};}
 function miniHelp(id,box){const btn=button('新手教學',()=>miniGuide.show(id));btn.className='mini-help-button';box.append(btn);miniGuide.enter(id);}
 function cleanChallenge(id){const {box,leave}=overlay(`整理 0${id} 號房`);workCleanup=roomInteraction({box,cleaned:model.s.rooms[id-1].cleaned,onClean:item=>{model.clean(id,item);save();},onFinish:leave,onCue});miniHelp('inn-room',box);}
 function lampChallenge(id){const {box,leave}=overlay('修好床頭燈');workCleanup=lampInteraction({box,onFinish:()=>{model.fixLamp(id);leave();},onCue});miniHelp('inn-lamp',box);}
 function lockChallenge(){const {box,leave}=overlay('讓房門重新打開');workCleanup=lockInteraction({box,onFinish:()=>{model.fixLock();leave();},onCue});miniHelp('inn-lock',box);}
 return {open(){if(!life().state.innShift){const p=life().state.pending;life().state.innShift=createInn(p.actor,p.companion==='together',{repeat:p.task!=='busy-inn-night',seed:life().state.seed});}model=new InnShift(life().state.innShift);seenCalls=new Set();callId=null;callUntil=0;render();if(!dialog.open)dialog.showModal();dialog.focus({preventScroll:true});},close,get active(){return dialog.open;}};
}
