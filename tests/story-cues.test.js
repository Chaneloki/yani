import test from 'node:test';
import assert from 'node:assert/strict';
import {readStory} from '../scripts/read-story.mjs';
import {validateStory} from '../src/engine/validate.js';
import {applyScriptText} from '../src/content/script-text.js';
test('splitting prose plays an SE once but preserves facial expression through its paragraph',()=>{
 const chapter={scenes:[{id:'test.scene',nodes:[{id:'line',type:'dialogue',speaker:'kentaro',text:'old',se:'door-open',portraitExpression:'concerned'}]}]};
 applyScriptText(chapter,['### test.scene/line | 健太郎\n前句。\n---\n後句。']);
 const [a,b]=chapter.scenes[0].nodes;assert.equal(a.se,'door-open');assert.equal(b.se,undefined);assert.equal(b.portraitExpression,'concerned');
});
test('authored sound and expression cues are valid and invalid references are rejected',async()=>{
 const story=await readStory();validateStory(story);
 assert.equal(Object.keys(story.assets.se).length,9);
 const node=story.scenes['chapter02.hillside'].nodes.find(n=>n.id==='author-0036');assert.equal(node.portraitExpression,'concerned');
 node.se='missing';assert.throws(()=>validateStory(story),/未知段落音效/);delete node.se;
 node.portraitExpression='missing';assert.throws(()=>validateStory(story),/未知人物表情/);
});
