const wrap=n=>(n%360+360)%360;
export class AxleRepair {
 constructor(saved=null,seed=Math.floor(Math.random()*0xffffffff)){this.angle=0;this.locks=0;this.misses=0;this.seed=seed>>>0;this.target=30+Math.floor(this.random()*300);if(saved)Object.assign(this,structuredClone(saved));}
 random(){this.seed=(1664525*this.seed+1013904223)>>>0;return this.seed/4294967296;}
 get error(){return Math.abs(((this.angle-this.target+540)%360)-180);}
 get aligned(){return this.error<=11;}
 get complete(){return this.locks===3;}
 rotate(degrees){if(!this.complete)this.angle=wrap(this.angle+degrees);}
 aim(degrees){if(!this.complete)this.angle=wrap(degrees);}
 lock(){if(this.complete)return false;if(!this.aligned){this.misses++;return false;}this.locks++;if(!this.complete)this.target=wrap(this.target+65+Math.floor(this.random()*190));return true;}
 snapshot(){return {angle:this.angle,target:this.target,locks:this.locks,misses:this.misses,seed:this.seed};}
}
