# PokeSurvivorTool

Tác giả: **[damhieu2808](https://github.com/damhieu2808)** · Repo gốc: https://github.com/damhieu2808/PokeSurvivorTool

Bot tự chơi cho [pokesurvivor.com](https://pokesurvivor.com), chạy dưới dạng Chrome extension: tự di chuyển, né, nhặt đồ, chọn skill khi lên cấp theo moveset bạn đặt, tự dùng vật phẩm và tự vào ván mới.

**👉 Trang cài đặt (điện thoại + máy tính, có nút cài 1 chạm): https://damhieu2808.github.io/PokeSurvivorTool/**

## Cài đặt

1. Tải code về, một trong hai cách:
   - `git clone https://github.com/damhieu2808/PokeSurvivorTool.git`
   - hoặc trên GitHub bấm **Code → Download ZIP** rồi giải nén.
2. Mở Chrome (hoặc Edge, Brave…), vào `chrome://extensions`.
3. Bật **Developer mode** (góc phải trên).
4. Bấm **Load unpacked** và chọn thư mục `PokeSurvivorTool` vừa tải (thư mục có file `manifest.json`).
5. Mở [pokesurvivor.com](https://pokesurvivor.com). Bảng **PokeSurvivor Bot** hiện ở góc phải trên là đã chạy.

**Cập nhật bản mới:** khi có bản mới, bảng điều khiển hiện dòng vàng **⬆ Có bản mới …** (bot tự kiểm tra repo gốc lúc khởi động và mỗi 6 giờ). Khi đó `git pull` (hoặc tải lại ZIP), rồi vào `chrome://extensions` bấm **↻ Reload** ở extension và tải lại trang game. Phiên bản đang dùng hiện ở tiêu đề bảng điều khiển.

## Dùng trên điện thoại (Android / iOS)

Dễ nhất: mở **[trang cài đặt](https://damhieu2808.github.io/PokeSurvivorTool/)** trên điện thoại và làm theo. Có hai cách:

- **Userscript (tự chạy, khuyên dùng):** iOS cài app **Userscripts** (Safari), Android dùng **Firefox + Tampermonkey**, rồi bấm nút *Cài bot* trên trang cài đặt để cài [`psbot.user.js`](psbot.user.js). Từ đó cứ mở pokesurvivor.com là bot tự chạy.
- **Bookmarklet (không cần cài gì):** làm như dưới đây; trang cài đặt có nút *Copy code* 1 chạm.

### Bookmarklet

Trình duyệt điện thoại không cài được Chrome extension, nên có thể dùng **bookmarklet**: một dấu trang chứa đoạn code, bấm vào là bot được tải thẳng từ repo này (luôn là bản mới nhất) và chạy trên trang game.

**Tạo dấu trang (làm 1 lần):**

1. Copy nguyên dòng dưới đây:

   ```
   javascript:(()=>{fetch('https://raw.githubusercontent.com/damhieu2808/PokeSurvivorTool/main/loader.js?t='+Date.now()).then(r=>r.text()).then(t=>{const s=document.createElement('script');s.textContent=t;document.body.append(s)}).catch(e=>alert('PSBot: '+e))})()
   ```

2. Tạo một dấu trang bất kỳ (ví dụ đánh dấu chính trang này), rồi **sửa** dấu trang đó:
   - **Tên:** `PokeSurvivor Bot`
   - **URL / địa chỉ:** xoá hết, dán dòng vừa copy.
   - iOS Safari: biểu tượng Chia sẻ → *Thêm dấu trang*, sau đó vào Dấu trang → *Sửa*.
   - Chrome Android: ⋮ → ☆, rồi ⋮ → *Dấu trang* → giữ dấu trang → *Chỉnh sửa*.

**Mỗi lần chơi:** mở [pokesurvivor.com](https://pokesurvivor.com), rồi
- iOS Safari: mở Dấu trang và bấm **PokeSurvivor Bot**;
- Chrome Android: gõ `PokeSurvivor Bot` lên thanh địa chỉ và chọn dòng dấu trang hiện ra (bấm từ danh sách dấu trang không chạy được trên Chrome Android).

Bảng điều khiển hiện ở góc phải trên. Tải lại trang thì phải bấm dấu trang lại. Nút **–** trên tiêu đề thu gọn bảng cho đỡ che màn hình; **Overlay** và **Danh mục** thay cho F9 / F6.

> Trên PC cũng dùng được bookmarklet này (thay cho extension), bấm trên thanh dấu trang.

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

Trên điện thoại không có phím F: dùng nút **Overlay** (F9), **Danh mục** (F6) và **▶ Chạy / ⏸ Tạm dừng** (F8) trên bảng; nút **–** thu gọn bảng.

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

## Phát hành bản mới (dành cho tác giả)

Tăng số phiên bản ở **cả hai** chỗ, giống nhau: `"version"` trong `manifest.json` và `VERSION` ở đầu `bot.js`, rồi commit + push lên `main`. Mọi người đang dùng bản cũ sẽ thấy thông báo cập nhật trong vòng vài phút đến vài giờ.

## Cập nhật danh sách move

`moves.js` chứa danh sách move học được của 966 pokémon, lấy từ [pokesurvivor.wiki](https://pokesurvivor.wiki/pokedex). Khi game thêm pokémon / move, cần [Node.js](https://nodejs.org) 18+ rồi chạy:

```
node crawl-moves.js
```

(mất khoảng 1–2 phút), sau đó Reload extension.

## Lưu ý

- Khi bot đang được nạp, các lượt ghi điểm lên bảng xếp hạng bị chặn, nên kết quả các ván đó không lên leaderboard. Muốn chơi bình thường, tắt extension trong `chrome://extensions` rồi tải lại trang.
- Bot đọc màn hình game; khi game cập nhật giao diện có thể cần chỉnh lại nhãn (F6/F7) hoặc code.

## Ghi công

Tool do **damhieu2808** viết, phát hành theo giấy phép [MIT](LICENSE): bạn được dùng, chỉnh sửa và chia sẻ lại tự do, **với điều kiện giữ nguyên dòng bản quyền (tên tác giả) và nội dung giấy phép** trong mọi bản sao hay bản đã sửa. Xin để kèm link về repo gốc: https://github.com/damhieu2808/PokeSurvivorTool

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
| `loader.js` | Nạp bot từ GitHub cho bookmarklet / userscript (điện thoại) |
| `psbot.user.js` | Userscript cài 1 lần (Tampermonkey / Userscripts), tự gọi `loader.js` |
| `docs/index.html` | Trang cài đặt (GitHub Pages) |
