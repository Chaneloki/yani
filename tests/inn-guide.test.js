import test from 'node:test';
import assert from 'node:assert/strict';
import {createInn,InnShift,INN_SPOTS} from '../src/world/inn-game.js';
import {innGuide} from '../src/world/inn-guide.js';
test('one guest can be served before asking the family during the tutorial',()=>{
 const m=new InnShift(createInn('kentaro',false)),s=m.s;s.tutorial.status='active';
 Object.assign(s.player,INN_SPOTS.desk);m.ask('resident');
 assert.equal(innGuide(s).spot,'kitchen');
 Object.assign(s.player,INN_SPOTS.kitchen);m.take('water');assert.equal(innGuide(s).spot,'room1');
 Object.assign(s.player,INN_SPOTS.room1);m.serve('resident','water');
 assert.equal(s.guests[1].asked,false);assert.equal(innGuide(s).spot,'room2');
});
test('asking both guests first and preparing a room first remain valid',()=>{
 const m=new InnShift(createInn('natsumi',false)),s=m.s;s.tutorial.status='active';
 Object.assign(s.player,INN_SPOTS.room2);for(const item of ['bed','chair','cup'])m.clean(2,item);
 Object.assign(s.player,INN_SPOTS.desk);m.ask('family');assert.equal(innGuide(s).spot,'desk');m.ask('resident');
 assert.equal(s.guests.filter(g=>g.asked).length,2);assert.equal(innGuide(s).spot,'kitchen');
 m.relocate();m.assign('family',1);assert.equal(s.guests[1].room,1);
});
