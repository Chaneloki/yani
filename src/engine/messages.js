// Only include messages the player has actually read in this chapter and POV.
export function chapterMessages(story, state) {
  const current = story.scenes[state.sceneId];
  const messages = new Map();
  for (const h of state.history) {
    const scene = story.scenes[h.sceneId];
    if (!scene || scene.chapterId !== current.chapterId || scene.perspective !== current.perspective) continue;
    const node = scene.nodes.find(n => n.id === h.nodeId);
    if (node?.channel !== 'message') continue;
    const key = `${scene.id}/${node.id}`;
    if (!messages.has(key)) messages.set(key, { scene, node });
  }
  return [...messages.values()];
}
