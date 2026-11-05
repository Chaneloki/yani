# 幻想版表情與 SE（2026-11-05）

## 表情校準依據

已重新查閱 [官方山田人物介紹](https://sh-anime.shochiku.co.jp/seihantai_anime/character/%E5%B1%B1%E7%94%B0)、[官方西人物介紹](https://sh-anime.shochiku.co.jp/seihantai_anime/character/%E8%A5%BF)，以及 [阿賀沢紅茶訪談／好書好日（2025-03-13）](https://book.asahi.com/article/15653552)。

官方介紹：山田開朗、直接、不刻意修飾；西安靜而容易笑，配音員評論提及豐富心聲。作者訪談重視各自成長為獨立個體；亦提及圓潤的變形人物輪廓喜好。這些是角色與創作觀依據，並非作者對本遊戲或新圖的認證。本次沒有逐格重讀完整漫畫，不聲稱任何眉眼組合是原作指定表情。

本專案推論：山田的直接應以明確視線和自然嘴形呈現，不用瞇眼面紅的大笑；西的思考不等於社交恐慌。Q 版只服務少量喜劇節奏。使用者已交代多年交往／成年成長，優先於高中初期介紹。

## 本次檔案

使用 **built-in image_gen**，依作者原 PNG 編輯。完整 prompts：`expression-prompts-2026-11-05.json`。

- `../../public/assets/characters/kentaro-hero-concerned.webp`：勇者認真／擔心。原始生成 PNG 保存在 `../../../01char/01pic/kentaro-hero-concerned.png`。
- `../../public/assets/characters/natsumi-witch-thoughtful.webp`：魔女思考／不安。原始生成 PNG 保存在 `../../../01char/01pic/natsumi-witch-thoughtful.png`。
- `../../../01char/01pic/expression-candidates/kentaro-hero-chibi-startled.png`：Q 版愣住候選，尚未套進正文。
- 先前現實版測試留在同一 `expression-candidates`；被否決的大笑圖沒有註冊／打包。

兩張正式差分均有 alpha，WebP 保留透明、調整為對應原圖 canvas 尺寸，讓現有排版尺寸一致；未覆寫原圖。這不是逐像素局部修圖，細微髮絲／服裝仍可能有生成差異，需作者看圖校準。

第二章指定對白：hillside 0033／0036；paper-road 0233／0238／0242／0251／0253。每段以 `portraitExpression` 指定，僅覆蓋該段說話者；下段沒有設定即回原舞台表情。分頁繼承同一段表情，不繼承一次性音效。CG 和旁白隱藏立繪的既有規則保留。

## SE

將 `01se` 的 8 款非人聲原檔複製至 `public/assets/audio/se/se-<action>.mp3`，沒有覆寫／改動舊專案素材；來源與 SHA-256 見 `../se-import-2026-11-05.json`。其餘人聲、長環境檔不自動套用。音效按檔名用途及時長初選，未完成逐款聽感審定；設定頁提供全部 8 款試聽供校準。

已套用：第一章開門、列車傾側碰撞、魔法擊中、石門啟動及白光；第二章旅舍開門、攤開地圖紙張。腳步、翻頁、放下物件已登記備用，沒有為了用音效改寫正文。

段落頂層 `"se":"door-open"`；不要放 `stage`，避免重播。音效在正常前進到該頁時播一次；後續分頁、讀檔、章節跳轉、快進不觸發。返回首頁或快進會停止正在播放的 SE。設定內 SE 音量獨立保存，0% 靜音，試聽會先停止上一個試聽。

## 第二批幻想版差分

依前次使用者回饋，保留山田寬眼白與細圓瞳，不使用瞇眼面紅大笑。沿用已查閱的官方人物／作者研究與成年二創設定，本批未聲稱重新逐格核對原作。

使用 **built-in image_gen**，每款獨立以作者原圖編輯；完整 prompts 與生成來源見 `expression-stage-2-prompts.json`。

| 原始 PNG（位於 `../../../01char/01pic/`） | runtime（位於 `../../public/assets/characters/`） | expression ID | 套用 |
| --- | --- | --- | --- |
| kentaro-hero-happy.png | kentaro-hero-happy.webp | happy | 第二章 estrala/author-0104「人還挺好的。」 |
| kentaro-hero-surprised.png | kentaro-hero-surprised.webp | surprised | 第二章 estrala/author-0117「真的嗎？」 |
| natsumi-witch-amused.png | natsumi-witch-amused.webp | amused | 登記備用，現有幻想對白沒有適合的忍笑位置，不硬套 |
| natsumi-witch-puzzled.png | natsumi-witch-puzzled.webp | puzzled | 第二章 paper-road/author-0196「要畫地圖嗎？」、author-0201「我們從東邊的山坡下來，對吧？」 |

已檢查四張 alpha 並轉為 lossless WebP，runtime canvas 尺寸與各自原圖一致，原立繪沒有覆寫。生成仍可能帶來細微髮絲、服飾與魔法光點變化；不宣稱非臉部分逐像素相同。只修改表情資料，沒有改寫台詞或加入新事件。

四款對照：`expression-stage-2-overview.jpg`。遊戲實測：`expression-stage-2-game-preview.png`，第二章紙上的路「要畫地圖嗎？」顯示 witch/puzzled；下一段回原舞台設定。92 項既有測試、build 通過，96 個素材引用有效；未推送或部署。
