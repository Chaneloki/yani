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
  constructor(assets, storage, createAudio = () => new Audio(), {duration=typeof requestAnimationFrame==='function'?900:0,schedule=fn=>requestAnimationFrame(fn),unschedule=id=>cancelAnimationFrame(id),now=()=>performance.now()}={}) {
    this.assets = assets; this.storage = storage; this.createAudio = createAudio;
    this.settings = readAudioSettings(storage); this.listeners = new Set(); this.effects = new Set();
    Object.assign(this,{fadeDuration:duration,schedule,unschedule,now});this.fadeTimer=null;this.fadeGeneration=0;this.gain=1;this.outgoingGain=0;this.outgoing=null;
    this.bgm = this.makeBgm();
    this.currentId = null; this.unlocked = false; this.status = 'idle'; this.preferenceError = false;
    this.applyVolumes();
  }
  makeBgm(){const audio=this.createAudio();audio.preload='none';audio.loop=true;audio.addEventListener('error',()=>{if(audio===this.bgm){this.status='error';this.emit();}});return audio;}
  cancelFade(){this.fadeGeneration++;if(this.fadeTimer!==null)this.unschedule(this.fadeTimer);this.fadeTimer=null;if(this.outgoing)this.outgoing.pause();this.outgoing=null;}
  finishFade(){this.cancelFade();this.gain=1;this.applyVolumes();}
  beginFade(generation){const start=this.now(),from=this.outgoingGain;const tick=()=>{if(generation!==this.fadeGeneration)return;this.fadeTimer=null;const t=Math.min(1,Math.max(0,(this.now()-start)/this.fadeDuration));this.gain=t;this.outgoingGain=from*(1-t);this.applyVolumes();if(t<1)this.fadeTimer=this.schedule(tick);else this.finishFade();};this.fadeTimer=this.schedule(tick);}
  subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emit() { for (const listener of this.listeners) listener(); }
  persist() {
    try { this.storage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.settings)); this.preferenceError = false; }
    catch { this.preferenceError = true; }
  }
  applyVolumes() { this.bgm.volume = this.settings.bgmVolume*this.gain;if(this.outgoing)this.outgoing.volume=this.settings.bgmVolume*this.outgoingGain; for (const se of this.effects) se.volume = this.settings.seVolume; }
  setVolume(channel, value) {
    if (!['bgm','se'].includes(channel)) throw Error('未知音量分類');
    const key = `${channel}Volume`; this.settings[key] = volume(value, this.settings[key]);
    this.applyVolumes(); this.persist(); this.emit();
  }
  sync(id,{instant=false}={}) {
    if(id===this.currentId){if(instant)this.finishFade();return;}
    const previous=this.bgm,previousGain=this.gain;
    const crossfade=!!id&&!!this.currentId&&!previous.paused&&this.unlocked&&this.settings.bgmEnabled&&this.fadeDuration>0&&!instant;
    this.cancelFade();this.currentId=id;this.status='idle';
    if(!id){previous.pause();previous.removeAttribute('src');this.gain=1;this.applyVolumes();this.emit();return;}
    const track=this.assets.bgm?.[id];
    if(!track){previous.pause();this.status='error';this.emit();return;}
    if(crossfade){this.outgoing=previous;this.outgoingGain=previousGain;this.bgm=this.makeBgm();this.gain=0;}
    else{previous.pause();this.gain=1;}
    this.bgm.src=track.src;this.bgm.loop=track.loop!==false;this.applyVolumes();
    const generation=this.fadeGeneration;
    if(this.unlocked)void this.play().then(ok=>{if(generation!==this.fadeGeneration)return;if(crossfade&&ok)this.beginFade(generation);else if(crossfade)this.finishFade();});
    this.emit();
  }
  async unlock() {
    this.unlocked = true;
    if (this.bgm.paused) await this.play();
  }
  async play() {
    if (!this.currentId || !this.settings.bgmEnabled || !this.unlocked) return;
    const id = this.currentId,active=this.bgm;
    try { await active.play(); if (this.currentId === id && this.bgm===active && this.settings.bgmEnabled) this.status = 'playing';else{if(active!==this.bgm||!this.settings.bgmEnabled)active.pause();return false;} }
    catch (error) { if (this.currentId === id && this.bgm===active) this.status = error.name === 'NotAllowedError' ? 'blocked' : 'error'; }
    this.emit();return this.status==='playing';
  }
  async setEnabled(enabled) {
    this.settings.bgmEnabled = enabled; this.persist();
    if (enabled) await this.unlock(); else { this.finishFade();this.bgm.pause(); this.status = 'paused'; }
    this.emit();
  }
  async playSE(id) {
    const clip = this.assets.se?.[id];
    if (!clip || !this.unlocked || this.settings.seVolume === 0) return false;
    const se = this.createAudio(); se.src = clip.src; se.volume = this.settings.seVolume;
    this.effects.add(se);
    const cleanup = () => this.effects.delete(se);
    se.addEventListener('ended', cleanup, { once: true }); se.addEventListener('error', cleanup, { once: true });
    try { await se.play(); if(!this.effects.has(se)){se.pause();return false;} return true; } catch { cleanup(); return false; }
  }
  stopSE() { for(const se of this.effects)se.pause();this.effects.clear(); }
}
