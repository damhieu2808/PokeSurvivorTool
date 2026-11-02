# PokeSurvivor Bot

**Tiếng Việt** · [English](README.en.md)

Bot tự chơi [pokesurvivor.com](https://pokesurvivor.com/) và [pokesurvivor.doofcraft.com](https://pokesurvivor.doofcraft.com/) (tự nhận bản game theo trang). Có phí, giá rẻ ([cách mua](#mua-mã-kích-hoạt)) · tác giả [damhieu2808](https://github.com/damhieu2808)

## Cài trên máy tính (Chrome)

1. [**Tải bot (ZIP)**](https://github.com/damhieu2808/PokeSurvivorTool/archive/refs/heads/main.zip). Link này luôn tải bản mới nhất.
2. Giải nén, mở `chrome://extensions`, bật **Developer mode**.
3. Bấm **Load unpacked**, chọn thư mục vừa giải nén.

## Cài trên điện thoại (Android)

> ℹ️ Toàn bộ bot nằm sẵn trong file userscript. Trình quản lý userscript tự chạy code đó trong trang, nên việc pokesurvivor.com chặn script chèn vào trang (CSP) không còn ảnh hưởng. Khuyên dùng **Firefox**. Edge / Kiwi + Tampermonkey trên Android từng không chạy được với bản cũ; với cách mới thì chưa thử lại.

1. Cài **Firefox** (CH Play).
2. Trong Firefox, cài tiện ích **Violentmonkey** hoặc **Tampermonkey** (menu ⋮ → Tiện ích / Add-ons).
3. Bấm nút copy ở góc khối dưới đây, dán vào **thanh địa chỉ** của trình duyệt đó rồi mở:

```
https://raw.githubusercontent.com/damhieu2808/PokeSurvivorTool/v2.2.9/psbot.user.js
```

4. Trình quản lý tự mở trang cài script → bấm **Install** (Cài đặt). Đã cài bản cũ thì cài đè lên.
5. Vào game: panel **PokeSurvivor Bot** hiện ở góc trên bên trái.

Trình quản lý tự kiểm tra bản mới định kỳ. Muốn cập nhật ngay: mở trình quản lý → **Check for updates** (Kiểm tra cập nhật), hoặc mở lại link ở bước 3.

## Cài trên iPhone / iPad

1. Cài app **Userscripts** (App Store, miễn phí).
2. Mở **Cài đặt → Safari → Tiện ích → Userscripts**: bật lên và cho phép trên mọi trang web.
3. Trong **Safari**, dán link ở bước 3 phần Android vào thanh địa chỉ rồi mở.
4. Bấm biểu tượng tiện ích (hình mảnh ghép hoặc **aA**) trên thanh địa chỉ → **Userscripts** → **Cài đặt** (Install).
5. Vào game trong Safari: panel hiện ở góc trên bên trái. iOS chưa thử; pokesurvivor.com có thể bị chặn như trên Android. Nếu lỗi, báo qua liên hệ bên dưới.

## Mua mã kích hoạt

Bot cần **mã kích hoạt** còn hạn để chạy. Panel, Moveset, Level-up, Item vẫn mở được khi chưa có mã.

| Gói | Giá |
|---|---|
| 10 ngày | 30k |
| 30 ngày | 70k |
| 90 ngày | 180k |
| Vĩnh viễn | 350k |

Gói vĩnh viễn: 1 máy, dùng tới khi tool còn hoạt động.

⚠ Hạn dùng tính tới khi game chưa chặn tool. Nếu game chặn, mình sẽ tìm mọi cách cho tool chạy lại; thử hết cách vẫn không được thì không hoàn tiền.

**Dùng thử miễn phí 2 giờ:** nhắn [Zalo 0355011166](https://zalo.me/0355011166) mã máy của bạn (bước 1 bên dưới). Cần bot từ bản 2.0.7.

1. Cài bot, vào game. Panel hiện **🔒 Cần mã kích hoạt** và **mã máy** (dạng `ABCD-1234`), bấm **Copy**.
2. Chuyển khoản (tab **💳 Mua mã** trên panel có QR và số tài khoản), nội dung ghi mã máy.
3. Nhắn [Zalo 0355011166 (Đàm Xuân Hiếu)](https://zalo.me/0355011166) hoặc [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat) ảnh chuyển khoản + mã máy.
4. Nhận mã (bắt đầu bằng `PSB1.`), dán vào ô trên panel → **Nhập** → **▶ Chạy**.

- Gia hạn trước khi hết hạn: ngày mới được cộng nối tiếp, không mất ngày. Bấm **Gia hạn** trên panel để nhập mã mới.
- Mỗi trình duyệt và mỗi trang game (pokesurvivor.com / doofcraft) có mã máy riêng. Chơi cả 2 trang thì gửi cả 2 mã máy, tác giả làm 1 mã dùng chung.
- Xoá dữ liệu trình duyệt (cookie / dữ liệu trang) sẽ đổi mã máy: nhắn tác giả để được cấp lại, không mất ngày.
- Game cập nhật làm bot hỏng: tác giả sẽ tìm mọi cách cho bot chạy lại; thử hết cách vẫn không được thì không hoàn tiền.

## Cập nhật

- **Máy tính:** khi panel hiện dòng vàng "⬆ Có bản mới", tải lại ZIP ở bước 1 rồi giải nén đè lên thư mục cũ.
- **Điện thoại:** trình quản lý userscript tự cập nhật định kỳ (hoặc bấm **Check for updates**).

Cần cài hộ: liên hệ [Zalo 0355011166](https://zalo.me/0355011166) hoặc [TikTok @phuongnguyenconhat](https://www.tiktok.com/@phuongnguyenconhat) · [Giấy phép](LICENSE)
