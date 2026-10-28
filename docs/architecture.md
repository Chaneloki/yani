# Architecture decisions

1. **Vanilla ES Modules / buildless runtime**：與先前 web 遊戲一致。Node 僅負責工具，日後靜態部署容易；沒有 UI 框架或外部執行期相依。
2. **JSON content / no executable story actions**：章節、角色、資產資料與引擎分離。取代過往部分內容中的 `eval(line.action)`，以可驗證的資料描述場景。
3. **Stable scene + node IDs**：存檔指向作者命名的語意 ID，不使用小數章節編號或陣列索引作永久游標。
4. **Pure engine / reconstructed stage**：engine 不讀 DOM 或 localStorage。每場景有完整初始舞台；場內疊加 stage patch，到目前節點即可還原。複雜度隨單場景長度線性成長；建議合理拆場景，不先做事件溯源或大型狀態機框架。
5. **Versioned saves**：明確 schema 和內容版本，讀取前驗證，不相容時保留舊檔。未建立推測性的 migration；正式發布後按實際資料變更新增。
6. **Perspective is scene metadata**：內心獨白是獨立 node type，共同 timeline label 表示重疊時間。未強制把兩條線的節點一對一綁定。
7. **Assets referenced by ID**：劇情不直接寫圖片路徑，角色含版本與表情表。美術可獨立替換。
8. **Future RPG boundary**：若實作探索，新增獨立 exploration 模組，讓互動結果回傳穩定 sceneId 或明確旗標；以新的版本化狀態欄位儲存位置／任務。維持共用角色與素材 ID，不把移動迴圈放進 VN 的 advance。尚未建立空殼 inventory、combat 或 multiplayer 類別。

UI 現階段集中於 `src/main.js`，規模小、沒有通用 UI framework。當存檔面板、設定或探索介面開始增長時，再分離具體 panel 模組。新增故事不需修改 UI／engine。

## 視覺修訂（2026-10-28）

使用者要求改為參考 v2。介面依其 story-stage 的全螢幕劇場、底部黑色漸層、無外框白色大字、綠色左邊線姓名及右上角金邊齒輪設計重寫。系統面板使用深藍底與金色標題。沒有下載或搬用 v2 的角色、背景或 CG；空缺素材以深色環境和通用人形佔位。
