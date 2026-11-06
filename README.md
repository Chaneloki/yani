第一章已加入本地版本，從健太郎序章結尾接續，或於「章節」直接選擇。正文編輯 `src/content/scripts/chapter-01.md`，背景配置在 `src/content/chapters/chapter-01.json`。CG／背景需求見 `docs/chapter-01-art-plan.md`。新章節只寫到作者提供的白光結尾，沒有新增穿越後情節。

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

風景鏡頭：在場景或節點 `stage.camera` 設定 `push-in`（慢推近）、`pan-right`（橫移）、`rise`（向上觀景）或 `pull-back`（拉遠）。設定 `null` 會在同一背景的當前位置停下；換背景會重設。每次鏡頭約 18 秒，不循環、不影響文字與立繪；裝置選擇減少動態時停用。

### 第一章作者重寫與列車救援（2026-11-05）

第一章以作者提供的新稿為準；列車操作段落另依作者要求進行互動改編（見下方記錄）；原稿備份：`docs/manuscripts/chapter-01-user-2026-11-05.md`。日常改句子請編輯 `src/content/scripts/chapter-01.md`，保留 `### scene/node | speaker` 標記，內容與演出設定分開。

列車最後一次救援提供單人操作選角，另一人自動配合：

- 健太郎：按住空白鍵／制動按鈕，方向鍵或 A／D 持續修正隨機陣風造成的偏移，軌道修復完成後放手。亦可點「鎖定制動桿」及左右按鈕操作。
- 奈津美：觀察每輪隨機的符文路線，在共鳴亮起期間拖曳或點選下一枚符文，亦可按 1–4。完成三段軌道後點施法或空白鍵。
- 沒有倒數或強制失敗；可選「只閱讀這段劇情」。章節選單的「互動遊戲 · 列車協力救援」可直接試玩。

玩法邏輯在 `src/minigames/skyrail.js`，介面在 `src/ui/skyrail-game.js`／`skyrail-game.css`。劇情節點的 `minigame: {id, resume}` 設定入口與成功接回點；`activity:skyrail-rescue` 旗標記錄操作角色或 `read`，另以遊戲／場景／段落組成獨立完成旗標，避免後續關卡被先前完成狀態略過。故事視角不受選角影響。遊戲中關閉／重開會重新開始救援，故事存檔停留在入口，不保存每一幀操作。

新版第一章保留 `nodeAliases`，讀檔時將舊版已知段落對應至新版相近位置，並提示已轉換；不覆寫原始存檔。原有小說版最後救援文字仍保留於劇本，只閱讀路線可閱覽。

救援動態與難度：勇者約需持續穩定 9 秒，陣風提前 0.8 秒預警，風向與強度隨機。魔女每輪重新排列符文；共鳴亮起約 0.7–1.25 秒、間隔約 0.4–1 秒，每次重新抽取，不使用固定閃爍週期。錯按會記錄失誤並提示，可繼續補救。成功畫面顯示用時及魔女失誤次數。勇者指針同時受隨機緩變氣流與有預警的陣風影響，不沿預設軌跡循環。動畫包含場景搖晃、風線、符文光效、魔力流動、光點及回正，尊重 reduced-motion 設定。

### 玩法說明、角色反應與後續關卡

- `src/ui/rescue-instructions.js`／`.css`：獨立圖解面板，分勇者、魔女兩個頁籤。首次選角後提供「先看玩法／直接開始」；選擇後不再詢問。遊戲內可隨時打開「玩法說明」，開啟期間暫停遊戲。
- `src/minigames/instructions.js`：說明偏好存在瀏覽器獨立 key `yamada-nishi:instructions:v1`，與故事存檔分開。以遊戲 `id` 記錄首次選擇和說明版本。儲存被封鎖時只在本次頁面有效，清除網站資料後會重新詢問。
- 玩法擴充時，更新說明文字並提升節點 `minigame.guide.version`。已玩過的人不會再被詢問；「玩法說明」按鈕亮起約六秒並顯示更新標記，玩家自行開啟後記錄已讀版本。版本高於已存版本且未閱讀時，下次進入仍可提醒。
- `SKYRAIL_RULES` 集中風向變化、預警時間、修復速度、對準容許值、符文輪數及共鳴範圍。各節點可用 `minigame.rules` 覆寫參數。之後可逐關提高難度；若更改輪數等操作規則，亦須同步修改相應說明文字及提升版本。
- `src/minigames/rescue-companion.js`：遊戲專用短反應，涵蓋分段完成、失誤補救、風向提醒及成功對話，有事件去重和停留時間。這些新對話獨立於作者小說原稿，便於再改語氣。
- 技能、消耗資源及新機關仍屬後續功能；新增時應提供相應說明段落、版本與關卡設定，無需重新加入首次詢問。

