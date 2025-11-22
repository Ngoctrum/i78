# Hướng Dẫn Deploy Lên cPanel Hosting

## Bước 1: Build Website

Chạy lệnh build trong terminal:

```bash
npm run build
```

Sau khi build xong, bạn sẽ có thư mục `dist` chứa toàn bộ file website.

## Bước 2: Upload Lên Hosting

### Cách 1: Sử dụng File Manager trong cPanel

1. Đăng nhập vào cPanel của bạn
2. Mở **File Manager**
3. Vào thư mục `public_html` (hoặc thư mục domain/subdomain bạn muốn)
4. Upload toàn bộ nội dung trong thư mục `dist` (không upload thư mục `dist`, chỉ upload các file bên trong)
5. File `.htaccess` sẽ được upload cùng để xử lý routing

### Cách 2: Sử dụng FTP

1. Kết nối FTP tới hosting
2. Vào thư mục `public_html`
3. Upload toàn bộ nội dung trong thư mục `dist`

## Bước 3: Kiểm Tra

1. Truy cập website qua domain của bạn
2. Kiểm tra các chức năng:
   - Đăng nhập/Đăng ký
   - Đặt hàng
   - Tra cứu đơn hàng
   - Admin panel (nếu có quyền)

## Lưu Ý Quan Trọng

### Database & Backend
Website này sử dụng Lovable Cloud (Supabase) làm backend, vì vậy:
- ✅ Không cần cài đặt database trên hosting
- ✅ Không cần cấu hình PHP
- ✅ Backend hoạt động độc lập, chỉ cần upload frontend

### File .htaccess
File `.htaccess` đã được tạo sẵn trong thư mục `public` và sẽ được copy vào `dist` khi build. File này giúp:
- Xử lý SPA routing (single page application)
- Redirect tất cả request về `index.html`

### Cấu Hình Domain
- Website sẽ chạy ở root domain (vd: `yourdomain.com`)
- Nếu muốn chạy ở subdomain (vd: `shop.yourdomain.com`), chỉ cần upload vào thư mục subdomain trong cPanel

## Troubleshooting

### Lỗi: Trang trắng sau khi upload
- Kiểm tra file `.htaccess` đã được upload chưa
- Xóa cache trình duyệt và refresh lại

### Lỗi: Không load được CSS/JS
- Kiểm tra đã upload đúng toàn bộ file trong `dist` chưa
- Kiểm tra quyền file (chmod 644 cho file, 755 cho folder)

### Lỗi 404 khi chuyển trang
- Kiểm tra file `.htaccess` đã có trong thư mục root
- Kiểm tra hosting có bật mod_rewrite chưa

## Update Website

Khi có thay đổi:
1. Build lại: `npm run build`
2. Xóa toàn bộ file cũ trong `public_html` (trừ `.htaccess` nếu có thay đổi riêng)
3. Upload file mới từ `dist`

## Telegram Bot

Telegram bot cần chạy riêng trên môi trường Node.js:
1. Upload thư mục `telegram-bot` lên hosting
2. Sử dụng **Node.js App** trong cPanel (nếu hosting support)
3. Hoặc chạy trên VPS/server riêng

Chi tiết xem file `telegram-bot/README.md`
