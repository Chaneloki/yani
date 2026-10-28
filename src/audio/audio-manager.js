export const AUDIO_SETTINGS_KEY = 'yamada-nishi:settings:audio';
const defaults = { bgmVolume: .5, seVolume: .7, bgmEnabled: true };
const volume = (value, fallback) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
export function readAudioSettings(storage) {
  try {
    const parsed = JSON.parse(storage.getItem(AUDIO_SETTINGS_KEY));
    return { bgmVolume: volume(parsed?.bgmVolume, defaults.bgmVolume), seVolume: volume(parsed?.seVolume, defaults.seVolume), bgmEnabled: typeof parsed?.bgmEnabled === 'boolean' ? parsed.bgmEnabled : true };
  } catch { return { ...defaults }; }
}
export class AudioManager {
  constructor(assets, storage, createAudio = () => new Audio()) {
    this.assets = assets; this.storage = storage; this.createAudio = createAudio;
    this.settings = readAudioSettings(storage); this.listeners = new Set(); this.effects = new Set();
    this.bgm = createAudio(); this.bgm.preload = 'none'; this.bgm.loop = true;
    this.currentId = null; this.unlocked = false; this.status = 'idle'; this.preferenceError = false;
    this.bgm.addEventListener('error', () => { this.status = 'error'; this.emit(); });
    this.applyVolumes();
  }
  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit() { for (const listener of this.listeners) listener(); }
  persist() {
    try { this.storage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.settings)); this.preferenceError = false; }
    catch { this.preferenceError = true; }
  }
  applyVolumes() { this.bgm.volume = this.settings.bgmVolume; for (const se of this.effects) se.volume = this.settings.seVolume; }
  setVolume(channel, value) {
    if (!['bgm','se'].includes(channel)) throw Error('未知音量分類');
    const key = `${channel}Volume`; this.settings[key] = volume(value, this.settings[key]);
    this.applyVolumes(); this.persist(); this.emit();
  }
  sync(id) {
    if (id === this.currentId) return; // Dialogue advancement must not restart the music.
    this.bgm.pause(); this.currentId = id; this.status = 'idle';
    if (!id) { this.bgm.removeAttribute('src'); this.emit(); return; }
    const track = this.assets.bgm?.[id];
    if (!track) { this.status = 'error'; this.emit(); return; }
    this.bgm.src = track.src; this.bgm.loop = track.loop !== false;
    if (this.unlocked) void this.play();
    this.emit();
  }
  async unlock() {
    this.unlocked = true;
    if (this.bgm.paused) await this.play();
  }
  async play() {
    if (!this.currentId || !this.settings.bgmEnabled || !this.unlocked) return;
    const id = this.currentId;
    try { await this.bgm.play(); if (this.currentId === id) this.status = 'playing'; }
    catch (error) { if (this.currentId === id) this.status = error.name === 'NotAllowedError' ? 'blocked' : 'error'; }
    this.emit();
  }
  async setEnabled(enabled) {
    this.settings.bgmEnabled = enabled; this.persist();
    if (enabled) await this.unlock(); else { this.bgm.pause(); this.status = 'paused'; }
    this.emit();
  }
  async playSE(id) {
    const clip = this.assets.se?.[id];
    if (!clip || !this.unlocked || this.settings.seVolume === 0) return false;
    const se = this.createAudio(); se.src = clip.src; se.volume = this.settings.seVolume;
    this.effects.add(se);
    const cleanup = () => this.effects.delete(se);
    se.addEventListener('ended', cleanup, { once: true }); se.addEventListener('error', cleanup, { once: true });
    try { await se.play(); return true; } catch { cleanup(); return false; }
  }
}