### 第二章（2026-11-05）

第二章《離家很遠的地方》已接在第一章之後，保留作者三節共 284 個原稿段落。改句子使用 `src/content/scripts/chapter-02.md`；舞台、角色及場景跳轉設定位於 `src/content/chapters/chapter-02.json`。原稿備份在 `docs/manuscripts/chapter-02-user-2026-11-05.md`，並有 SHA-256 匯入紀錄。

山坡沿用既有背景。埃斯特拉村口、村街、櫃檯及房間已使用作者新供圖，旅舍外觀共用村街；素材細節、建議檔名與兩個可選 CG 落點見 `docs/chapter-02-art-plan.md`。沒有自行補寫劇情、增加選項或新小遊戲。人物稱呼、標點及疑似筆誤仍依原稿保留。

### 列車段落與實際操作分工

依作者要求，劇本略過救援入口前 48 段固定機關教學／失敗演出，避免玩家先看完整操作、再玩一次。火球誤傷及救援後的喜劇保留；兩處前置銜接與三句事後對話已調整，避免引用被刪去的倒數或解法發現。

原稿不改；劇本以既有 `/### .../` 標記略過相關段落，刪減前版本存於 `docs/content-snapshots/chapter-01-before-rescue-streamline.*`。改編清單與融入遊戲的對白對照見 `docs/chapter-01-rescue-adaptation.json`。舊段落 ID 透過 `nodeAliases` 對應至救援入口。完成操作後直接接回列車恢復與事後互動；「只閱讀劇情」仍保留最後一次成功救援的完整小說文字。

### 長按快進、章節交接與長段落分頁

閱讀介面左下方「長按快進」按住約 450ms 開始，每 160ms 前進一頁並顯示全文，放手即停。鍵盤聚焦按鈕後亦可按住空白鍵或 Enter。切換視窗、開啟選單、遇到選項、小遊戲入口、章末或全文結束都會停下。控制器位於 `src/ui/hold-to-advance.js`。

跨正式章節前會顯示本章完、下一章名稱與「繼續下一章」按鈕；沒有按下前保留在章末，存檔不提前跳章。同一章內的場景／視角切換不會彈出。判斷位於 `src/ui/chapter-transition.js`。

所有正式章節已按每頁最多兩句加入明確 `---` 分頁，另以約 85 字為一頁目標，在完整句子標點後切開，不改原文字句，亦不以逗號斷頁。第一頁維持原 ID，後續使用既有 `--page-N`；舞台提示只在第一頁、場景跳轉在最後一頁。可自行挪動劇本中的 `---` 調整節奏。`node scripts/paginate-story.mjs` 可處理後續新長段落，原有手動分頁界線會保留，其中仍超過兩句的頁面會再細分；單句過長時不硬切逗號。

### 事件演出與第二章新素材

事件效果放在節點 `effect`（不持續到下一句）：`shake` 為短震動、`impact` 結合震動及暖色亮光、`soft-flash` 為緩光、`whiteout` 為穿越白光。實作在 `src/ui/scene-effects.js`，只帶動背景與立繪，文字不震動；分頁只在第一頁播放。快進及系統 reduced-motion 設定會略過效果。一般第二章對話不加無緣由的閃光／震動。

新背景／NPC 的舊名、新名、網站副本及雜湊記錄位於 `docs/chapter-02-art-import.json`。背景採無損 WebP，人物保留原透明 PNG。莉妲及多恩在尚未確認身分時繼續使用原姓名標示規則，但共用對應立繪。公告板廣場只登記素材，不新增故事事件。

### CG 配樂與視角標示

第二章新增山坡牽手及旅舍月光地圖兩張 CG，分別於 `chapter02.hillside/author-0040` 與 `chapter02.paper-road/author-0272` 開始，同步使用指定的新配樂。第一張於進村結束，第二張維持至章末；兩張皆有緩慢鏡頭運動，CG 顯示時隱藏另疊的立繪。第一章兩張原有 CG 已更新。素材名稱及雜湊記錄位於 `docs/cg-bgm-import-2026-11-05.json`。

玩家介面的視角標示只出現於序章：第一章起，正文、章節目錄與閱讀紀錄不顯示 POV 名稱。內部場景資料維持相容，避免影響存檔與訊息方向判斷。

### 第一批視覺小說演出（研究後實作）

