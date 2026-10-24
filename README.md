# PokeSurvivorTool

Bot tự chơi cho [pokesurvivor.com](https://pokesurvivor.com), chạy dưới dạng Chrome extension: tự di chuyển, né, nhặt đồ, chọn skill khi lên cấp theo moveset bạn đặt, tự dùng vật phẩm và tự vào ván mới.

## Cài đặt

1. Tải code về, một trong hai cách:
   - `git clone https://github.com/damhieu2808/PokeSurvivorTool.git`
   - hoặc trên GitHub bấm **Code → Download ZIP** rồi giải nén.
2. Mở Chrome (hoặc Edge, Brave…), vào `chrome://extensions`.
3. Bật **Developer mode** (góc phải trên).
4. Bấm **Load unpacked** và chọn thư mục `PokeSurvivorTool` vừa tải (thư mục có file `manifest.json`).
5. Mở [pokesurvivor.com](https://pokesurvivor.com). Bảng **PokeSurvivor Bot** hiện ở góc phải trên là đã chạy.

**Cập nhật bản mới:** `git pull` (hoặc tải lại ZIP), rồi vào `chrome://extensions` bấm **↻ Reload** ở extension và tải lại trang game.

## Sử dụng

### Bảng điều khiển (góc phải trên)

| Nút | Ý nghĩa |
|---|---|
| **Số ván** | Số ván muốn chơi, `0` = chơi mãi |
| **▶ Chạy** | Bắt đầu, đếm lại từ ván 1 |
| **⏸ Tạm dừng / ▶ Tiếp tục** | Bot buông tay cho bạn tự chơi, nhớ đang ở ván mấy để chạy tiếp |
| **■ Dừng** | Huỷ đợt chạy và xoá bộ đếm ván |
| **⚔ Moveset** | Mở bảng chọn moveset (xem dưới) |

Dòng vàng `farm: … xu · … trận · … xu/giờ` thống kê số xu kiếm được qua các ván.

### Moveset

Bấm **⚔ Moveset**, gõ tên pokémon (hoặc bấm **Hiện tại** khi đang trong trận), chọn tối đa 4 move theo thứ tự ưu tiên rồi bấm **Lưu**. Mỗi ô chỉ hiện các move mà con đó học được; ★ là move ban đầu. Khi lên cấp, bot ưu tiên lấy và nâng cấp các move này, tránh move ngoài build.

### Phím tắt

| Phím | Chức năng |
|---|---|
| **F6** | Danh mục mọi vật thể trên màn, gắn nhãn bằng nút bấm; có nút **Xuất data.js** |
| **F7** | Chế độ gắn nhãn bằng click: click vật thể rồi bấm `1` tốt · `2` nguy hiểm · `3` rift · `4` vật cản · `5` buff · `6` kinh nghiệm · `7` vali · `0` xoá |
| **F8** | Bật / tắt bot |
| **F9** | Bật / tắt lớp vẽ debug |

Nhãn cho bot biết vật nào nên nhặt, vật nào phải né.

### Tự động khác

- Bấm `5` `6` `7` `8` liên tục để dùng vật phẩm tiêu hao có trong ô.
- Spam `E` để luân phiên skill, tận dụng hồi chiêu của tất cả move.
- Chọn held item theo điểm; **Choice Band** chỉ lấy khi không còn lựa chọn khác.
- Hết ván tự bấm chơi lại cho tới khi đủ số ván.

## Chia sẻ nhãn và moveset (`data.js`)

Nhãn và moveset lưu trong trình duyệt. Để máy khác (hoặc người khác) có sẵn:

1. Bấm **F6 → Xuất data.js**: trình duyệt tải về file `data.js`.
2. Chép đè file đó vào thư mục extension, commit và push (hoặc gửi pull request).
3. Ai clone / pull bản mới sẽ có luôn nhãn và moveset đó.

Thứ tự ưu tiên khi tải: mặc định trong code < `data.js` < dữ liệu đã lưu trên trình duyệt đó.

## Lệnh console (F12 → Console)

| Lệnh | Tác dụng |
|---|---|
| `PSBot.play(5)` | Chạy 5 ván (0 = vô hạn) |
| `PSBot.setBuild('Kartana', ['Vine Whip', 'Quick Attack', 'Harden', 'Swords Dance'])` | Đặt moveset bằng lệnh (`[]` = xoá) |
| `PSBot.exportConfig()` | Như nút Xuất data.js |
| `PSBot.tags()` | Xem nhãn đã gắn |
| `PSFarm.stats()` / `PSFarm.reset()` | Xem / xoá thống kê xu |
| `PSBot.CFG.<tên> = …` | Chỉnh tạm cấu hình, ví dụ `PSBot.CFG.swapSkills = false`, `PSBot.CFG.useItems = false` |

Toàn bộ cấu hình kèm chú thích nằm ở đầu [bot.js](bot.js) (`CFG`).

## Cập nhật danh sách move

`moves.js` chứa danh sách move học được của 966 pokémon, lấy từ [pokesurvivor.wiki](https://pokesurvivor.wiki/pokedex). Khi game thêm pokémon / move, cần [Node.js](https://nodejs.org) 18+ rồi chạy:

```
node crawl-moves.js
```

(mất khoảng 1–2 phút), sau đó Reload extension.

## Lưu ý

- Khi bot đang được nạp, các lượt ghi điểm lên bảng xếp hạng bị chặn, nên kết quả các ván đó không lên leaderboard. Muốn chơi bình thường, tắt extension trong `chrome://extensions` rồi tải lại trang.
- Bot đọc màn hình game; khi game cập nhật giao diện có thể cần chỉnh lại nhãn (F6/F7) hoặc code.

## Cấu trúc thư mục

| File | Nội dung |
|---|---|
| `manifest.json` | Khai báo Chrome extension |
| `bot.js` | Bot chính: điều khiển, chọn skill/đồ, bảng điều khiển, F6/F7 |
| `farmMoney.js` | Preset farm xu và thống kê |
| `data.js` | Nhãn + moveset dùng chung (xuất từ F6) |
| `moves.js` | Danh sách move của từng pokémon (sinh bởi `crawl-moves.js`) |
| `crawl-moves.js` | Script tải lại `moves.js` từ wiki |
| `icons/` | Icon extension |
