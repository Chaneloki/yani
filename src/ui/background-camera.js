export const CAMERA_MOVES={
 'push-in':'scale(1.09)',
 'pan-right':'scale(1.08) translateX(-1.5%)',
 'rise':'scale(1.08) translateY(1.5%)',
 'pull-back':'scale(1.015)'
};
export class BackgroundCamera {
 constructor(element,{reduced=()=>false,transform=()=>getComputedStyle(element).transform}={}){this.element=element;this.reduced=reduced;this.transform=transform;this.key=null;this.motion=null;this.animation=null;}
 update(key,motion=null){
  if(this.key===key && this.motion===motion)return;
  const changed=this.key!==key;this.key=key;this.motion=motion;
  if(this.reduced()) {this.animation?.cancel();this.animation=null;return;}
  // Stop at the current frame when dialogue resumes; never snap the same image back.
  if(!changed && !motion){this.animation?.pause();return;}
  const from=changed?(motion==='pull-back'?'scale(1.08)':'none'):this.transform();
  this.animation?.cancel();this.animation=null;
  if(!motion)return;
  this.animation=this.element.animate([{transform:from},{transform:CAMERA_MOVES[motion]}],{duration:18000,easing:'ease-out',fill:'forwards'});
 }
 pause(){this.animation?.pause();}
 reset(){this.animation?.cancel();this.animation=null;this.key=null;this.motion=null;}
}
