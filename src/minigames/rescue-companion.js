// Short game-only reactions. Narrative manuscript remains separate.
export class RescueCompanion {
 constructor(role){this.role=role;this.round=1;this.mistakes=0;this.milestone=0;this.ready=false;this.stable=false;this.warning=false;this.lastWarning=-10;this.until=0;this.serial=0;this.text=role==='kentaro'?'你先拉住，我來接軌道。':'我拉住了，妳慢慢看。';this.beat='';this.kind='';}
 say(game,text,beat='',kind='progress'){this.text=text;this.beat=beat;this.kind=kind;this.until=game.elapsed+3.2;this.serial++;}
 update(game){
  if(game.ready&&!this.ready){this.say(game,this.role==='kentaro'?'接好了，現在可以慢慢放開。':'三段都接上了。奈津美，準備好了嗎？','軌道修復完成');this.ready=true;return this;}
  if(game.ready)return this;
  if(this.role==='natsumi'){
   if(game.round>this.round){this.round=game.round;this.say(game,game.round===2?'接上了。我繼續拉著。':'剩最後一段，照剛才那樣就好。',`第 ${game.round-1} 段已接通`);}
   else if(game.mistakes>this.mistakes){this.mistakes=game.mistakes;this.say(game,game.mistakes%2?'沒關係，我還拉得住。等它亮了再試。':'先別急，看看是哪一個在亮。','未能連接 · 可以再試','retry');}
  }else{
   const milestone=Math.min(2,Math.floor(game.progress*3));
   const stable=game.brake&&Math.abs(game.alignment)<(game.rules?.alignmentTolerance??12);
   if(milestone>this.milestone){this.milestone=milestone;this.say(game,milestone===1?'第一段接好了。再保持一下。':'快好了，我在接最後一段。',`第 ${milestone} 段已接通`);}
   else if(game.windWarning&&!this.warning&&game.elapsed-this.lastWarning>4){this.lastWarning=game.elapsed;this.say(game,game.windDirection>0?'風要把車廂往右推了，往左一點。':'風要把車廂往左推了，往右一點。','陣風將至','wind');}
   else if(this.stable&&!stable&&game.elapsed>this.until){this.say(game,'偏了一點。往中間拉，還來得及。','重新對準','retry');}
   this.stable=stable;this.warning=game.windWarning;
  }
  if(game.elapsed>this.until){this.beat='';this.kind='';this.text=this.role==='kentaro'?(game.brake&&Math.abs(game.alignment)<(game.rules?.alignmentTolerance??12)?'嗯，就是這裡。我繼續接。':'我在這邊，對準後就能繼續。'):'我還拉著，等符文亮起再接。';}
  return this;
 }
}
export function successExchange(role){return role==='kentaro'?[
 {speaker:'natsumi',text:'接回去了。剛才那陣風還真難抓。'},
 {speaker:'kentaro',text:'還好妳有提醒我。下一段也一起來吧。'}
]:[
 {speaker:'kentaro',text:'成功了。奈津美，最後那下接得好準。'},
 {speaker:'natsumi',text:'因為你一直拉著嘛。'}
];}
