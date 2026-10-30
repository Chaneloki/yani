動態封面：`src/content/assets.json` 的 `titleVideo` 設定影片 `src` 同靜態 `poster`。目前使用 `public/assets/video/cover.mp4`（靜音、循環、進入故事後暫停）。瀏覽器阻擋自動播放或玩家偏好減少動態時，保留靜態封面。原始影片在專案外 `01bg/cover.mp4`，網頁版本已壓縮並移除音軌；替換影片後可同步更新 `public/assets/backgrounds/cover-poster.jpg`。

開始畫面：玩家點「開始故事」後選擇奈津美／健太郎視角，或直接讀取現有存檔。系統選單可返回開始畫面。首頁不會自動覆蓋存檔；重新開始前會提示自動存檔將更新。

首頁背景：把圖片放到 `public/assets/backgrounds/`，再設定 `src/content/assets.json` 的 `titleBackground.src` 為 `./assets/backgrounds/檔名`。目前使用中性漸層佔位。更新日誌編輯 `src/content/changelog.json`（日期、標題及條列內容）。

刪除整段對白：將該段的 `###` 標記前後加上 `/`，例如 `/### prologue.natsumi.cafe/line-0058 | 奈津美/`。整段正文會被遊戲略過，檔案仍保留供日後恢復；移除標記前後的 `/` 即可恢復。單獨在正文加 `/` 不會刪除整段。若舊存檔停在已刪除段落，請從章節選單重新開始該場景。

遊戲公開網址：https://chaneloki.github.io/yani/

推送到 `main` 後，GitHub Actions 會先執行測試及建置，再自動發佈 `dist/` 到 GitHub Pages。部署狀態見 repository 的 Actions 分頁。玩家的存檔及音量設定保存在各自瀏覽器，首次點擊後才會播放音樂。

## 日常改句子：直接編輯劇本

正文以以下兩份 Markdown 為準（會覆蓋章節 JSON 內的舊正文）：

- `src/content/scripts/prologue-natsumi.md` — 奈津美視角
- `src/content/scripts/prologue-kentaro.md` — 健太郎視角

```markdown
## 終於有時間了 · 星期三 · 考試結束

### prologue.natsumi.exam/line-0002 | 旁白

最後一科考試結束的那個下午，西奈津美在座位上多坐了整整三分鐘。
不是因為捨不得離開考場，而是腦袋還沒反應過來。
```

只修改標記下面的正文。每個 `###` 區塊代表遊戲的一頁，正文可以換行，不需要 JSON 引號、逗號或轉義字元。儲存後重新整理遊戲即可；測試和建置亦會讀取相同劇本。編輯器可開啟自動換行，方便閱讀長句。

請保留 `###` 後面的 scene/node ID，每個 ID 必須唯一且不可留空。`|` 後面的說話者只供閱讀辨識；真正的說話者、訊息類型、圖片、音樂、背景及分支仍在 `src/content/chapters/prologue.json` 設定。新增獨立段落時需先在該 JSON 加入穩定 node ID，再在劇本加入對應段落；拆分現有段落則直接用下方分頁符。載入時會檢查漏段、重複及未知 ID，避免改錯段落。

未設定 `textFiles` 的章節繼續使用 JSON 正文。新增章節可以在 `manifest.json` 設定 `textFiles`，沿用此編輯方式。不要重新執行舊的一次性匯入工具來覆蓋手動編輯的劇本。

### 將一句拆成多次點擊

在同一個 `###` 段落正文內，用獨立一行 `---` 分頁：

```markdown
### prologue.natsumi.exam/line-0002 | 旁白

最後一科考試結束的那個下午，西奈津美在座位上多坐了整整三分鐘。

---

不是因為捨不得離開考場，而是腦袋還沒反應過來。
```

普通換行仍在同一頁，`---` 才代表點一下顯示下一頁；前後不可留空頁。不需要新增 JSON 節點。背景／音樂提示在第一頁套用，圖片訊息附件、選項及下一場景跳轉放在最後一頁。

