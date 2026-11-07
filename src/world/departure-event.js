const check=(ok,msg)=>{if(!ok)throw Error(msg);};
export const DEPARTURE_ID='beyond-the-map';
export const DIARY_FIRST_ENTRY={id:'estrala-eve',title:'離開埃斯特拉村的前一晚。',lines:[{author:'kentaro',text:'明天跟奧倫一起前往山間驛站。行李已經準備好了，天氣看起來應該不錯。'},{author:'kentaro',text:'希望之後還有機會回來。'},{author:'natsumi',text:'這裡有很多很好的人。'}]};
export function createDepartureEvent(){return {version:1,id:DEPARTURE_ID,phase:'reading',scene:0,page:0};}
export function validateDepartureEvent(s){check(s?.version===1&&s.id===DEPARTURE_ID&&['reading','done'].includes(s.phase)&&Number.isSafeInteger(s.scene)&&s.scene>=0&&Number.isSafeInteger(s.page)&&s.page>=0,'離村前夕故事進度無效');return true;}
export function departurePages(content,paginate){return content.scenes.map(scene=>({...scene,pages:scene.lines.flatMap(line=>paginate(line.text).map((text,i)=>({...line,text,id:`${line.id}-${i}`})))}));}
