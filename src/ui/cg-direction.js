// CG camera paths and atmosphere are independent of story advancement and text layers.
export class CgDirection {
 constructor(image,layer,{narrow=()=>window.innerWidth<=700,reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches,create=tag=>document.createElement(tag),backdrop=null,portrait=()=>typeof window!=='undefined'&&window.innerHeight>window.innerWidth*1.25}={}){
  Object.assign(this,{image,layer,narrow,reduced,create,backdrop,portrait});this.key=null;this.animation=null;this.asset=null;this.fast=false;
 }
 setFast(value){this.fast=value;this.layer.dataset.static=String(value||this.reduced());}
 update(id,asset,{skip=false}={}){
  this.setFast(skip);const framed=!!asset?.cameraSequence?.mobileFit&&this.narrow()&&this.portrait();const key=id?`${id}/${this.narrow()?'mobile':'desktop'}/${framed?'framed':'full'}`:null;
  if(key===this.key){if(skip&&this.animation){this.animation.cancel();this.animation=null;}if(!this.animation)this.applyFirstFrame();return;}
  this.animation?.cancel();this.animation=null;this.key=key;this.asset=asset||null;
  this.layer.replaceChildren();this.layer.hidden=!asset?.atmosphere;this.image.dataset.framed=String(framed);
  if(this.backdrop){this.backdrop.hidden=!framed;this.backdrop.style.backgroundImage=framed?`url("${asset.src}")`:'';}
  if(!asset)return;
  this.layer.dataset.profile=asset.atmosphere||'';
  if(asset.atmosphere){
   for(const name of ['warm','cool','mist']){const e=this.create('div');e.className=`cg-ambient-${name}`;this.layer.append(e);}
   const count={starlight:10,moonlit:6,breeze:6,warm:0}[asset.atmosphere]||0;
   for(let i=0;i<count;i++){
    const e=this.create('i');e.className='cg-ambient-particle';
    // Stable per-picture placement avoids rebuilding a different sky on each page.
    const x=asset.atmosphere==='moonlit'?64+(i*23%34):8+(i*37%86);
    const y=asset.atmosphere==='moonlit'?15+(i*13%48):20+(i*19%70);
    e.style.cssText=`--x:${x}%;--y:${y}%;--duration:${12+i%5*3}s;--delay:${-i*2.7}s;--drift:${i%2?12:-9}px;--size:${i%3===0?2.5:1.5}px`;this.layer.append(e);
   }
  }
  const path=this.path();if(!path?.length)return;
  this.applyFirstFrame();
  if(skip||this.reduced())return;
  this.animation=this.image.animate(path.map(frame=>({transform:`scale(${frame.scale})`,transformOrigin:frame.origin||'50% 50%',objectPosition:frame.position||asset.position||'center',offset:frame.offset})),{duration:asset.cameraSequence.duration||26000,easing:'ease-in-out',fill:'forwards'});
 }
 path(){return this.asset?.cameraSequence?.[this.narrow()?'mobile':'desktop'];}
 applyFirstFrame(){const first=this.path()?.[0];if(!first)return;this.image.style.transform=`scale(${first.scale})`;this.image.style.transformOrigin=first.origin||'50% 50%';this.image.style.objectPosition=first.position||this.asset.position||'center';}
 reset(){this.animation?.cancel();this.animation=null;this.key=null;this.asset=null;this.layer.hidden=true;this.layer.replaceChildren();this.image.style.transform='';this.image.dataset.framed='false';if(this.backdrop)this.backdrop.hidden=true;}
}