第一頁沿用原 ID，額外頁面自動用 `--page-2`、`--page-3` 等 ID，所以原有存檔仍可讀取。如果之後刪除分頁，存在已移除分頁的存檔需要重新從場景開頭閱讀。

---

# 山田 × 西｜Interactive Visual Novel Foundation

這是獨立的新專案，已接入作者提供的完整雙視角序章與四張角色圖片。遊戲從奈津美視角開始，讀完接到健太郎視角；章節目錄可自由選擇。開發 demo 另列並明確標示。沒有新增穿越原因、角色弧線或結局。原始 01char／02story 資料夾未修改，專案內保留副本與匯入紀錄。僅建立本機 Git repository，未設定遠端、推送或部署。

## 啟動與驗證

需要 Node.js 22 或以上，不需要 npm install，沒有外部套件、CDN 或遠端字型。

```sh
cd /Users/loki/Desktop/Loki/YaNi/03yani-foundation
npm run dev
# http://127.0.0.1:4173
npm test
npm run check
npm run build
# 停止 dev 後可檢查打包結果
npm run preview
```

不要直接雙擊 HTML；ES Modules 與 JSON 需要 HTTP server。可用 `PORT=4174 npm run dev` 避免連接埠衝突。本機伺服器只綁定 127.0.0.1，供開發使用。

## 技術選擇

原生 HTML／CSS／JavaScript ES Modules、JSON 內容、localStorage、Node 內建測試工具。沿用過往純前端經驗，從 `hklife` 的分層進一步縮減為 VN 所需的核心。暫不引入 React、Godot Web 匯出或 RPG 框架。技術判斷與舊專案閱讀範圍見 [檢視報告](docs/previous-project-review.md)。

```text
index.html                 入口
src/main.js                UI 組裝、事件與面板
src/ui/style.css           響應式舞台、角色預留、淡入、減少動態效果
src/engine/engine.js       無 DOM 的劇情推進與舞台還原
src/engine/validate.js     內容參照、表情、分支與存檔驗證
src/engine/storage.js      版本化存檔及專屬儲存鍵
src/content/manifest.json  遊戲 ID、內容版本、起點、章節清單
src/content/characters.json 角色／現實及幻想版本／表情素材表
src/content/assets.json   背景、CG、BGM 與 SE 素材表
src/content/chapters/      每章 JSON（場景、段落、選項）
public/assets/            原始圖片輸入；build 時映射為 assets/
scripts/                  本機 server、內容驗證、靜態 build
tests/                    分支、舞台還原、損壞／過期存檔測試
docs/                     架構、創作約束與 GitHub 檢視報告
```

## 操作

點擊舞台、點「繼續」、空白鍵或 → 前進。選項出現時必須選擇；點擊背景不會略過選項。焦點在按鈕時使用原生 Enter／Space 操作按鈕。章節面板可選擇雙視角序章、展開場景或開發 demo，閱讀紀錄只呈現已閱讀的旁白、對話與心聲。全螢幕取決於瀏覽器支援；手機可以正常捲動。

## 加入章節與場景

1. 在 `src/content/chapters/` 建立 JSON，頂層為 `{ "scenes": [...] }`。
2. 在 `manifest.json` 的 `chapters` 加入 `{ "id": "prologue", "title": "序章", "file": "chapters/prologue.json" }`，並按需要更改 `start`。
3. 場景與段落 ID 一旦用於正式存檔便應保持穩定。場景 ID 全遊戲唯一，段落 ID 在場景內唯一。
4. 每個場景明確給出完整初始舞台，避免上一個視角的角色或背景殘留。
5. 執行 `npm run check` 和 `npm test`。

範例 schema（文字自行替換）：

