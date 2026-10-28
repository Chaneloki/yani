# 既有 GitHub 專案檢視

檢視日期：2026-10-28。透過已連接的 GitHub plugin 列出 7 個可存取 repositories，閱讀預設分支目錄樹與相關原始碼。這是針對新 VN 架構的靜態檢視，沒有執行或完整通關舊遊戲，也沒有修改、clone 大型素材庫或驗證線上部署。

可見專案：`Chaneloki/v2`、`hklife`、`excel_s2`、`excel`、`YouOweMe`、`yani`、`note`。`yani` 和 `note` 回報 size 0，未視為既有遊戲。`YouOweMe` 根目錄為單頁應用及音效／帳務相關檔案，本次未深入其非敘事功能。

| 專案 | 已確認技術與實作 | 值得沿用 | 新專案改善 |
| --- | --- | --- | --- |
| [v2](https://github.com/Chaneloki/v2) | HTML/CSS/JS、window.V2_CHAPTERS、逐章 JS 資料；UIManager prototype、Orchestrator；劇場與 DOM RPG 移動／碰撞／POI；localStorage 自動／手動槽；章節回顧 | 逐章內容、背景／BGM／表情描述、預載、讀檔還原舞台、RPG 獨立資料夾、頁內確認維持全螢幕 | 劇情含 `action` JavaScript 字串且 UI 呼叫 `eval(line.action)`；全域 window 與 DOM 耦合；章節編號轉換表重複；目前行號依賴陣列位置。改用穩定 ID、純資料及小型引擎 |
| [excel](https://github.com/Chaneloki/excel) | HTML/CSS/JS；chapter/、action/、code/ 分開；Orchestrator 透過事件派發 story／simulator；localStorage 單一 `magic_excel_v2_save` | 內容／操作／核心概念分離，劇情與互動階段可串接 | Orchestrator 含大量章節專屬檢核與 DOM 操作；新專案不搬入 Excel 規則與大型總控 |
| [hklife](https://github.com/Chaneloki/hklife) | 原生 ES Modules；state／engine／storage／ui／main 分層；data/ 定義條件、效果、訊息、關係與 authored 內容；localStorage 整體 state、dataVersion 檢查 | 最適合作為新專案的分層參考；內容 ID、資料驅動、獨立 storage、失敗處理 | 儲存版本不符拒讀，新 key 代表內容重置；新專案也明確拒絕不相容但保留原檔，並採專屬多槽。大量養成規則不適合直接搬入 VN |
| [excel_s2](https://github.com/Chaneloki/excel_s2) | Godot GDScript 原型；對話 UI／CG 模式／地圖／調查／save 模組；JSON case data；FileAccess JSON 多槽 | 素材按 characters／backgrounds／CG／UI 分類、CG 與一般對話區分、多槽摘要的設計方向 | GDScript 與 Godot FileAccess 不可直接在純 web 模組重用；不為目前 VN 引入 Godot runtime。讀取 JSON 為 Dictionary 尚不等於完整內容相容性驗證 |

## 閱讀證據與範圍

- v2：[README](https://github.com/Chaneloki/v2/blob/main/README.md)、[ch1](https://github.com/Chaneloki/v2/blob/main/chapter/ch1.js)、[story UI](https://github.com/Chaneloki/v2/blob/main/code/ui_v2_story.js)、[menu/save UI](https://github.com/Chaneloki/v2/blob/main/code/ui_v2_menus.js)、[RPG engine](https://github.com/Chaneloki/v2/blob/main/code/rpg/rpg_engine.js)、[CSS](https://github.com/Chaneloki/v2/blob/main/style.css)。story UI blob：`dbaa6ba13ad0525205dfc660c769122395ad9bff`。讀檔會向前掃描背景／BGM／視覺屬性；這直接啟發新引擎的舞台重建。舊專案特定結局清空資料屬其創作規則，本次完全不修改，也不沿用到新遊戲。
- excel：[Orchestrator](https://github.com/Chaneloki/excel/blob/main/code/orchestrator.js)、[CSS](https://github.com/Chaneloki/excel/blob/main/style.css)及目錄樹。Orchestrator blob：`bfe3ee003ab0663890d14138e4ca983dfa51bf94`。
- hklife：[README](https://github.com/Chaneloki/hklife/blob/main/README.md)、[storage](https://github.com/Chaneloki/hklife/blob/main/js/storage.js)、[state](https://github.com/Chaneloki/hklife/blob/main/js/state.js)、[storyScenes](https://github.com/Chaneloki/hklife/blob/main/data/storyScenes.js)、[CSS](https://github.com/Chaneloki/hklife/blob/main/css/style.css)。storyScenes 明確保留 sample 並排除正式內容，適合沿用「作者內容與示範分開」原則。README 說明一般靜態 server 可玩純前端，BYOK 聊天另需 serve.py relay；本次不需這項服務。
- excel_s2：[save](https://github.com/Chaneloki/excel_s2/blob/main/2godot_project/06_save_system.gd)、[dialogue/CG prototype](https://github.com/Chaneloki/excel_s2/blob/main/2godot_project/02_story_dialogue_ui_demo.gd)及 Godot／素材目錄樹。未執行 Godot 或驗證 export preset。

## 手機與部署

`v2` CSS 可見 1366／1023／768／480px media query 與 reduced-motion；`excel` 有 1366／1023／768px；兩者多處使用 100vh。`hklife` 使用窄版手機 App 風格，420px max-width 與 460px breakpoint。這表示過去已重視手機，但靜態 CSS 檢視不能證明所有互動或鍵盤在真機正常。新專案使用 dvh、可捲動長文字、至少 44px 操作區、窄螢幕選項直排，不強制橫向。

GitHub repository metadata：`v2`、`excel_s2` 為 has_pages=true；`excel`、`hklife` 為 false。列出的四個目錄樹未見 `.github/workflows`。這只能確認 Pages 設定旗標，不能推定現有公開 URL、成功部署狀態或 Godot 匯出流程；未宣稱已驗證。新專案產生靜態 dist，可手動發布至 Pages，沒有新增自動部署。

## 建議結論

沿用 hklife 的 ES Modules 分層、v2 的劇場／存讀檔體驗與 excel_s2 的素材分類。重建小型 JSON VN engine，不複製舊專案程式或素材；未直接重用元件，因此無需繼承其全域依賴或特殊玩法。未來 RPG 將共用角色／素材／旗標，以場景 ID 連回 VN。先完成正確的雙視角閱讀與存檔，再按作者決定加入探索系統。
