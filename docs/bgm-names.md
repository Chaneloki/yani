# BGM 素材命名

按提供的風格介紹命名，使用 `bgm-<mood-or-style>.mp3`，不綁定角色或單一場景。原音檔僅改名，不改音訊內容。

| 舊名 | 新名 | 顯示名稱 |
| --- | --- | --- |
| R_daily.mp3 | `bgm-warm-daily-life.mp3` | 溫暖日常 |
| R_holiday.mp3 | `bgm-cheerful-school-days.mp3` | 輕快校園 |
| R_yamada_intern.mp3 | `bgm-upbeat-everyday.mp3` | 活力日常 |
| R_cafe.mp3 | `bgm-cozy-cafe-jazz.mp3` | 悠閒爵士 |
| R_normal_date.mp3 | `bgm-heartwarming-romance.mp3` | 溫柔時光 |
| R_funny.mp3 | `bgm-playful-comedy.mp3` | 俏皮插曲 |
| R_night_message.mp3 | `bgm-peaceful-night.mp3` | 靜謐夜色 |
| R_wait_sat.mp3 | `bgm-happy-anticipation.mp3` | 雀躍期待 |

部署副本位於 `../03yani-foundation/public/assets/audio/bgm/`；SE 另放 `audio/se/`。
故事以穩定 ID 選曲，可於不同章節重用。類型與樂器描述依作者提供的介紹整理，未聲稱經音訊分析判定。


第一章新增：`alex-morgan-fantasy-adventure-quest-537478.mp3` → `bgm-epic-fantasy-adventure.mp3`，資產 ID `epic-fantasy-adventure`（史詩冒險）。原檔名及作者線索保留在 assets.json。列車遇襲 `chapter01.skyrail/author-0097` 開始，警報停止 `author-0201` 切回溫暖日常。首頁、重逢及慶典不使用這首。

列車開場新增：`grand_project-toward-the-dream-uplifting-orchestral-adventure-full-2m52s-628698.mp3` → `bgm-uplifting-orchestral-adventure.mp3`，資產 ID `uplifting-orchestral-adventure`（昂揚啟程）。依原檔名的 uplifting orchestral adventure 風格命名，未改音訊內容。從「列車的汽笛聲從山谷深處傳來。」開始循環，直至 `chapter01.skyrail/author-0097` 魔物襲擊時切換 `epic-fantasy-adventure`；後續切換點不變。

穿越過程新增：`1.紧张上升音势.mp3` → `bgm-rising-tension.mp3`（緊張升勢），資產 ID `rising-tension`。從 `chapter01.gate/author-0376` 石門光芒擴散開始，直到 `chapter01.new-world` 在山坡醒來，切回既有 `warm-daily-life`。原音訊內容不變。

星鯨段落新增：`“既然躲不过这场雨，干脆就翩翩起舞吧” ｜《雨中舞》.mp3` → `bgm-dance-in-the-rain.mp3`（雨中舞），資產 ID `dance-in-the-rain`，依原標題命名，可於其他章節重用。從 `chapter01.festival/author-0301`「星鯨正從城鎮上方游過。」與靜態 CG 一起開始循環；持續至祭典段落結束，下一場 `chapter01.gate/author-0352` 星鯨離開後切回既有 `peaceful-night`。原音訊內容不變。


## 2026-11-05 CG／配樂更新

| 原檔名 | 新檔名／部署檔 |
| --- | --- |
| `cg-saturday-reunion-hug.png` | `public/assets/cg/cg-saturday-reunion-hug.webp` |
| `cg-starlight-festival-whale.png` | `public/assets/cg/cg-starlight-festival-whale.webp` |
| `異世界初見：星輝山丘上的牽手.png` | `cg-estrala-hillside-handhold.png` |
| `月光下的星辰地图戀歌.png` | `cg-estrala-inn-moonlit-map.png` |
| `《阴阳师》因幡辉夜姬角色印象曲 · 辉夜与月 p01 辉夜与月 · 映心.mp3` | `bgm-kaguya-moon-reflection.mp3` |
| `Garbage - The World Is Not Enough | Adelina Piano synthesia tutorial - (320 Kbps).mp3` | `bgm-the-world-is-not-enough-piano.mp3` |

第一章重逢擁抱、星燈之夜已由更新 PNG 重新輸出無損 WebP。第二章山路牽手於 `chapter02.hillside/author-0040` 開始，配《輝夜與月・映心》，直至進村恢復原有配樂；旅舍靠肩 CG 於 `chapter02.paper-road/author-0272` 開始，配 The World Is Not Enough 鋼琴版，持續至章末。兩張沿用緩慢推近鏡頭；原音檔僅改名，不改內容。