```json
{
  "scenes": [{
    "id": "prologue.natsumi.night",
    "title": "作者提供的場景標題",
    "perspective": "natsumi",
    "timeline": "約會前一晚 · 共同時間 A",
    "stage": {
      "background": "evening",
      "portraits": [{"character":"natsumi","variant":"real","expression":"neutral","position":"right"}],
      "cg": null
    },
    "nodes": [
      {"id":"opening","type":"narration","text":"作者提供的旁白"},
      {"id":"thought","type":"thought","speaker":"natsumi","text":"作者提供的內心獨白"},
      {"id":"line","type":"dialogue","speaker":"natsumi","text":"作者提供的對白","stage":{"portraits":[{"character":"natsumi","variant":"real","expression":"smile","position":"right"}]}},
      {"id":"end","type":"narration","text":"作者提供的段落"}
    ]
  }]
}
```

段落依陣列順序播放；段落可用 `next` 指向另一個場景，優先於下一行。末行沒有 `next` 就停止。新增另一個視角時建立新場景，改 `perspective`、獨白與舞台；可共用 `timeline` 表達重疊事件。時間標籤目前是作者編輯的顯示資訊，不會自動同步兩條時間線。

`stage` 可在段落覆寫 `background`、`portraits`、`cg`。`portraits` 是整個陣列替換，`[]` 清除所有角色，`cg: null` 清除 CG。引擎從場景開頭計算到目前穩定段落 ID，因此讀檔無需重播劇情，仍可還原累積表情與背景。

## 選項與分支

```json
{"id":"select","type":"choice","text":"作者提供的提問","options":[
  {"id":"a","text":"選項 A","target":"demo.kentaro","set":{"route":"a"}},
  {"id":"b","text":"選項 B","target":"demo.palette","set":{"route":"b"}}
]}
```

`target` 必須是已存在的場景 ID；`set` 可選，用來儲存字串、有限數值或布林旗標。不執行故事內的 JavaScript，不支援任意程式碼指令。現階段提供明確分支與旗標記錄，尚未加入條件選項／條件跳轉。正式規則確認後再加小型條件解譯器，不先搬入整套人生養成系統。

## 匯入立繪、背景與 CG

把自己的 PNG／WebP／AVIF 等圖片放在 `public/assets/`；在資料表使用 `./assets/...` 路徑，避免根目錄絕對路徑，方便子路徑部署。

- 立繪：在 `characters.json` 將 `variants.real.neutral` 等 `null` 改為 `"./assets/characters/natsumi/real/neutral.webp"`。健太郎另有 `hero`，奈津美另有 `witch`，每個版本都有獨立表情表。新增表情可直接新增 key。
- 背景：在 `assets.json` 的 `backgrounds` 新增 ID 與 `{ "label":"房間", "theme":"evening", "src":"./assets/backgrounds/room.webp" }`。
- CG：在 `assets.json` 的 `cg` 加 `"example": {"src":"./assets/cg/example.webp"}`，然後在舞台指定 `"cg":"example"`。CG 置於背景之上、立繪之下；若只需要 CG，將 `portraits` 設為 `[]`。

`null` 會顯示中性佔位；不會自動產生或下載任何版權角色圖。立繪以 contain 保留完整比例、背景和 CG 以 cover 填滿。正式美術接入時再按構圖調整裁切與角色尺寸。

## 存檔

3 個手動槽與 1 個自動槽。使用 `yamada-nishi:save:<slot>` 儲存 JSON，不呼叫 `localStorage.clear()`。遊戲 ID、存檔 schema 版本、內容 revision、時間戳、場景 ID、段落 ID、分支旗標與最近 1,000 筆閱讀紀錄一起存入。手動覆蓋與讀取使用頁內確認面板。

前進、選項及章節跳轉後更新自動槽；初次開頁不覆蓋舊自動存檔，也不會自動續玩，可到「讀檔」恢復。讀取失敗時保留現有進度及原存檔。損壞或版本不符會顯示錯誤，空槽不可讀取。儲存空間不足等錯誤會顯示於頁尾。

`manifest.revision` 是內容相容性界線；純文字／圖片修正且 ID 未變時可保留 revision。破壞場景／段落 ID 或規則時應升版，舊檔會被明確拒絕而保留原文。目前沒有跨版本 migration、雲端同步或匯出。瀏覽器／網域／連接埠不同會使用不同儲存空間；清除網站資料會移除存檔。

