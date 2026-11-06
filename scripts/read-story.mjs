import { applyScriptText } from '../src/content/script-text.js';
import { readFile } from 'node:fs/promises';
const root=new URL('../src/content/',import.meta.url);
export async function readStory(){
 const read=async f=>JSON.parse(await readFile(new URL(f,root),'utf8'));
 const [manifest,characters,assets,world]=await Promise.all(['manifest.json','characters.json','assets.json','world.json'].map(read));
 world.questStories={'first-wages':await read('quests/first-wages.json'),'busy-inn-night':await read('quests/busy-inn-night.json')};world.catalog=await read('quests/estrala-catalog.json');
 const chapters=await Promise.all(manifest.chapters.map(async c=>{
  const chapter={...c,...await read(c.file)};
  if(c.textFiles)applyScriptText(chapter,await Promise.all(c.textFiles.map(f=>readFile(new URL(f,root),'utf8'))));
  return chapter;
 }));
 return {...manifest,characters,assets,world,chapters,scenes:Object.fromEntries(chapters.flatMap(c=>c.scenes.map(s=>[s.id,{...s,chapterId:c.id}])))};
}
