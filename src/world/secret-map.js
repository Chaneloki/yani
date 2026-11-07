export const SECRET_LANDMARKS={rocks:{name:'巨龍山脈',real:'三塊並排的大石頭',x:19,y:52,objects:[['tree','樹旁',12,33],['boulders','三塊大石頭',20,59],['path','石路',12,78]],correct:'boulders'},canal:{name:'銀色大河',real:'村裡的灌溉水渠',x:49,y:61,objects:[['bridge','小橋',47,45],['water','灌溉水渠',51,68],['grass','渠邊的草',40,80]],correct:'water'},mill:{name:'國王的城堡',real:'舊磨坊旁的小木屋',x:82,y:44,objects:[['roof','小木屋',87,39],['pot','花盆後面',79,70],['door','木門',89,60]],correct:'roof'}};
const check=(ok,message)=>{if(!ok)throw Error(message);};
export const SECRET_PHASES=['well','explore','rocks','canal','encounter','route','found','respond','reconcile','night','settle','done'];
export function createSecretMap(actor,together){return {version:1,variant:together?'together':actor,phase:'well',page:0,place:'rocks',found:[],encountered:false,routeRead:false,boxFound:false,response:null};}
export function validateSecretMap(s){check(s&&s.version===1&&['kentaro','natsumi','together'].includes(s.variant)&&SECRET_PHASES.includes(s.phase)&&Number.isSafeInteger(s.page)&&s.page>=0,'秘密地圖進度無效');check(Object.hasOwn(SECRET_LANDMARKS,s.place)&&Array.isArray(s.found)&&new Set(s.found).size===s.found.length&&s.found.every(id=>Object.hasOwn(SECRET_LANDMARKS,id)),'秘密地圖地點無效');check(typeof s.encountered==='boolean'&&typeof s.routeRead==='boolean'&&typeof s.boxFound==='boolean'&&[null,'accompany','wait'].includes(s.response),'秘密地圖事件無效');if(s.boxFound)check(s.found.length===3&&s.encountered&&s.routeRead,'先完成地圖調查');if(['found','respond','reconcile','night','settle','done'].includes(s.phase))check(s.boxFound,'先找回藍盒子');return true;}
export class SecretMap{
 constructor(s){validateSecretMap(s);this.s=structuredClone(s);}
 visit(place){check(this.s.phase==='explore'&&Object.hasOwn(SECRET_LANDMARKS,place),'先讀完目前的對話');this.s.place=place;}
 inspect(object){check(this.s.phase==='explore','先讀完目前的對話');const s=this.s,l=SECRET_LANDMARKS[s.place];check(l.objects.some(([id])=>id===object),'未知觀察位置');
  if(object==='pot'&&s.place==='mill'){
   if(s.found.length!==3||!s.encountered||!s.routeRead)return {found:false,text:'花盆旁有移動過的痕跡。先比對地圖上的三個記號。'};
   s.boxFound=true;s.phase='found';s.page=0;return {found:true,text:'花盆後面露出藍色盒蓋上的星星。'};
  }
  if(object!==l.correct)return {found:false,text:'再看看附近，找出與手繪地圖相同的形狀。'};
  if(s.found.includes(s.place))return {found:false,text:`已確認：${l.name}，就是${l.real}。`};
  s.found.push(s.place);s.page=0;
  if(s.variant==='together'&&['rocks','canal'].includes(s.place))s.phase=s.place;
  else this.encounterIfReady();
  return {found:true,text:`✓ ${l.name} → ${l.real}`};
 }
 encounterIfReady(){if(!this.s.encountered&&this.s.found.includes('rocks')&&this.s.found.includes('canal'))this.s.phase='encounter';}
 storyEnd(){const s=this.s;s.page=0;
  if(s.phase==='well'){s.phase='explore';return;}
  if(['rocks','canal'].includes(s.phase)){s.phase='explore';this.encounterIfReady();return;}
  if(s.phase==='encounter'){s.encountered=true;s.phase=s.variant==='together'?'explore':'route';if(s.variant==='together')s.routeRead=true;return;}
  if(s.phase==='route'){s.routeRead=true;s.phase='explore';return;}
  if(s.phase==='found'){s.phase=s.variant==='together'?'reconcile':'respond';return;}
  if(s.phase==='reconcile'){s.phase='night';return;}
  if(s.phase==='night'){s.phase='settle';return;}
  throw Error('現在沒有待結束的故事');
 }
 respond(choice){check(this.s.phase==='respond'&&['accompany','wait'].includes(choice),'未知回應');this.s.response=choice;this.s.phase='reconcile';this.s.page=0;}
 snapshot(){return structuredClone(this.s);}
}
