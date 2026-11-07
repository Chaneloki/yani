// Recommendations follow actual work, rather than imposing an intake batch.
export function innGuide(s){
 const resident=s.guests.find(g=>g.id==='resident'),family=s.guests.find(g=>g.id==='family');
 const waterDone=s.guests.some(g=>g.served.includes('water'));
 if(family.room&&waterDone)return {step:6};
 const advice=(step,title,text,spot,actions)=>({step,title,text,spot,actions});
 if(resident.asked&&!resident.served.includes('water')&&!waterDone){
  if(s.player.bag.includes('water'))return advice(2,'可以先把熱水送給住客',`點「0${resident.room} 號房」，將熱水交給住客。亦可以先處理其他客人。`,`room${resident.room}`,['交給住客：熱水']);
  return advice(1,'先照顧這位客人，或繼續接待','住客需要熱水。可以去廚房取一份，亦可以先問其他客人、整理房間；次序由你決定。','kitchen',['取熱水']);
 }
 if(!resident.asked&&!family.asked)return advice(0,'選一位客人，先了解他的需要','去櫃檯詢問任何一位客人即可。接待一位後可以先替他工作，也可以繼續詢問其他人。','desk',['詢問住客','詢問母親與孩子']);
 if(s.rooms[1].cleaned.length<3)return advice(3,'可以先準備 02 號房','母親與孩子需要雙床房。先整理 02 房，便可讓原住客換房；也可以先處理已知的送物需要。','room2',['親手整理客房']);
 if(!s.consent)return advice(0,'換房前先詢問住客','02 房準備好了。到櫃檯問住客是否願意換房，亦可先做其他工作。','desk',['詢問住客']);
 if(!s.moved)return advice(4,'準備好了，可以確認換房','返回櫃檯，請多恩確認換至 02 房。你仍可先處理其他工作。','desk',['由多恩確認換至 02 房']);
 if(!family.asked)return advice(0,'雙床房空出來了','可以在櫃檯詢問母親與孩子，再為他們登記入住。','desk',['詢問母親與孩子']);
 if(!family.room)return advice(5,'可以安排母親與孩子入住','在櫃檯選 01 號房，再確認入住。其他工作亦可隨時處理。','desk',['確認母親與孩子入住']);
 if(s.player.bag.includes('water'))return advice(2,'把熱水送到客房','到 01 號房，將熱水交給母親與孩子。','room1',['交給母親與孩子：熱水']);
 return advice(1,'試一次送物服務','到廚房取熱水，再送到 01 號房。可以自由穿插其他工作。','kitchen',['取熱水']);
}
