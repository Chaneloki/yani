export function openAudioSettings({ panel, audio, el, button, modal }) {
  const body = panel('設定');
  body.append(el('p', 'settings-intro', '聲音設定會自動保存，亦會套用到其他章節。'));
  function slider(channel, title, description) {
    const section = el('section', 'settings-section');
    const header = el('div', 'settings-section-header'); header.append(el('h3', '', title));
    const output = el('output', 'volume-value'); header.append(output);
    const input = el('input', 'volume-slider'); input.type = 'range'; input.min = '0'; input.max = '100'; input.step = '1'; input.setAttribute('aria-label', `${title}音量`);
    input.value = Math.round(audio.settings[`${channel}Volume`] * 100); output.textContent = `${input.value}%`;
    input.oninput = () => { output.textContent = `${input.value}%`; audio.setVolume(channel, Number(input.value) / 100); };
    section.append(header, el('p', 'muted', description), input);
    body.append(section); return section;
  }
  const bgm = slider('bgm', '背景音樂 BGM', '0% 為靜音，調整即時生效。');
  const current = el('p', 'current-track'); const playback = button('', async () => { await audio.setEnabled(!audio.settings.bgmEnabled || audio.status !== 'playing'); });
  const status = el('p', 'muted'); status.setAttribute('role', 'status');
  bgm.append(current, playback, status);
  const se=slider('se', '音效 SE', '開門、腳步、紙張與魔法等劇情音效。快進及讀檔不重播；0% 為靜音。');
  const previews=el('div','se-previews');previews.setAttribute('aria-label','音效試聽');
  const seStatus=el('p','muted');seStatus.setAttribute('role','status');
  for(const [id,clip] of Object.entries(audio.assets.se || {}))previews.append(button(`▷ ${clip.label}`,async()=>{await audio.unlock();audio.stopSE();const ok=await audio.playSE(id);seStatus.textContent=ok?`試聽：${clip.label}`:audio.settings.seVolume===0?'音效目前為靜音，請先調高音量。':'音效未能播放，請再試一次。';},'menu-button'));
  se.append(previews,seStatus);
  const update = () => {
    current.textContent = `目前曲目：${audio.assets.bgm?.[audio.currentId]?.label || '此場景沒有背景音樂'}`;
    playback.textContent = audio.status === 'playing' ? '暫停背景音樂' : '播放背景音樂';
    playback.disabled = !audio.currentId;
    status.textContent = audio.preferenceError ? '音量已套用，但目前瀏覽器無法保存設定。' : audio.status === 'error' ? '音樂未能載入，可以再按播放重試。' : audio.status === 'blocked' ? '請按播放背景音樂以啟動聲音。' : audio.status === 'playing' ? '播放中' : !audio.settings.bgmEnabled ? '背景音樂已暫停' : '首次點擊或按鍵後開始播放。';
  };
  update(); const unsubscribe = audio.subscribe(update);
  modal.addEventListener('close', unsubscribe, { once: true });
}
