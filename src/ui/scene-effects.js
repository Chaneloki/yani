const SHAKE=[{translate:'0px 0px'},{translate:'-7px 2px'},{translate:'6px -2px'},{translate:'-4px 1px'},{translate:'3px 0px'},{translate:'0px 0px'}];
export class SceneEffects {
 constructor(layers,overlay){this.layers=layers;this.overlay=overlay;this.animations=[];this.key=null;}
 cancel(){for(const a of this.animations)a.cancel();this.animations=[];}
 reset(){this.cancel();this.key=null;}
 play(key,effect,{reduced=false,fast=false}={}){
  if(key===this.key)return;this.key=key;this.cancel();
  if(!effect||reduced||fast)return;
  if(['shake','impact'].includes(effect))for(const layer of this.layers)this.animations.push(layer.animate(SHAKE,{duration:effect==='impact'?430:330,easing:'ease-out'}));
  if(['impact','soft-flash','whiteout'].includes(effect)){
   this.overlay.style.background=effect==='impact'?'#ffc07a':'#ffffff';
   const peak=effect==='whiteout'?.9:effect==='impact'?.35:.24;
   this.animations.push(this.overlay.animate([{opacity:0},{opacity:peak,offset:.22},{opacity:0}],{duration:effect==='whiteout'?1100:effect==='impact'?450:850,easing:'ease-out'}));
  }
 }
}
