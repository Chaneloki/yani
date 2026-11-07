import { applyScriptText } from './script-text.js';
import { validateStory } from '../engine/validate.js';
export async function loadStory() {
  const read = async path => {
    const response = await fetch(new URL(path, import.meta.url));
    if (!response.ok) throw new Error(`無法載入內容：${path}`);
    return response.json();
  };
  const [manifest, characters, assets, world] = await Promise.all(['manifest.json', 'characters.json', 'assets.json', 'world.json'].map(read));
  world.questStories={'first-wages':await read('quests/first-wages.json'),'busy-inn-night':await read('quests/busy-inn-night.json'),'windowsill-herbs':await read('quests/windowsill-herbs.json'),'carpenter-workbench':await read('quests/carpenter-workbench.json'),'keep-the-promise':await read('quests/keep-the-promise.json'),'unreachable-north-road':await read('quests/unreachable-north-road.json'),'two-delivery-lists':await read('quests/two-delivery-lists.json')};world.catalog=await read('quests/estrala-catalog.json');world.eventStories={'beyond-the-map':await read('events/beyond-the-map.json'),'separate-days':await read('events/separate-days.json')};
  const chapters = await Promise.all(manifest.chapters.map(async c => {
    const chapter = { ...c, ...await read(c.file) };
    if (c.textFiles) applyScriptText(chapter, await Promise.all(c.textFiles.map(async path => {
      const response = await fetch(new URL(path, import.meta.url), { cache: 'no-store' });
      if (!response.ok) throw Error(`無法載入劇本：${path}`);
      return response.text();
    })));
    return chapter;
  }));
  const story = { ...manifest, characters, assets, world, chapters, scenes: Object.fromEntries(chapters.flatMap(c => c.scenes.map(s => [s.id, { ...s, chapterId: c.id }]))) };
  validateStory(story);
  return story;
}
