// Short situational lines; personality stays in the wording, not role restrictions.
const lines={
 kentaro:{
 start:['清單我收好了。你推，我看著上面這筐。'],resume:['繩子沒鬆，可以走了。這次慢一點就好。'],
 retry:['沒關係，我還扶著。先停一下，再試。','這組重來就好，前面已經固定住了。'],
 set:['這一組穩了。下一組我也幫你扶著。'],ready:['到了。先把車停穩，我拿清單。'],
 bump:['前面那幾塊石頭，往旁邊一點吧。'],sliding:['這筐往外滑了。你先扶回來，我托著上面。'],steady:['嗯，回來了。照這樣慢慢推。'],
 locked:['這一處扣住了，還有下一處。'],repaired:['穩多了。不過到了還是要提醒莉妲換新的。'],
 packed:['這次沒有滑動。可以了，我把清單收好。'],crushed:['香草被壓住了。先拿出來，再找個上面的位置吧。'],unbalanced:['這邊比較重。換一份過去試試？']},
 natsumi:{
 start:['我扶住車了。奈津美，準備好就走吧。'],resume:['好，繼續。我先看看前面有沒有石頭。'],
 retry:['我撐著，沒掉下來。再試一次吧。','等等，我把車扶正。好了，妳再來。'],
 set:['這組拉得很穩耶。剩下的也慢慢來。'],ready:['好了！我扶著，妳把繩子收緊吧。'],
 bump:['前面有塊凸起來的石頭，我先挪開。'],sliding:['我接著這筐。先別急著往前。'],steady:['嗯，這樣就穩了。'],
 locked:['扣住了！下一個也照這樣試試。'],repaired:['妳看，已經不晃了。可以繼續走。'],
 packed:['真的穩了！那我來推，妳看著上面。'],crushed:['啊，這個壓到香草了。先把上面的搬開試試？'],unbalanced:['這箱重好多。要不要把一份換到另一邊？']}
};
export class CompanionReactions{
 constructor(){this.counts=new Map();}
 next(controlled,event){const options=lines[controlled]?.[event]||lines[controlled].start;const key=`${controlled}:${event}`,i=this.counts.get(key)||0;this.counts.set(key,i+1);return options[i%options.length];}
}
