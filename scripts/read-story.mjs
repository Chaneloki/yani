import { applyScriptText } from '../src/content/script-text.js';
import { readFile } from 'node:fs/promises';
const root=new URL('../src/content/',import.meta.url);
export async function readStory(){
 const read=async f=>JSON.parse(await readFile(new URL(f,root),'utf8'));
 const [manifest,characters,assets]=await Promise.all(['manifest.json','characters.json','assets.json'].map(read));
 const chapters=await Promise.all(manifest.chapters.map(async c=>{
  const chapter={...c,...await read(c.file)};
  if(c.textFiles)applyScriptText(chapter,await Promise.all(c.textFiles.map(f=>readFile(new URL(f,root),'utf8'))));
  return chapter;
 }));
 return {...manifest,characters,assets,chapters,scenes:Object.fromEntries(chapters.flatMap(c=>c.scenes.map(s=>[s.id,{...s,chapterId:c.id}])))};
}