- BGM 使用約 900ms 的雙音軌交疊淡換。新曲開始播放後才淡出舊曲；換音量即時作用於兩軌，暫停會停止淡換與舊曲。快進及 reduced-motion 使用直接換曲，避免堆積背景播放。
- `src/ui/scene-direction.js`：背景／CG 換圖時約 500ms 淡化，保留上一張圖片當時的鏡頭構圖。同一畫面逐句閱讀不重新轉場。
- 節點 `portraitMotion` 可指定 `nod`、`startle`、`laugh`、`lean`，僅指定人物作單次輕微反應；只在第一頁播放。CG、快進、reduced-motion 期間略過。
- 有 CG 時右上角出現欣賞按鈕，或按 H 隱藏閱讀介面。點畫面、返回按鈕、H、Esc、空白鍵可還原；該次操作不翻頁。欣賞模式不改進度，也不新增歷史項目。

沒有加入需要新素材的眼睛／口型動畫、環境 SE 或 Live2D。原有每頁兩句、章末停快進及存檔功能保留。

### 第二批 CG 演出

四張靜態 CG 的 `cameraSequence` 分別提供 desktop／mobile 關鍵構圖（scale、position、origin、offset、duration），24–30 秒完成一條慢鏡頭路徑後停住，同圖閱讀不逐句重播。實作位於 `src/ui/cg-direction.js`，視窗方向改變時重新採用適合的構圖。

`atmosphere` 可選 `starlight`、`moonlit`、`breeze`、`warm`，分別提供星燈冷暖光、旅舍月光及燈光、山谷薄霧、重逢暖光。粒子僅 0–10 個，位置跨分頁維持固定，低不透明度、慢速漂移，不新增圖片依賴。樣式位於 `src/ui/cg-direction.css`。

直向手機上的星鯨及山路 CG 使用 `mobileFit: framed` 保留完整橫向構圖，同圖柔化填滿周圍；旅舍及重逢近景維持全螢幕。快進或 reduced-motion 不播放鏡頭、粒子、霧及燈光動畫，保留靜態構圖與柔光。CG 欣賞模式仍可顯示這些環境層，返回不翻頁。

山路牽手 CG 的起點對齊 `chapter02.hillside/author-0040` 實際伸手握住的第一頁，配樂同步開始。原文及每頁最多兩句的規則不變。

### SE 與幻想版表情差分

音效已接入第一、二章的指定動作，在設定可逐款試聽及調整 SE 音量。`assets.se` 登記穩定 ID，段落頂層 `"se":"door-open"` 只在正常閱讀前進時播放；分頁、讀檔、章節跳轉及長按快進不重播。`public/assets/audio/se/` 與 BGM 分類分開，素材與來源對照見 `docs/se-import-2026-11-05.json`。

勇者新增 `concerned`、魔女新增 `thoughtful`：段落頂層加 `"portraitExpression":"concerned"`（或 `thoughtful`）只覆蓋該段說話者的表情；下一段自動恢復原舞台表情。它不會令旁白／心聲多顯示立繪。Q 版目前為候選，未放進正文。原圖均保留；研究、生成提示與指定對白清單見 `docs/visual-direction/expressions-and-se-2026-11-05.md`。

幻想版第二批表情：健太郎 `hero.happy`／`hero.surprised`，奈津美 `witch.amused`／`witch.puzzled`。前三個已選用的表情（happy、surprised、puzzled）在第二章指定對白出現；amused 登記備用。使用方式同 `portraitExpression`；原圖及完整提示詞、逐句套用位置見 `docs/visual-direction/expressions-and-se-2026-11-05.md`。

### 踩地圖玩法試作

開始畫面新增「踩地圖 · 玩法試玩」，與故事存檔分開保存，可重設；首次提供可跳過的實際操作教程。正式讀完第二章後亦可解鎖村莊主頁，開始按存檔回到地圖／進行中的故事。

已提供早午晚、切換控制角色、同伴隨機安排、廣場唯一委託處、前往目的地完成簡單操作、收入／住宿欠款、背包、熟練度、情報與局部路線解鎖。劇情、經濟數值及第三章目的地均為佔位，技能效果與進階難度稍後開發。資料編輯 `src/content/world.json`，完整規則及存檔說明見 `docs/world/README.md`。

### 支線 02：旅舍即時玩法

《旅舍忙碌的一晚》已加入山田單獨、西單獨、雙人同行三版原稿，以及可走動、整理客房、兩格攜物、送物、修門鎖與 AI 分工的第一版玩法。完成首次故事後開放獨立的重複工作《旅舍值班》。開始畫面的「旅舍 · 獨立試玩」可直接測試各版本，進度獨立保存。操作、內容檔、存檔與擴充說明見 [旅舍玩法文件](docs/world/busy-inn-night.md)。其餘五條支線仍為計劃內容。
