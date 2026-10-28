// Markdown owns prose and page breaks; JSON owns staging and navigation.
export function applyScriptText(chapter, documents) {
  const nodes = new Map(chapter.scenes.flatMap(s => s.nodes.map(n => [`${s.id}/${n.id}`, n])));
  const edits = new Map();
  for (const document of documents) {
    let key = null, lines = [];
    const flush = () => {
      if (!key) return;
      if (!nodes.has(key)) throw Error(`劇本段落 ID 不存在：${key}`);
      if (edits.has(key)) throw Error(`劇本段落 ID 重複：${key}`);
      const text = lines.join('\n').trim();
      if (!text) throw Error(`劇本段落不可留空：${key}`);
      const pages = text.split(/^\s*---[ \t]*$/m).map(page => page.trim());
      if (pages.some(page => !page)) throw Error(`分頁前後不可留空：${key}`);
      edits.set(key, pages);
    };
    for (const line of document.replace(/\r\n/g, '\n').split('\n')) {
      if (line.startsWith('### ')) {
        flush();
        const match = /^### ([\w.-]+\/[\w.-]+) \| .+$/.exec(line);
        if (!match) throw Error(`劇本標記格式錯誤：${line}`);
        key = match[1]; lines = [];
      } else if (/^#{1,2} /.test(line)) { flush(); key = null; lines = []; }
      else if (key) lines.push(line);
    }
    flush();
  }
  for (const [key, node] of nodes) if (node.text !== undefined && !edits.has(key)) throw Error(`劇本缺少段落：${key}`);
  // Prepare all pages before committing, so malformed scripts cannot partially mutate content.
  const expanded = chapter.scenes.map(scene => {
    const ids = new Set();
    const pages = scene.nodes.flatMap(node => {
      const texts = edits.get(`${scene.id}/${node.id}`);
      if (!texts) return [node];
      return texts.map((text, index) => {
        const page = structuredClone(node);
        page.id = index === 0 ? node.id : `${node.id}--page-${index + 1}`;
        page.text = text;
        if (index > 0) delete page.stage; // Apply scene cues once, on the original page.
        if (index < texts.length - 1) {
          delete page.next; delete page.advanceLabel; delete page.attachments; delete page.options;
          if (page.type === 'choice') page.type = 'narration';
        }
        return page;
      });
    });
    for (const page of pages) {
      if (ids.has(page.id)) throw Error(`分頁 ID 衝突：${scene.id}/${page.id}`);
      ids.add(page.id);
    }
    return pages;
  });
  chapter.scenes.forEach((scene, index) => { scene.nodes = expanded[index]; });
  return chapter;
}
