const plain = v => v && typeof v === 'object' && !Array.isArray(v);
export function assert(ok, message) { if (!ok) throw new Error(message); }
export function validateStory(story) {
  assert(story.id && story.revision && story.scenes[story.start], '故事起點不存在');
  const seen = new Set();
  for (const chapter of story.chapters) for (const entry of chapter.entries || []) assert(chapter.scenes.some(s => s.id === entry.scene) && story.characters[entry.perspective], `未知章節入口：${entry.scene}`);
  for (const chapter of story.chapters) for (const s of chapter.scenes) {
    assert(!seen.has(s.id), `重複場景：${s.id}`); seen.add(s.id);
    assert(story.characters[s.perspective], `未知視角：${s.id}`);
    assert(s.nodes?.length && s.stage?.background && Array.isArray(s.stage.portraits), `場景缺少初始舞台：${s.id}`);
    const ids = new Set();
    for (const n of s.nodes) {
      assert(n.id && !ids.has(n.id), `重複或空白段落：${s.id}`); ids.add(n.id);
      assert(['narration','dialogue','thought','choice'].includes(n.type) && typeof n.text === 'string' && n.text.length, `無效段落：${n.id}`);
      if (['dialogue','thought'].includes(n.type)) assert(story.characters[n.speaker], `未知說話者：${n.id}`);
      if (n.attachments !== undefined) {
        assert(Array.isArray(n.attachments), `圖片附件格式錯誤：${n.id}`);
        for (const id of n.attachments) assert(story.assets.messageImages?.[id]?.src, `未知訊息圖片：${id}`);
      }
      if (n.next) assert(story.scenes[n.next], `未知目標：${n.next}`);
      if (n.type === 'choice') {
        assert(n.options?.length, '選項不可為空'); const options = new Set();
        for (const o of n.options) {
          assert(o.id && !options.has(o.id) && typeof o.text === 'string' && story.scenes[o.target], `無效選項：${n.id}`); options.add(o.id);
          if (o.set) validateFlags(o.set);
        }
      }
    }
    for (const stage of [s.stage, ...s.nodes.map(n => n.stage).filter(Boolean)]) {
      if (stage.media) assert(story.assets.messageImages?.[stage.media]?.src, `未知展示圖片：${stage.media}`);
      if (stage.background) assert(story.assets.backgrounds[stage.background], `未知背景：${stage.background}`);
      if (stage.bgm) assert(story.assets.bgm?.[stage.bgm], `未知背景音樂：${stage.bgm}`);
      if (stage.cg) assert(story.assets.cg[stage.cg], `未知 CG：${stage.cg}`);
      for (const p of stage.portraits || []) {
        assert(['left','center','right'].includes(p.position), '未知立繪位置');
        assert(Object.hasOwn(story.characters[p.character]?.variants?.[p.variant] || {}, p.expression), '未知角色版本／表情');
      }
    }
  }
}
export function validateFlags(flags) {
  assert(plain(flags) && Object.keys(flags).length < 200, '無效旗標');
  for (const [k,v] of Object.entries(flags)) assert(!['__proto__','constructor','prototype'].includes(k) && ['string','number','boolean'].includes(typeof v) && (typeof v !== 'number' || Number.isFinite(v)), '無效旗標值');
}
export function validateState(story, state) {
  assert(plain(state), '存檔格式錯誤');
  const scene = story.scenes[state.sceneId];
  assert(scene?.nodes.some(n => n.id === state.nodeId), '存檔段落已不存在，請使用相符的故事版本');
  validateFlags(state.flags);
  assert(Array.isArray(state.history) && state.history.length <= 1000, '閱讀紀錄格式錯誤');
  for (const h of state.history) assert(plain(h) && story.scenes[h.sceneId]?.nodes.some(n => n.id === h.nodeId && n.type !== 'choice'), '閱讀紀錄包含未知段落');
}
