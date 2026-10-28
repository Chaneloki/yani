import { assert, validateState } from './validate.js';
export const SAVE_VERSION = 1;
export class SaveStore {
  constructor(story, storage) { this.story = story; this.storage = storage; }
  key(slot) { assert(['auto','1','2','3'].includes(slot), '未知存檔槽'); return `yamada-nishi:save:${slot}`; }
  save(slot, state) {
    validateState(this.story, state);
    const data = { version: SAVE_VERSION, storyId: this.story.id, revision: this.story.revision, savedAt: new Date().toISOString(), state };
    this.storage.setItem(this.key(slot), JSON.stringify(data)); return data;
  }
  load(slot) {
    const raw = this.storage.getItem(this.key(slot)); if (raw === null) return null;
    const data = JSON.parse(raw);
    assert(data?.version === SAVE_VERSION && data.storyId === this.story.id && data.revision === this.story.revision, '這份存檔與目前故事版本不相容；原存檔已保留');
    assert(typeof data.savedAt === 'string' && Number.isFinite(Date.parse(data.savedAt)), '存檔時間無效');
    validateState(this.story, data.state); return data;
  }
}
