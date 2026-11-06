export const CARGO_ITEMS=[
 {id:'pumpkin',label:'南瓜',icon:'🎃',w:2,h:2,weight:4},
 {id:'roots',label:'根菜',icon:'🥔',w:2,h:1,weight:4},
 {id:'carrots',label:'紅蘿蔔',icon:'🥕',w:1,h:3,weight:2},
 {id:'cabbage',label:'高麗菜',icon:'🥬',w:2,h:1,weight:3},
 {id:'greens',label:'嫩葉菜',icon:'🌱',w:2,h:1,weight:1,fragile:true},
 {id:'herbs',label:'香草',icon:'🌿',w:1,h:1,weight:1,fragile:true}
];
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function validateCargo(s){if(!s||!Array.isArray(s.placements)||s.placements.length>6||typeof s.passed!=='boolean'||!Number.isSafeInteger(s.attempts)||s.attempts<0)throw Error('裝箱存檔無效');const ids=new Set();for(const p of s.placements){const item=CARGO_ITEMS.find(i=>i.id===p.id);if(!item||ids.has(p.id)||![0,1].includes(p.box)||![p.x,p.y,p.w,p.h].every(Number.isInteger)||p.x<0||p.y<0||p.x+p.w>3||p.y+p.h>3||!((p.w===item.w&&p.h===item.h)||(p.w===item.h&&p.h===item.w)))throw Error('貨物位置無效');ids.add(p.id);}for(let i=0;i<s.placements.length;i++)for(let j=i+1;j<s.placements.length;j++)if(s.placements[i].box===s.placements[j].box&&overlap(s.placements[i],s.placements[j]))throw Error('貨物互相重疊');return true;}
export class CargoPacking {
 constructor(saved=null){this.state=saved?structuredClone(saved):{placements:[],passed:false,attempts:0};validateCargo(this.state);}
 snapshot(){return structuredClone(this.state);}
 get placements(){return this.state.placements;}
 fits(p,exclude=null){return p.x>=0&&p.y>=0&&p.x+p.w<=3&&p.y+p.h<=3&&!this.placements.some(q=>q.id!==exclude&&q.box===p.box&&overlap(p,q));}
 settle(){for(let turn=0;turn<10;turn++){let moved=false;for(const p of [...this.placements].sort((a,b)=>b.y-a.y))while(this.fits({...p,y:p.y+1},p.id)){p.y++;moved=true;}if(!moved)break;}}
 remove(id){this.state.placements=this.placements.filter(p=>p.id!==id);this.state.passed=false;this.settle();}
 place(id,box,column,rotated=false){const item=CARGO_ITEMS.find(i=>i.id===id);if(!item||![0,1].includes(box)||!Number.isInteger(column))throw Error('未知貨物或木箱');const backup=this.snapshot();this.remove(id);const p={id,box,x:column,y:0,w:rotated?item.h:item.w,h:rotated?item.w:item.h};if(!this.fits(p)){this.state=backup;throw Error('這裡放不下，試試旋轉貨物或換一欄。');}while(this.fits({...p,y:p.y+1}))p.y++;this.placements.push(p);this.state.passed=false;return p;}
 get weights(){return [0,1].map(box=>this.placements.filter(p=>p.box===box).reduce((sum,p)=>sum+CARGO_ITEMS.find(i=>i.id===p.id).weight,0));}
 get issues(){const issues=[];if(this.placements.length<6)issues.push({id:'missing',text:`還有 ${6-this.placements.length} 份蔬菜未裝箱。`});for(const p of this.placements){const item=CARGO_ITEMS.find(i=>i.id===p.id);if(item.fragile&&this.placements.some(q=>q.box===p.box&&q.id!==p.id&&q.y+q.h<=p.y&&q.x<p.x+p.w&&q.x+q.w>p.x))issues.push({id:p.id,text:`${item.label}上面承受了貨物，石路一晃就容易壓壞。`});}const [left,right]=this.weights;if(Math.abs(left-right)>3)issues.push({id:'balance',text:`兩箱重量相差 ${Math.abs(left-right)}，推車容易往${left>right?'左':'右'}偏。`});for(const box of [0,1]){const pieces=this.placements.filter(p=>p.box===box),total=this.weights[box];if(total&&pieces.reduce((sum,p)=>sum+CARGO_ITEMS.find(i=>i.id===p.id).weight*(3-p.y-p.h/2)/3,0)/total>.59)issues.push({id:'height',text:`木箱 ${box+1} 的重心太高，將較重的移低一些。`});}return issues;}
 test(){this.state.attempts++;this.state.passed=this.issues.length===0;return {passed:this.state.passed,issues:this.issues};}
}
