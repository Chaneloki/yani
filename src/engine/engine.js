import { assert, validateState } from './validate.js';
export class NovelEngine {
  constructor(story, state) {
    this.story = story;
    if (state) { validateState(story, state); this.state = structuredClone(state); }
    else { this.state = { sceneId: story.start, nodeId: story.scenes[story.start].nodes[0].id, flags: {}, history: [] }; this.record(); }
  }
  get scene() { return this.story.scenes[this.state.sceneId]; }
  get node() { return this.scene.nodes.find(n => n.id === this.state.nodeId); }
  get stage() {
    let stage = structuredClone(this.scene.stage);
    for (const n of this.scene.nodes) { if (n.stage) stage = { ...stage, ...structuredClone(n.stage) }; if (n.id === this.node.id) break; }
    return stage;
  }
  get ended() { return this.node.type !== 'choice' && !this.node.next && this.scene.nodes.at(-1).id === this.node.id; }
  record() {
    if (this.node.type !== 'choice') this.state.history = [...this.state.history, { sceneId: this.scene.id, nodeId: this.node.id }].slice(-1000);
  }
  go(sceneId) {
    assert(this.story.scenes[sceneId], '未知場景');
    this.state.sceneId = sceneId; this.state.nodeId = this.scene.nodes[0].id; this.record();
  }
  advance() {
    if (this.node.type === 'choice' || this.ended) return false;
    if (this.node.next) this.go(this.node.next);
    else { this.state.nodeId = this.scene.nodes[this.scene.nodes.indexOf(this.node) + 1].id; this.record(); }
    return true;
  }
  choose(id) {
    assert(this.node.type === 'choice', '目前沒有選項');
    const option = this.node.options.find(o => o.id === id); assert(option, '未知選項');
    this.state.flags = { ...this.state.flags, ...option.set }; this.go(option.target);
  }
  snapshot() { return structuredClone(this.state); }
}
