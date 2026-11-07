# 支線 06｜走不到的北路

2026-11-06：已接入必經道路調查。原稿保存於 `../manuscripts/side-quest-06-north-road-user.txt`，三個角色版本分開儲存在 `src/content/quests/unreachable-north-road.json`，沒有改寫原稿對白。每頁沿用共用句子分頁與 VN 閱讀器。

## 流程與入口

完成第一份工錢 → 村中廣場全螢幕委託板接取 → 北方舊道路 → 原稿旅途 → 安全位置觀察路標、斷橋、下游（次序自由、沒有倒數）→ 原稿反思及回程 → 地圖前後對照，保留對岸道路、標記橋斷開 → 沿原路回旅舍 → 回報多恩 → 對應版本的旅舍夜晚 → 一次性結算。

可用「遊戲選單 → 支線捷徑 → 06」獨立測試山田、西及雙人版本。捷徑不放封面，存檔與正式故事分開。

山田單人、西單人及雙人皆可完成。不要求草藥、孩子或卡爾人物支線。山田有結構判讀時，只補充橋體承重判讀，不影響成功條件。

## 狀態與主線

`northRoad` 保存版本、階段、頁碼、已觀察點、地圖更新、回報狀態；途中退出後可繼續。不能跳過三項觀察、更新地圖或回報直接領取獎勵。

成功後 `mainline.northRoadConfirmed = true`，情報筆記與村莊地圖保留斷橋標記。「主線準備」的北路條件勾選；不會設定 `orenVerifiedRoute`，也不會自動開第三章。

奧倫的後續主線正文仍需作者提供，本次只開放其調查方向，不自行編造人物事件。

## 待定數值與時序

調查報酬先用可調整測試值 **20 金幣**，在 `world.json` 的任務 `coins` 欄位。只有完成一次性結算才入帳，不會重複領取。沿用現有委託一時段結算規則，旅舍夜晚是該委託的敘事尾聲，不另外扣時段。若後續要與實際晚上才觸發的日程分開，需另作全村事件排程。

## 圖像

`public/assets/backgrounds/bg-estrala-north-broken-bridge-day.png`：使用內建 imagegen 補製的無人物斷橋河谷背景。程式原生 SVG 僅用於地圖前後對照。原有角色立繪不變。

生成 prompt：

> Use case: illustration-story. Asset type: original fantasy visual novel landscape background, wide 16:9, no characters. Primary request: an old stone bridge with its entire central span collapsed, viewed from a safe flat elevated hillside path; only the two substantial bridge abutments remain on opposite steep riverbanks. A fast flowing river runs below through a forested valley. On the far bank the old paved road continues north uphill into trees. In near foreground left there is an aged wooden directional signpost and a smaller newer warning board, both with indistinct marks only, no legible text. Show a flat safe observation path on upper near bank, far from dangerous eroded slope. Composition clearly separates old signpost lower left, broken bridge middle, river and downstream valley right. Art: polished hand painted Japanese fantasy RPG background, detailed natural foliage, sunlit stonework, gentle afternoon light, muted lush green and warm earth palette, atmospheric distance, consistent elegant anime environment illustration, richly painted not pixel art or flat vector. Constraints: bridge really cannot be crossed, no bridge decking or footbridge across gap, no people, no magical portal, no buildings, no UI or text or watermark.

## 驗證

181 個 Node 測試通過；包括四個控制／同行組合、無技能可完成、觀察順序、存讀恢復、防止重領、放棄不推主線、原稿完整性。瀏覽器完成雙人整條流程並確認 20 金幣、北路地圖標記。
