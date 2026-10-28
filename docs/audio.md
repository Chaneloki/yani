# 音樂與聲音設定

## 命名及素材

8 首音樂按作者提供的風格介紹改名，不再綁定單一場景。完整對照在 `bgm-names.md`，原檔 SHA-256 在 `bgm-import.json`。`01bgm/` 的原音檔只重新命名；遊戲副本在 `public/assets/audio/bgm/`，均未改音訊內容。未下載其他音樂。

| ID | 氣氛 | 序章用途 |
| --- | --- | --- |
| warm-daily-life | 溫暖日常 | 研究遊戲、日常期待 |
| cheerful-school-days | 輕快校園 | 考試完成、放學 |
| upbeat-everyday | 活力日常 | 實習工場 |
| cozy-cafe-jazz | 悠閒爵士 | 咖啡店聊天 |
| heartwarming-romance | 溫柔時光 | 拉麵店回憶 |
| playful-comedy | 俏皮插曲 | 觀看遊戲失誤影片 |
| peaceful-night | 靜謐夜色 | 夜晚訊息、睡前 |
| happy-anticipation | 雀躍期待 | 星期五準備約會 |

故事只引用穩定 ID；同一首歌可在任何章節重用。每場景給出初始 `stage.bgm`，段落可覆寫；引擎重建 stage 時一併還原曲目。分鏡清單保存在 `src/content/prologue-staging.json`。

## 播放行為

`src/audio/audio-manager.js` 管理 BGM 與 SE 兩個分類，不依賴 UI 或劇情文字。相同曲目跨段落不重設播放時間；切曲會播放新曲，BGM 預設循環。沒有新增音訊特效或任意套用 SE。

瀏覽器需要使用者手勢：首次點擊或按鍵後嘗試播放，也可在「設定」按播放。載入失敗／自動播放限制不會中斷閱讀，可手動重試。播放／暫停偏好會保存。更換場景或讀檔選擇該段正確曲目，不保存歌曲秒數。

## 設定組織

頁尾或齒輪選單 → 設定：

- 背景音樂 BGM：0–100% 即時音量、曲名、播放／暫停、播放狀態。
- 音效 SE：獨立 0–100% 音量；現階段無 SE 素材，但設定可先保存。

設定使用 `yamada-nishi:settings:audio`，與劇情存檔分開；讀取故事不會覆蓋玩家音量。初始 BGM 50%、SE 70%。0% 表示該分類靜音。儲存不可用時仍可即時調整，只是不會跨重新整理保存。

未來加 SE：在 `assets.se` 登記 `{ "tap": { "label":"輕觸", "src":"./assets/audio/se/se-tap.mp3" } }`，在需要的互動中呼叫 `audio.playSE('tap')`。播放中的音效亦會跟隨 SE 音量更新，不受 BGM 音量影響。此 API 不代表本次已有劇情音效。

驗證：17 項測試通過，含手勢限制、同曲不重播、分軌音量、儲存錯誤、播放被拒、讀檔曲目還原。瀏覽器實測 MP3 readyState=4、paused=false，設定由 50% 調至 49% 後刷新保留，暫停亦保留；測試完成已恢復 50% 及播放。沒有推送或部署。
