// Small tactile interactions: forgiving spatial actions, not timing penalties.
export class BedSmoothing {
 constructor(){this.zones=[{x:25,y:30},{x:65,y:50},{x:40,y:75}];this.smoothed=new Set();}
 brush(x,y){const i=this.zones.findIndex(p=>Math.hypot(x-p.x,y-p.y)<24);if(i>=0)this.smoothed.add(i);return this.complete;}
 get complete(){return this.smoothed.size===this.zones.length;}
}
export class LatchLock {
 constructor(){this.pins=[false,false,false];this.angle=0;}
 lift(index){if(Number.isInteger(index)&&index>=0&&index<3)this.pins[index]=true;}
 get released(){return this.pins.every(Boolean);}
 turn(angle){if(!this.released)return false;this.angle=Math.max(0,Math.min(90,angle));return this.open;}
 get open(){return this.released&&this.angle>=82;}
}
export class LampRepair {
 constructor(){this.connected=false;this.setting=0;this.on=false;}
 connect(){this.connected=true;}
 turn(){this.setting=(this.setting+1)%4;}
 get mood(){return ['熄滅','偏暗','太刺眼','溫暖柔和'][this.setting];}
 test(){this.on=true;return this.complete;}
 get complete(){return this.connected&&this.setting===3&&this.on;}
}
