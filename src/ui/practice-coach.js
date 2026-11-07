// One visible action at a time. Gameplay views remain responsible for all rules.
export function coachPractice(id,box){
 const cue=document.createElement('div');cue.className='mini-coach-cue';cue.setAttribute('role','status');box.prepend(cue);
 let previous=null;
 const find=s=>box.querySelector(s);
 const button=text=>[...box.querySelectorAll('button')].find(n=>!n.hidden&&!n.disabled&&n.textContent.includes(text));
 function next(){
  if(id==='woodwork-kentaro'){
   if(box.dataset.woodPhase==='success')return [button('返回遊戲'),'✓ 返回正式遊戲'];
   if(box.dataset.woodReady==='true')return [find('[data-hold="brake"]'),'✓ 放開固定桿'];
   if(box.dataset.direction==='warning')return [find('.woodwork-direction-map'),'⇄ 即將左右反轉'];
   if(box.dataset.direction==='reversed')return [find('.woodwork-direction-map'),'⇄ 看交叉箭嘴：左鍵向右，右鍵向左'];
   return [find('[data-hold="brake"]'),'按住固定，將指針保持在綠區'];
  }
  if(box.dataset.complete==='true')return [find('.inn-finish-work'),'完成！按這裡返回遊戲。'];
  if(id==='inn-room'){
   const wrinkle=find('.inn-wrinkle:not([hidden])');if(wrinkle)return [wrinkle,'① 按一下發光的皺褶，把床單抹平。'];
   const chair=find('.inn-tactile-chair:not([data-parked="true"])');if(chair)return chair.dataset.selected==='true'?[find('.inn-chair-place'),'② 再按虛線位置，把椅子推回桌邊。']:[chair,'② 按一下椅子，準備把它推回原位。'];
   const selected=find('.inn-tactile-cup[data-selected="true"]:not([hidden])');if(selected)return [find('.inn-cup-tray'),'③ 按托盤，放下手上的杯子。'];
   return [find('.inn-tactile-cup:not([hidden])'),'③ 按一下發光的杯子，把它拿起來。'];
  }
  if(id==='inn-lock')return find('.inn-lock-pin:not([data-lifted="true"])')?[find('.inn-lock-pin:not([data-lifted="true"])'),'① 按發光的鎖銷，將它撥起。三個都要試一次。']:[find('.inn-working-key'),'② 按一下鎖匙，看看鎖舌縮回去。'];
  if(id==='inn-lamp'){
   const scene=find('.inn-lamp-scene');if(scene?.dataset.connected!=='true')return [find('.inn-lamp-socket'),'① 按發光的接頭，先把電線接好。'];
   if(scene.dataset.setting!=='3')return [find('.inn-lamp-knob'),'② 按旋鈕轉一格，繼續調到「暖光」。'];
   return [find('.inn-lamp-pull'),'③ 暖光對了！按拉繩試燈。'];
  }
  const finish=button('返回遊戲');if(finish)return [finish,'✓ 做到了！現在可以回到正式遊戲。'];
  if(id.endsWith('natsumi'))return [find('.mini-rune[data-lit="true"]')||button('確認收緊')||button('施放魔法'),'跟著光點按一下；成功後，下一個位置才會亮起。'];
  if(id==='cargo-pack'){
   const bottom=button('底層'),top=button('上層');
   if(bottom)return box.dataset.pick==='heavy'?[bottom,'② 按木箱底層，放下南瓜。']:[button('選南瓜'),'① 按南瓜，把重的貨物拿起來。'];
   if(top)return box.dataset.pick==='herb'?[top,'④ 按上層，讓香草避開重物。']:[button('選香草'),'③ 南瓜放好了。現在按香草。'];
   return [button('晃動測試'),'⑤ 按這裡晃一晃，看看貨物是否穩固。'];
  }
  if(id.endsWith('kentaro')){const needle=find('.mini-balance-track i'),pos=parseFloat(needle?.style.left||'0');return Math.abs(pos-50)>12?[button(pos<50?'向右':'向左'),'① 按發光的方向，讓指針移入綠色區域。']:[button('扶穩'),'② 按住這裡，直到進度填滿，再放手。'];}
  if(id==='axle-repair')return find('.mini-wheel')?.dataset.lit==='true'?[button('扣緊'),'② 亮了！現在按扣緊。']:[button('向右轉'),'① 按這裡逐格轉動，留意輪環亮起。'];
  return [button('現在操作'),'看指針移動：進入綠色區域時，按發光按鈕。'];
 }
 function update(){const [target,text]=next();if(previous!==target){previous?.classList.remove('mini-coach-target');previous=target;target?.classList.add('mini-coach-target');}if(cue.textContent!==text)cue.textContent=text;}
 const click=event=>{const label=event.target.closest('button')?.textContent||'';if(label.includes('選南瓜'))box.dataset.pick='heavy';if(label.includes('選香草'))box.dataset.pick='herb';update();};
 box.addEventListener('click',click);const observer=new MutationObserver(update);observer.observe(box,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-selected','data-parked','data-lifted','data-connected','data-setting','data-lit','data-complete','data-tested','data-wood-phase','data-wood-ready','data-wood-hot','data-linked','data-analyzed','data-direction','style']});update();
 return ()=>{observer.disconnect();box.removeEventListener('click',click);previous?.classList.remove('mini-coach-target');cue.remove();};
}
