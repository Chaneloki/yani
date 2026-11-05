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


第一章新增：`alex-morgan-fantasy-adventure-quest-537478.mp3` → `bgm-epic-fantasy-adventure.mp3`，資產 ID `epic-fantasy-adventure`（史詩冒險）。原檔名及作者線索保留在 assets.json。列車遇襲 `chapter01.skyrail/beat-028` 開始，離開山谷 `beat-096` 切回溫暖日常。首頁、重逢及慶典不使用這首。
