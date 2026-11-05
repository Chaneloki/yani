# Audio assets

- `bgm/`：循環背景音樂，按氣氛與風格命名 `bgm-<mood>.mp3`。
- `se/`：短音效，使用 `se-<action>.mp3` 等名稱，與 BGM 分開保存。

在 `src/content/assets.json` 的 `bgm`／`se` 登記穩定 ID、label、src。背景音樂使用場景 `stage.bgm` 或段落 `stage.bgm` 選曲，`null` 表示停止。圖片、音樂與音效不可混放。

本次八個 MP3 是作者提供的原檔副本，只更名，未重新編碼。原始 renamed MP3 位於專案外 `01bgm/`。

SE 來源與 hash 見 `docs/se-import-2026-11-05.json`；原素材保留在專案外 `01se/`。段落頂層 `se` 在正常前進時觸發一次，分頁與讀檔不重播。
