export class SceneDissolve {
 constructor(image){this.image=image;this.previous=null;this.key=null;this.animation=null;}
 update(key,visual,{skip=false,oldTransform='none',oldPosition=null,oldFrame=null}={}){
  if(key===this.key){if(skip)this.clear();return;}
  const previous=this.previous;this.key=key;this.previous=visual;this.clear();
  if(skip||!previous?.src)return;
  this.image.style.inset=oldFrame?'auto 0 auto':'0';this.image.style.top=oldFrame?.top||'0';this.image.style.height=oldFrame?.height||'100%';
  this.image.src=previous.src;this.image.style.objectPosition=oldPosition||previous.position||'center';this.image.style.transform=oldTransform;this.image.hidden=false;
  const animation=this.image.animate([{opacity:1},{opacity:0}],{duration:500,easing:'ease-in-out'});this.animation=animation;
  animation.onfinish=()=>{if(this.animation===animation){this.image.hidden=true;this.animation=null;}};
 }
 clear(){this.animation?.cancel();this.animation=null;this.image.hidden=true;}
 reset(){this.clear();this.key=null;this.previous=null;}
}
export const PORTRAIT_REACTIONS={
 nod:{frames:[{translate:'0px 0px'},{translate:'0px 3px'},{translate:'0px 0px'}],duration:300},
 startle:{frames:[{translate:'0px 0px',rotate:'0deg'},{translate:'0px -5px',rotate:'-.5deg'},{translate:'0px 0px',rotate:'0deg'}],duration:340},
 laugh:{frames:[{translate:'0px 0px'},{translate:'0px -2px'},{translate:'0px 0px'},{translate:'0px -1px'},{translate:'0px 0px'}],duration:480},
 lean:{frames:[{scale:'1'},{scale:'1.025',offset:.65},{scale:'1'}],duration:650}
};
export class PortraitReaction {
 constructor(){this.key=null;this.animation=null;}
 play(key,name,element,{skip=false}={}){if(this.key===key)return;this.key=key;this.animation?.cancel();this.animation=null;const reaction=PORTRAIT_REACTIONS[name];if(skip||!element||!reaction)return;this.animation=element.animate(reaction.frames,{duration:reaction.duration,easing:'ease-in-out'});}
 reset(){this.animation?.cancel();this.animation=null;this.key=null;}
}
