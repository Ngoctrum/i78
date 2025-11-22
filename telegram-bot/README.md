# 🤖 AniShop Telegram Bot

Bot Telegram chuyên nghiệp để quản lý đơn hàng AniShop.

## ✨ Tính năng

- ✅ **Đăng ký tài khoản bot** tự động khi /start
- 📦 **Đặt đơn hàng** với quy trình hỏi từng bước
- 🔍 **Tra cứu đơn hàng** theo mã đơn
- 👤 **Quản lý tài khoản** xem thông tin cá nhân
- 🔔 **Thông báo tự động** khi đơn hàng cập nhật
- 🎨 **Giao diện thân thiện** với keyboard buttons
- 💼 **Chuyên nghiệp** với emoji và markdown formatting

## 📋 Yêu cầu

- Node.js 14.x trở lên
- npm hoặc yarn
- Telegram Bot Token (từ [@BotFather](https://t.me/BotFather))
- API Key của AniShop

## 🚀 Cài đặt

### Bước 1: Clone và cài đặt dependencies

```bash
cd telegram-bot
npm install
```

### Bước 2: Tạo bot trên Telegram

1. Mở Telegram và tìm [@BotFather](https://t.me/BotFather)
2. Gửi lệnh `/newbot`
3. Đặt tên cho bot (ví dụ: "AniShop Order Bot")
4. Đặt username cho bot (phải kết thúc bằng "bot", ví dụ: "anishop_order_bot")
5. Copy Bot Token mà BotFather cung cấp

### Bước 3: Cấu hình môi trường

```bash
cp .env.example .env
```

Sau đó mở file `.env` và điền thông tin:

```env
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz  # Token từ BotFather
API_URL=https://mebctcjwshfhyzevdigt.supabase.co
API_KEY=your_api_key_here  # API Key từ admin AniShop
WEBHOOK_PORT=3000
```

### Bước 4: Chạy bot

**Development mode (với auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 🎯 Cách sử dụng

### Lệnh cơ bản

- `/start` - Đăng ký và khởi động bot
- `/menu` - Hiển thị menu chính
- `/order` - Đặt đơn hàng mới
- `/track MÃ_ĐƠN` - Tra cứu đơn hàng (ví dụ: `/track ANI123456`)
- `/tk` - Xem thông tin tài khoản
- `/help` - Hướng dẫn sử dụng

### Quy trình đặt hàng

1. Gửi lệnh `/order` hoặc nhấn nút "📦 Đặt đơn hàng"
2. Bot sẽ hỏi từng bước:
   - 🔗 Link sản phẩm
   - 📊 Số lượng
   - 📝 Ghi chú (có thể bỏ qua)
   - 👤 Họ tên người nhận
   - 📍 Địa chỉ giao hàng
   - 📞 Số điện thoại/link liên hệ
3. Bot tạo đơn và trả về mã đơn hàng

## 🔔 Thông báo tự động

Bot có endpoint webhook để nhận thông báo khi đơn hàng cập nhật.

### Cấu hình webhook trên website

Thêm đoạn code sau vào website để gọi webhook khi đơn hàng cập nhật:

```javascript
// Khi cập nhật đơn hàng, gọi webhook bot
async function notifyBotOrderUpdate(orderCode, status, paymentStatus) {
  try {
    await fetch('http://YOUR_BOT_SERVER:3000/webhook/order-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_code: orderCode,
        status: status,
        payment_status: paymentStatus
      })
    });
  } catch (error) {
    console.error('Failed to notify bot:', error);
  }
}
```

**Lưu ý:** Thay `YOUR_BOT_SERVER` bằng địa chỉ server chạy bot.

## 🖥️ Deploy lên Server

### Option 1: VPS (Ubuntu/Debian)

```bash
# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone code
git clone <repository_url>
cd telegram-bot

# Cài đặt dependencies
npm install

# Cài đặt PM2 để chạy nền
sudo npm install -g pm2

# Chạy bot với PM2
pm2 start index.js --name anishop-bot
pm2 save
pm2 startup
```

### Option 2: Heroku

1. Tạo file `Procfile`:
```
worker: node index.js
```

2. Deploy:
```bash
heroku create anishop-bot
heroku config:set BOT_TOKEN=your_token_here
heroku config:set API_URL=your_api_url
heroku config:set API_KEY=your_api_key
git push heroku main
heroku ps:scale worker=1
```

### Option 3: Railway.app

1. Tạo tài khoản tại [Railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Chọn repository
4. Thêm biến môi trường BOT_TOKEN, API_URL, API_KEY
5. Deploy tự động

## 📊 Cấu trúc dữ liệu

Bot lưu trữ thông tin người dùng trong file `bot_users.json`:

```json
[
  {
    "chat_id": 123456789,
    "telegram_id": 123456789,
    "username": "username",
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "created_at": "2024-01-01T00:00:00.000Z",
    "orders": ["ANI123456", "ANI789012"]
  }
]
```

## 🛠️ Troubleshooting

### Bot không phản hồi

1. Kiểm tra BOT_TOKEN có đúng không
2. Kiểm tra kết nối internet
3. Xem logs: `pm2 logs anishop-bot`

### Không tạo được đơn hàng

1. Kiểm tra API_KEY có đúng không
2. Kiểm tra API_URL có truy cập được không
3. Xem logs để biết chi tiết lỗi

### Không nhận được thông báo cập nhật

1. Kiểm tra webhook endpoint có accessible từ internet không
2. Kiểm tra website có gọi webhook đúng URL không
3. Kiểm tra port 3000 có mở không (hoặc port bạn cấu hình)

## 🔐 Bảo mật

- ⚠️ **KHÔNG** commit file `.env` lên git
- ⚠️ **KHÔNG** chia sẻ BOT_TOKEN với người khác
- ⚠️ **KHÔNG** chia sẻ API_KEY với người khác
- ✅ Sử dụng HTTPS cho webhook endpoint trong production
- ✅ Thêm authentication cho webhook endpoint nếu cần

## 📝 Ghi chú

- Bot sử dụng polling mode (không cần webhook cho Telegram)
- File `bot_users.json` sẽ được tạo tự động
- Bot có thể chạy 24/7 trên server
- Hỗ trợ unlimited users

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs
2. Kiểm tra file `.env`
3. Đảm bảo API key đúng và còn hoạt động

## 📄 License

ISC
