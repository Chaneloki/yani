const plain = v => v && typeof v === 'object' && !Array.isArray(v);
export function assert(ok, message) { if (!ok) throw new Error(message); }
export function validateStory(story) {
  assert(story.id && story.revision && story.scenes[story.start], '故事起點不存在');
  if (story.titleBgm) assert(story.assets.bgm?.[story.titleBgm]?.src, `未知首頁音樂：${story.titleBgm}`);
  for(const cg of Object.values(story.assets.cg||{})){
    if(cg.atmosphere)assert(['starlight','moonlit','breeze','warm'].includes(cg.atmosphere),'未知 CG 環境效果');
    if(cg.cameraSequence){if(cg.cameraSequence.mobileFit)assert(cg.cameraSequence.mobileFit==='framed','未知手機 CG 構圖模式');assert(Number.isFinite(cg.cameraSequence.duration)&&cg.cameraSequence.duration>0,'無效 CG 鏡頭時間');for(const viewport of ['desktop','mobile']){const frames=cg.cameraSequence[viewport];assert(Array.isArray(frames)&&frames.length>=2&&frames[0].offset===0&&frames.at(-1).offset===1,'CG 鏡頭缺少完整構圖');let previous=-1;for(const f of frames){assert(Number.isFinite(f.scale)&&f.scale>=1&&Number.isFinite(f.offset)&&f.offset>previous&&typeof f.position==='string'&&typeof f.origin==='string','無效 CG 鏡頭關鍵影格');previous=f.offset;}}}
  }
  const seen = new Set();
  for (const c of story.chapters) for (const a of c.activities || []) assert(c.scenes.some(s => s.id === a.scene && s.nodes.some(n => n.id === a.node && n.minigame)), '未知活動入口');
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
      if (n.portraitMotion) assert(['nod','startle','laugh','lean'].includes(n.portraitMotion), `未知人物動作：${n.portraitMotion}`);
      if (n.effect) assert(['shake','impact','soft-flash','whiteout'].includes(n.effect), `未知事件效果：${n.effect}`);
      if (n.se !== undefined) assert(typeof n.se==='string' && story.assets.se?.[n.se]?.src, `未知段落音效：${n.id}`);
      if (n.portraitExpression !== undefined) assert(typeof n.portraitExpression==='string' && Object.values(story.characters[n.speaker]?.variants || {}).some(v=>Object.hasOwn(v,n.portraitExpression)), `未知人物表情：${n.id}`);
      if (n.attachments !== undefined) {
        assert(Array.isArray(n.attachments), `圖片附件格式錯誤：${n.id}`);
        for (const id of n.attachments) assert(story.assets.messageImages?.[id]?.src, `未知訊息圖片：${id}`);
      }
      if (n.minigame) {
        assert(n.minigame.id === 'skyrail-rescue' && s.nodes.some(other => other.id === n.minigame.resume), `無效小遊戲：${n.id}`);
        if (n.minigame.guide) assert(n.minigame.guide.id === n.minigame.id && Number.isInteger(n.minigame.guide.version) && n.minigame.guide.version > 0, '無效玩法說明版本');
        if (n.minigame.rules) { assert(plain(n.minigame.rules), '無效關卡參數'); for(const value of Object.values(n.minigame.rules)) assert(typeof value === 'number' && Number.isFinite(value) && value > 0, '關卡參數必須為正數'); }
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
      if (stage.camera != null) assert(['push-in','pan-right','rise','pull-back'].includes(stage.camera), `未知鏡頭效果：${stage.camera}`);
      if (stage.media) assert(story.assets.messageImages?.[stage.media]?.src, `未知展示圖片：${stage.media}`);
      if (stage.background) assert(story.assets.backgrounds[stage.background], `未知背景：${stage.background}`);
      if (stage.bgm) assert(story.assets.bgm?.[stage.bgm], `未知背景音樂：${stage.bgm}`);
      if (stage.cg) assert(story.assets.cg[stage.cg], `未知 CG：${stage.cg}`);
      for (const p of [...(stage.portraits || []), ...(stage.gameAvatars || [])]) {
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
