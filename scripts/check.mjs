import { readStory } from './read-story.mjs';
import { validateStory } from '../src/engine/validate.js';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
const story=await readStory(); validateStory(story);
const paths=[story.assets.titleVideo?.src,story.assets.titleVideo?.poster,story.assets.titleBackground?.src,...Object.values(story.assets.messageImages || {}).map(a=>a.src),...Object.values(story.characters).flatMap(c=>Object.values(c.variants).flatMap(v=>Object.values(v))),...Object.values(story.assets.backgrounds).map(a=>a.src),...Object.values(story.assets.cg).map(a=>a.src),...Object.values(story.assets.bgm || {}).map(a=>a.src),...Object.values(story.assets.se || {}).map(a=>a.src)].filter(Boolean);
for(const path of paths){if(!path.startsWith('./assets/')||path.includes('..')) throw Error(`素材須使用 ./assets/ 相對路徑：${path}`);await access(resolve('public',path));}
console.log(`Validated ${story.chapters.length} chapter(s), ${Object.keys(story.scenes).length} scenes, ${paths.length} assets.`);
