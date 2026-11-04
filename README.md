# PokeSurvivor Bot

**Tiếng Việt** · [English](README.en.md)

Bot tự chơi [pokesurvivor.com](https://pokesurvivor.com/), [pokesurvivor.doofcraft.com](https://pokesurvivor.doofcraft.com/) và [PokéLit](https://pokelit.0d4y.cc/) (tự nhận bản game theo trang). Có phí, giá rẻ ([cách mua](#mua-mã-kích-hoạt)) · tác giả [damhieu2808](https://github.com/damhieu2808)

> **Bản 3.0.0:** thêm PokéLit. Chỉ cần cập nhật nếu bạn chơi PokéLit; pokesurvivor.com / Doofcraft không đổi gì, không cần cập nhật.

## Cài trên máy tính (Chrome)

1. [**Tải bot (ZIP)**](https://github.com/damhieu2808/PokeSurvivorTool/archive/refs/heads/main.zip). Link này luôn tải bản mới nhất.
2. Giải nén, mở `chrome://extensions`, bật **Developer mode**.
3. Bấm **Load unpacked**, chọn thư mục vừa giải nén.

## Cài trên điện thoại (Android)

> ℹ️ Toàn bộ bot nằm sẵn trong file userscript. Trình quản lý userscript tự chạy code đó trong trang, nên việc pokesurvivor.com chặn script chèn vào trang (CSP) không còn ảnh hưởng. Khuyên dùng **Kiwi Browser** (có [video hướng dẫn trên TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat)); Firefox cũng được.

1. Cài trình duyệt: **Kiwi Browser** (khuyên dùng) hoặc **Firefox** (CH Play).
2. Cài trình quản lý userscript:
   - Kiwi: cài **Tampermonkey** từ Chrome Web Store (menu ⋮ → Extensions), làm theo video TikTok ở trên.
   - Firefox: cài tiện ích **Violentmonkey** hoặc **Tampermonkey** (menu ⋮ → Tiện ích / Add-ons).
3. Bấm nút copy ở góc khối dưới đây, dán vào **thanh địa chỉ** của trình duyệt đó rồi mở:

```
https://raw.githubusercontent.com/damhieu2808/PokeSurvivorTool/v3.0.1/psbot.user.js
```

4. Trình quản lý tự mở trang cài script → bấm **Install** (Cài đặt). Đã cài bản cũ thì cài đè lên.
5. Vào game: panel **PokeSurvivor Bot** hiện ở góc trên bên trái.

Trình quản lý tự kiểm tra bản mới định kỳ. Muốn cập nhật ngay: mở trình quản lý → **Check for updates** (Kiểm tra cập nhật), hoặc mở lại link ở bước 3.

## Cài trên iPhone / iPad

Có 3 cách, chọn 1:

**Cách 1: app GEAR.** Cài **Gear Browser** (App Store). Video hướng dẫn trên [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat).

**Cách 2: trình duyệt Orion.** Cài **Orion Browser** (App Store), trong Orion cài tiện ích **Tampermonkey** hoặc **Violentmonkey**, rồi dán link ở bước 3 phần Android vào thanh địa chỉ, mở và bấm **Install** (Cài đặt).

**Cách 3: Userscripts trên Safari.**

1. Cài app **Userscripts** (App Store, miễn phí).
2. Vào **Cài đặt (Settings) của iPhone / iPad** → cuộn xuống chọn **Safari** → **Phần mở rộng (Extensions)** → bật **Userscripts** và chọn *Cho phép trên mọi trang web*.
3. Mở Safari, bấm biểu tượng tiện ích **Userscripts** → **+ (Thêm script mới)** → dán link ở bước 3 phần Android vào rồi lưu lại.

Vào game: panel hiện ở góc trên bên trái. Nếu lỗi, báo qua liên hệ bên dưới.

## Mua mã kích hoạt

Bot cần **mã kích hoạt** còn hạn để chạy. Panel, Moveset, Level-up, Item vẫn mở được khi chưa có mã.

| Gói | Giá |
|---|---|
| 10 ngày | 30k |
| 30 ngày | 70k |
| 90 ngày | 180k |
| Vĩnh viễn | 350k |

Gói vĩnh viễn: 1 máy, dùng tới khi tool còn hoạt động.

⚠ Hạn dùng tính tới khi game chưa chặn tool. Nếu game chặn, mình sẽ tìm mọi cách cho tool chạy lại; thử hết cách vẫn không được thì bot sẽ dừng lại và không hoàn tiền.

**Dùng thử miễn phí 2 giờ:** nhắn [Zalo 0355011166](https://zalo.me/0355011166) mã máy của bạn (bước 1 bên dưới). Cần bot từ bản 2.0.7.

1. Cài bot, vào game. Panel hiện **🔒 Cần mã kích hoạt** và **mã máy** (dạng `ABCD-1234`), bấm **Copy**.
2. Nhắn [Zalo 0355011166 (Đàm Xuân Hiếu)](https://zalo.me/0355011166) hoặc [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat) gói muốn mua + mã máy.
3. Chuyển khoản theo thông tin được gửi qua tin nhắn, rồi gửi ảnh chuyển khoản.
4. Nhận mã (bắt đầu bằng `PSB1.`), dán vào ô trên panel → **Nhập** → **▶ Chạy**.

- Gia hạn trước khi hết hạn: ngày mới được cộng nối tiếp, không mất ngày. Bấm **Gia hạn** trên panel để nhập mã mới.
- Mỗi trình duyệt và mỗi trang game (pokesurvivor.com / doofcraft / PokéLit) có mã máy riêng. Chơi nhiều trang thì gửi mã máy của từng trang, tác giả làm 1 mã dùng chung.
- Xoá dữ liệu trình duyệt (cookie / dữ liệu trang) sẽ đổi mã máy: nhắn tác giả để được cấp lại, không mất ngày.
- Game cập nhật làm bot hỏng: tác giả sẽ tìm mọi cách cho bot chạy lại; thử hết cách vẫn không được thì bot sẽ dừng lại và không hoàn tiền.

## Cập nhật

- **Máy tính:** khi panel hiện dòng vàng "⬆ Có bản mới", tải lại ZIP ở bước 1 rồi giải nén đè lên thư mục cũ.
- **Điện thoại:** trình quản lý userscript tự cập nhật định kỳ (hoặc bấm **Check for updates**).
- **PokéLit:** trang này không cho bot kiểm tra bản mới, nên không có dòng "⬆ Có bản mới": xem bản mới ở pokesurvivor.com / doofcraft hoặc trang Releases.

**Lưu ý PokéLit:** game có chống gian lận, ván nào bị sửa hàm hẹn giờ thì không nhận thưởng. Vì vậy trên PokéLit bot **không chạy nền**: để cửa sổ game hiện trên màn hình (cửa sổ khác che một phần vẫn được); thu nhỏ, chuyển tab khác hoặc để cửa sổ khác che kín thì Chrome dừng vẽ và game đứng. Nếu bật **Auto level / Auto item** trong game (hoặc Quick level-ups / Auto bond), bot tự nhường và ẩn tab tương ứng; Moveset vẫn hiện khi Auto bond tắt vì nó dùng để xếp thứ tự bond.

Cần cài hộ: liên hệ [Zalo 0355011166](https://zalo.me/0355011166) hoặc [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat) · [Giấy phép](LICENSE)

## Cảm ơn

Bot có dùng mã nguồn mở (giấy phép MIT) của các tác giả sau, chi tiết trong [LICENSE](LICENSE). Cảm ơn các bạn đã chia sẻ:

- [BoundlessEgret · pokesurvivor-autofarm](https://github.com/BoundlessEgret/pokesurvivor-autofarm)
- [aparmor2 · pokesurvivor-mod](https://github.com/aparmor2/pokesurvivor-mod)
- [readygolol · PokéSurvivor Trash Time Helper](https://greasyfork.org/scripts/600408)