## 部署（尚未執行）

`npm run build` 產生 `dist/`，內容可放到 GitHub Pages、Cloudflare Pages 或一般靜態主機。發布根目錄選 `dist`，不需 API、伺服器端 runtime、環境密鑰或 SPA rewrite。專案內未建立自動部署 workflow，避免在未獲批准時發布。正式部署前以 `npm run preview` 檢查輸出，並用目標網域測試存檔與行動裝置。根路徑及子路徑皆以相對資源 URL 運作。

## 已完成與尚未實作

已完成：資料驅動 VN、對話／旁白／心聲、姓名、雙視角與時間標籤、多場景／章節目錄、背景／CG／角色版本／表情管線、淡入轉場、選項分支／旗標、已讀紀錄、手動與自動存讀檔、響應式 UI、鍵盤操作、頁內確認、錯誤處理與內容驗證。

尚未實作：後續正式章節、後續場景背景／CG／額外表情美術、配音、打字機／自動播放、條件分支、存檔 migration／匯出、RPG 地圖／戰鬥／任務／技能／背包、線上連線／本機雙人遊戲。故事中的合作 RPG 是敘事設定，並不表示目前網頁已提供雙人連線。未決穿越方式、角色弧線與結局不作推定。

下一步：確認序章分鏡與輕微文字修訂，再補後續場景背景與額外表情。作者文件在 docs/story-bible，原稿備份在 docs/manuscripts；匯入詳情見 docs/content-integration.md。

## 作者內容已接入

14 個序章場景（兩個視角各 7 場）與 508 個閱讀段落。對話明確標示說話者，手機訊息加上「訊息」標記。四張原始 PNG 已複製至 public/assets/characters，現實／幻想版本均已登記。現階段 neutral／smile 共用作者提供的單一圖片，不代表已製作兩種表情。設定摘要僅存於作者文件，不打包成玩家世界介紹。

## 已匯入背景

11 張原始背景已在 `../01bg/` 重新命名為 `bg-<location>-<time-or-state>.png`，舊新名稱對照見該資料夾的 README。遊戲使用 `public/assets/backgrounds/` 的同名 lossless WebP，像素與 PNG 一致，總體積由約 22.9MB 降至 16.8MB。

所有背景均登記於 assets.json，以穩定 ID 引用。序章已接入教室、校園、咖啡店、拉麵店、工場、車站及兩人夜間房間；奈津美熄燈時切換月光版。健太郎日間房間及日間零食房已備妥供後續章節使用。`src/content/prologue-staging.json` 記錄背景分鏡，初次匯入工具會使用它；一般修稿可直接改章節的 stage。

## 聲音

已加入 8 首作者提供的 BGM，按氣氛命名並配到序章場景；設定內分開 BGM／SE 音量，支援即時調整及保存。首次點擊或按鍵後啟動音樂。詳見 [音樂與設定](docs/audio.md) 及 [檔名對照](docs/bgm-names.md)。SE 播放接口已備妥，尚未加入音效素材。

## 訊息圖片

`assets.messageImages` 登記訊息照片，段落使用 `attachments: ["workshop-bumper-photo"]` 引用。實習照片已接入奈津美收到／健太郎傳出的同一則訊息；聊天紀錄與閱讀紀錄可點開放大，關閉後回到原閱讀位置。圖片放在 `public/assets/messages/`，與背景、CG 分開。下載資料夾原圖未修改。

分頁以完整句子為優先，不在逗號截斷，也不為湊 62 字而拆開長句。編輯文字時保留句號／問號／感嘆號。

貼圖使用 `assets.messageImages` 的 `kind: "sticker"`，保留透明背景與正方形比例。翻滾貓已附在兩個視角的恭喜訊息。遊戲宣傳圖使用段落 `stage.media: "fantasy-castle-promo"`，在介紹文字期間保持展示，`stage.media: null` 清除；可點擊放大，閱讀紀錄亦會保留首次展示的圖。
