export function nextChapter(story,scene,node){
 if(!node.next)return null;
 const target=story.scenes[node.next];if(!target || target.chapterId===scene.chapterId)return null;
 const current=story.chapters.find(c=>c.id===scene.chapterId),next=story.chapters.find(c=>c.id===target.chapterId);
 return current&&!current.demo&&next&&!next.demo?{current,next,scene:target}:null;
}
