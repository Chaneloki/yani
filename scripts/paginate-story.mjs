import {readFile,writeFile} from 'node:fs/promises';
import {paginateText} from '../src/content/paginate-text.js';
let changed=0;
for(const file of ['prologue-natsumi','prologue-kentaro','chapter-01','chapter-02']){
 const path=new URL(`../src/content/scripts/${file}.md`,import.meta.url);const text=await readFile(path,'utf8');
 const result=text.replace(/(^### ([\w.-]+\/[\w.-]+) \| [^\n]+\n\n)([\s\S]*?)(?=\n(?:\/)?### |\n## |(?![\s\S]))/gm,(full,heading,id,body)=>{
  // Retain each explicit boundary, subdividing pages that still exceed the limit.
  const prose=body.trim();if(!prose)return full;
  const original=prose.split(/^\s*---[ \t]*$/m).map(page=>page.trim());
  const pages=original.flatMap(page=>paginateText(page));if(pages.length===original.length)return full;
  changed++;return heading+pages.join('\n\n---\n\n')+'\n';
 });
 await writeFile(path,result);
}
console.log(`Added sentence-boundary pagination to ${changed} paragraphs.`);
