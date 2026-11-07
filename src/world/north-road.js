const check=(ok,msg)=>{if(!ok)throw Error(msg);};
export const NORTH_OBSERVATIONS={sign:{label:'舊路標與警告牌',text:'舊木牌仍指向星燈之城，後加的警告牌則標明前方斷橋。路標存在，不代表道路仍能通行。'},bridge:{label:'斷橋與對岸道路',text:'兩端橋台仍在，中央橋身已經崩落。對岸的石板路還向北延伸，但目前無法通過。'},river:{label:'從安全高處查看下游',text:'從遠離河岸的平坦步道觀察：水流湍急、兩岸陡峭，能看見的範圍內沒有其他橋樑或安全渡河位置。'}};
export function createNorthRoad(actor,together=false){return {version:1,variant:together?'together':actor,phase:'trail',page:0,observed:[],mapUpdated:false,reported:false};}
export function validateNorthRoad(s){check(s?.version===1&&['kentaro','natsumi','together'].includes(s.variant)&&['trail','observe','reflection','map','return','report','night','settle','done'].includes(s.phase)&&Number.isSafeInteger(s.page)&&s.page>=0,'北路調查進度無效');check(Array.isArray(s.observed)&&new Set(s.observed).size===s.observed.length&&s.observed.every(k=>Object.hasOwn(NORTH_OBSERVATIONS,k))&&typeof s.mapUpdated==='boolean'&&typeof s.reported==='boolean','北路調查記錄無效');if(['reflection','map','return','report','night','settle','done'].includes(s.phase))check(s.observed.length===3,'先確認三項路況');if(['return','report','night','settle','done'].includes(s.phase))check(s.mapUpdated,'先更新地圖');if(['night','settle','done'].includes(s.phase))check(s.reported,'先向多恩回報');return true;}
export class NorthRoad{
 constructor(s){validateNorthRoad(s);this.s=structuredClone(s);}
 snapshot(){return structuredClone(this.s);}
 observe(id){check(this.s.phase==='observe'&&Object.hasOwn(NORTH_OBSERVATIONS,id),'現在不能觀察這個位置');if(!this.s.observed.includes(id))this.s.observed.push(id);return NORTH_OBSERVATIONS[id].text;}
 continue(){check(this.s.phase==='observe'&&this.s.observed.length===3,'先查看路標、斷橋及下游');this.s.phase='reflection';this.s.page=0;}
 storyEnd(){const next={trail:'observe',reflection:'map',night:'settle'}[this.s.phase];check(next,'現在不是故事段落');this.s.phase=next;this.s.page=0;}
 updateMap(){check(this.s.phase==='map','先完成觀察');this.s.mapUpdated=true;this.s.phase='return';}
 returnInn(){check(this.s.phase==='return','先更新地圖');this.s.phase='report';}
 report(){check(this.s.phase==='report','先返回旅舍');this.s.reported=true;this.s.phase='night';this.s.page=0;}
}
