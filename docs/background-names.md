# 背景圖命名與使用

原始 PNG 以 `bg-地點-時段.png` 命名，全部使用小寫英文、數字與連字號；不使用空格或特殊字元。

| 原名稱 | 新名稱 |
| --- | --- |
| 夕陽下的寧靜校園小徑.png | `bg-campus-sunset.png` |
| 夕陽下的寧靜空教室.png | `bg-classroom-sunset.png` |
| 夜色窗邊的溫馨書房_yamada.png | `bg-kentaro-room-night.png` |
| 明亮動漫風汽車維修車房.png | `bg-automotive-workshop-day.png` |
| 暖陽下的溫馨遊戲零食房_yamada.png | `bg-kentaro-gaming-room-day.png` |
| 月光下的寧靜臥室_nishi.png | `bg-natsumi-bedroom-moonlight.png` |
| 溫馨夜色現代臥室插畫_nishi.png | `bg-natsumi-bedroom-night.png` |
| 陽光下的日式榻榻米書房_yamada.png | `bg-kentaro-room-day.png` |
| 陽光灑落的暖心咖啡館.png | `bg-cafe-afternoon.png` |
| 黃昏拉麵店的溫暖一隅.png | `bg-ramen-shop-evening.png` |
| 黃昏時分的現代車站大堂.png | `bg-station-sunset.png` |

原圖僅重新命名，沒有更改像素。對照表及 SHA-256 存於 `../03yani-foundation/docs/background-import.json`。
網頁版在 `../03yani-foundation/public/assets/backgrounds/`，使用同名 `.webp`，為像素一致的 lossless WebP。
新增圖沿用 `bg-<location>-<time-or-state>`，例如 `bg-kentaro-gaming-room-night`；不要依賴檔案排序編號。
