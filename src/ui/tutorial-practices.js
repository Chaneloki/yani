import {Woodwork} from '../world/woodwork.js';
import {mountWoodworkGame} from '../world/woodwork-view.js';
import {coachPractice} from './practice-coach.js';
import {roomInteraction,lockInteraction,lampInteraction} from '../world/inn-interactions.js';
export const TUTORIALS={
 'woodwork-kentaro':{title:'山田維修 · 方向與固定'},
 'inn-room':{title:'整理客房'},'inn-lock':{title:'修好門鎖'},'inn-lamp':{title:'修好床頭燈'},
 'cargo-pack':{title:'整理送貨木箱'},'cart-kentaro':{title:'推車・穩住貨箱'},'cart-natsumi':{title:'推車・連續繩結'},'axle-repair':{title:'固定輪軸'},
 'skyrail-kentaro':{title:'列車・穩住車廂'},'skyrail-natsumi':{title:'列車・編織軌道'},'work-timing':{title:'抓準工作時機'}
};
const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const b=(label,fn)=>{const n=e('button','',label);n.type='button';n.onclick=fn;return n;};
export function createTutorialPractice(id,box,finish){
 const dispose=buildPractice(id,box,finish);
 const uncoach=coachPractice(id,box);
 return ()=>{uncoach();dispose?.();};
}
function buildPractice(id,box,finish){
 if(id==='woodwork-kentaro')return mountWoodworkGame({box,game:new Woodwork(null,{level:'easy',skill:true}),onDone:finish,practice:true});
 const common={box,onFinish:finish,onCue:()=>{}};
 if(id==='inn-room')return roomInteraction({...common,cleaned:[],onClean:()=>{}});
 if(id==='inn-lock')return lockInteraction(common);
 if(id==='inn-lamp')return lampInteraction(common);
 const status=e('p','mini-practice-step'),board=e('div','mini-practice-board'),actions=e('div','mini-practice-actions');status.setAttribute('role','status');box.append(status,board,actions);
 function done(){status.textContent='✓ 試到了！正式遊戲亦是同一種操作。';actions.replaceChildren(b('明白了 · 返回遊戲',finish));}
 if(id.endsWith('natsumi')){
  let step=0;const route=[0,2,1,3],buttons=[];status.textContent='先點正在發光的節點。練習會等你，正式遊戲要留意亮起的時機。';
  for(let i=0;i<4;i++){const node=b(String(i+1),()=>{if(i!==route[step]){status.textContent='跟住發光的節點就可以，練習唔扣分。';return;}node.dataset.done='true';step++;buttons.forEach(n=>n.dataset.lit='false');if(step===4){status.textContent='一組接好喇。最後按確認收緊／施法。';actions.append(b(id.startsWith('cart')?'確認收緊':'施放魔法',done));}else{buttons[route[step]].dataset.lit='true';status.textContent=`已連接 ${step}/4，留意下一個發光位置。`;}});node.className='mini-rune';node.style.left=[15,38,65,85][i]+'%';node.style.top=[65,30,70,28][i]+'%';buttons.push(node);board.append(node);}buttons[0].dataset.lit='true';return;
 }
 if(id.endsWith('kentaro')){
  let position=20,centered=false,held=false,charge=0,frame,last=performance.now();status.textContent='先按左／右，將指針移入中間的綠色位置。';const track=e('div','mini-balance-track'),safe=e('span'),needle=e('i');track.append(safe,needle);board.append(track);needle.style.left=position+'%';
  const steer=delta=>{position=Math.max(0,Math.min(100,position+delta));needle.style.left=position+'%';centered=Math.abs(position-50)<=12;if(centered)status.textContent='對準了！按住「扶穩」試試；到進度滿時放手。';};actions.append(b('← 向左',()=>steer(-10)));const hold=b('按住 · 扶穩',()=>{});hold.onpointerdown=event=>{event.preventDefault();hold.setPointerCapture(event.pointerId);held=true;};const release=()=>{held=false;if(charge>=1){cancelAnimationFrame(frame);done();}};hold.onpointerup=hold.onpointercancel=release;hold.onkeydown=event=>{if(['Space','Enter'].includes(event.code)){event.preventDefault();held=true;}};hold.onkeyup=release;actions.append(hold,b('向右 →',()=>steer(10)));const progress=e('progress');progress.max=1;board.append(progress);const tick=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;if(held&&centered)charge=Math.min(1,charge+dt);progress.value=charge;if(charge>=1)status.textContent='穩住了，現在放手。';frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(frame);
 }
 if(id==='axle-repair'){
  let angle=0;status.textContent='轉動固定環，留意短暫亮光。練習期間到正確位置會保持亮起，方便試。';const wheel=e('div','mini-wheel','◉');board.append(wheel);function turn(d){angle=(angle+d+360)%360;wheel.style.transform=`rotate(${angle}deg)`;wheel.dataset.lit=String(Math.abs(angle-90)<15);if(Math.abs(angle-90)<15)status.textContent='咔，位置對了。按「扣緊」固定。';}actions.append(b('↶ 向左轉',()=>turn(-30)),b('扣緊',()=>{if(Math.abs(angle-90)<15)done();else status.textContent='再轉一點，等固定環亮起再扣緊。';}),b('向右轉 ↷',()=>turn(30)));return;
 }
 if(id==='cargo-pack'){
  let selected=null,heavy=false,herb=false;status.textContent='先選南瓜，再點木箱底層：重物放下面。';const crate=e('div','mini-demo-crate'),top=b('上層',()=>place('top')),bottom=b('底層',()=>place('bottom'));crate.append(top,bottom);board.append(crate);const pumpkin=b('🎃 選南瓜',()=>{selected='heavy';}),leaf=b('🌿 選香草',()=>{selected='herb';});actions.append(pumpkin,leaf);
  function place(slot){if(selected==='heavy'&&slot==='bottom'){heavy=true;bottom.textContent='🎃 南瓜';status.textContent='再把香草放上面，避免承重。';}else if(selected==='herb'&&slot==='top'&&heavy){herb=true;top.textContent='🌿 香草';status.textContent='放穩了。試一次晃動檢查。';actions.append(b('晃動測試',()=>{crate.classList.add('mini-crate-shake');done();}));}else status.textContent='重物先放底層；容易壓壞的香草放上面。';selected=null;}return;
 }
 let frame,last=performance.now(),phase=0,pos=0;status.textContent='看住移動指針，進入綠色位置時按一次。失手可以再試。';const track=e('div','mini-balance-track'),safe=e('span'),needle=e('i');track.append(safe,needle);board.append(track);safe.style.left='35%';safe.style.width='30%';actions.append(b('現在操作',()=>{if(Math.abs(pos-50)<17){cancelAnimationFrame(frame);frame=null;done();}else status.textContent='差少少，等指針移入綠色位置再試。';}));const tick=now=>{phase+=(now-last)/700;last=now;pos=50+Math.sin(phase)*45;needle.style.left=pos+'%';frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return ()=>{if(frame)cancelAnimationFrame(frame);};
}
