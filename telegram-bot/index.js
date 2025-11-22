const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;

// Initialize bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// In-memory storage for bot users and order sessions
const botUsers = new Map();
const orderSessions = new Map();

// Load bot users from file if exists
if (fs.existsSync('bot_users.json')) {
  const data = JSON.parse(fs.readFileSync('bot_users.json', 'utf8'));
  data.forEach(user => botUsers.set(user.chat_id, user));
}

// Save bot users to file
function saveBotUsers() {
  const data = Array.from(botUsers.values());
  fs.writeFileSync('bot_users.json', JSON.stringify(data, null, 2));
}

// Main menu keyboard
function getMainMenuKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '📦 Đặt đơn hàng' }, { text: '🔍 Tra cứu đơn hàng' }],
        [{ text: '👤 Tài khoản' }, { text: '📋 Menu' }]
      ],
      resize_keyboard: true
    }
  };
}

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  // Register bot user
  if (!botUsers.has(chatId)) {
    const newUser = {
      chat_id: chatId,
      telegram_id: user.id,
      username: user.username || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      created_at: new Date().toISOString()
    };
    
    botUsers.set(chatId, newUser);
    saveBotUsers();
    
    bot.sendMessage(
      chatId,
      `🎉 Chào mừng ${user.first_name}!\n\n` +
      `✅ Đăng ký tài khoản bot thành công!\n\n` +
      `📱 Bạn có thể sử dụng các tính năng sau:\n` +
      `• 📦 Đặt đơn hàng mới\n` +
      `• 🔍 Tra cứu đơn hàng\n` +
      `• 👤 Xem thông tin tài khoản\n\n` +
      `Nhấn vào các nút bên dưới hoặc sử dụng lệnh /menu để bắt đầu!`,
      getMainMenuKeyboard()
    );
  } else {
    bot.sendMessage(
      chatId,
      `👋 Chào mừng trở lại ${user.first_name}!\n\n` +
      `Sử dụng menu bên dưới để tiếp tục.`,
      getMainMenuKeyboard()
    );
  }
});

// Menu command
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    `📋 *MENU CHÍNH*\n\n` +
    `🔹 /order - Đặt đơn hàng mới\n` +
    `🔹 /track - Tra cứu đơn hàng\n` +
    `🔹 /tk - Xem tài khoản của bạn\n` +
    `🔹 /help - Hướng dẫn sử dụng\n\n` +
    `Hoặc sử dụng các nút bên dưới! 👇`,
    { ...getMainMenuKeyboard(), parse_mode: 'Markdown' }
  );
});

// Account info command
bot.onText(/\/tk/, (msg) => {
  const chatId = msg.chat.id;
  const user = botUsers.get(chatId);
  
  if (!user) {
    bot.sendMessage(chatId, '❌ Vui lòng sử dụng /start để đăng ký tài khoản!');
    return;
  }
  
  bot.sendMessage(
    chatId,
    `👤 *THÔNG TIN TÀI KHOẢN*\n\n` +
    `📱 Telegram ID: ${user.telegram_id}\n` +
    `👋 Tên: ${user.first_name} ${user.last_name || ''}\n` +
    `🆔 Username: @${user.username || 'Chưa có'}\n` +
    `📅 Ngày đăng ký: ${new Date(user.created_at).toLocaleDateString('vi-VN')}`,
    { parse_mode: 'Markdown' }
  );
});

// Track order command
bot.onText(/\/track (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const orderCode = match[1].trim().toUpperCase();
  
  bot.sendMessage(chatId, `🔍 Đang tra cứu đơn hàng ${orderCode}...`);
  
  try {
    const response = await axios.get(`${API_URL}/rest/v1/orders?order_code=eq.${orderCode}`, {
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const order = response.data[0];
      const statusEmoji = {
        'pending': '⏳',
        'processing': '🔄',
        'shipping': '🚚',
        'delivered': '✅',
        'cancelled': '❌'
      };
      
      const paymentEmoji = {
        'unpaid': '⏳',
        'paid': '✅',
        'refunded': '↩️'
      };
      
      bot.sendMessage(
        chatId,
        `📦 *THÔNG TIN ĐơN HÀNG*\n\n` +
        `🔖 Mã đơn: \`${order.order_code}\`\n` +
        `${statusEmoji[order.status] || '⏳'} Trạng thái: *${getStatusText(order.status)}*\n` +
        `${paymentEmoji[order.payment_status] || '⏳'} Thanh toán: *${getPaymentStatusText(order.payment_status)}*\n\n` +
        `🔗 Link sản phẩm: ${order.product_link}\n` +
        `📊 Số lượng: ${order.quantity}\n` +
        `💰 Phí dịch vụ: ${order.service_fee.toLocaleString('vi-VN')} VNĐ\n\n` +
        `👤 Người nhận: ${order.recipient_name}\n` +
        `📞 Liên hệ: ${order.phone_or_contact}\n` +
        `📍 Địa chỉ: ${order.address}\n\n` +
        `📅 Ngày tạo: ${new Date(order.created_at).toLocaleString('vi-VN')}`,
        { parse_mode: 'Markdown' }
      );
    } else {
      bot.sendMessage(chatId, '❌ Không tìm thấy đơn hàng với mã này!');
    }
  } catch (error) {
    console.error('Track order error:', error);
    bot.sendMessage(chatId, '❌ Lỗi khi tra cứu đơn hàng. Vui lòng thử lại sau!');
  }
});

// Order command - start order flow
bot.onText(/\/order/, (msg) => {
  const chatId = msg.chat.id;
  const user = botUsers.get(chatId);
  
  if (!user) {
    bot.sendMessage(chatId, '❌ Vui lòng sử dụng /start để đăng ký tài khoản!');
    return;
  }
  
  // Initialize order session
  orderSessions.set(chatId, { step: 'product_link' });
  
  bot.sendMessage(
    chatId,
    `📦 *BẮT ĐẦU ĐẶT ĐƠN HÀNG*\n\n` +
    `Vui lòng gửi *link sản phẩm* bạn muốn đặt:`,
    { 
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [[{ text: '❌ Hủy đặt hàng' }]],
        resize_keyboard: true
      }
    }
  );
});

// Handle text messages for order flow
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Handle button clicks
  if (text === '📦 Đặt đơn hàng') {
    bot.emit('text', { chat: { id: chatId }, text: '/order', from: msg.from });
    return;
  }
  
  if (text === '🔍 Tra cứu đơn hàng') {
    bot.sendMessage(
      chatId,
      '🔍 Vui lòng nhập mã đơn hàng hoặc sử dụng lệnh:\n\n`/track MÃ_ĐƠN_HÀNG`',
      { parse_mode: 'Markdown' }
    );
    return;
  }
  
  if (text === '👤 Tài khoản') {
    bot.emit('text', { chat: { id: chatId }, text: '/tk', from: msg.from });
    return;
  }
  
  if (text === '📋 Menu') {
    bot.emit('text', { chat: { id: chatId }, text: '/menu', from: msg.from });
    return;
  }
  
  if (text === '❌ Hủy đặt hàng') {
    orderSessions.delete(chatId);
    bot.sendMessage(chatId, '❌ Đã hủy đặt hàng!', getMainMenuKeyboard());
    return;
  }
  
  // Handle order flow
  const session = orderSessions.get(chatId);
  if (!session) return;
  
  switch (session.step) {
    case 'product_link':
      session.product_link = text;
      session.step = 'quantity';
      bot.sendMessage(chatId, '📊 Vui lòng nhập *số lượng*:', { parse_mode: 'Markdown' });
      break;
      
    case 'quantity':
      const quantity = parseInt(text);
      if (isNaN(quantity) || quantity < 1) {
        bot.sendMessage(chatId, '❌ Số lượng không hợp lệ! Vui lòng nhập lại:');
        return;
      }
      session.quantity = quantity;
      session.step = 'notes';
      bot.sendMessage(
        chatId,
        '📝 Vui lòng nhập *ghi chú* cho đơn hàng:\n\n(Nhập "Không" nếu không có ghi chú)',
        { parse_mode: 'Markdown' }
      );
      break;
      
    case 'notes':
      session.notes = text === 'Không' ? '' : text;
      session.step = 'recipient_name';
      bot.sendMessage(chatId, '👤 Vui lòng nhập *họ tên người nhận*:', { parse_mode: 'Markdown' });
      break;
      
    case 'recipient_name':
      session.recipient_name = text;
      session.step = 'address';
      bot.sendMessage(chatId, '📍 Vui lòng nhập *địa chỉ nhận hàng*:', { parse_mode: 'Markdown' });
      break;
      
    case 'address':
      session.address = text;
      session.step = 'contact';
      bot.sendMessage(
        chatId,
        '📞 Vui lòng nhập *số điện thoại hoặc link liên hệ*:',
        { parse_mode: 'Markdown' }
      );
      break;
      
    case 'contact':
      session.phone_or_contact = text;
      
      // Create order
      bot.sendMessage(chatId, '⏳ Đang tạo đơn hàng...');
      
      try {
        const response = await axios.post(
          `${API_URL}/functions/v1/api-place-order`,
          {
            product_link: session.product_link,
            quantity: session.quantity,
            recipient_name: session.recipient_name,
            phone_or_contact: session.phone_or_contact,
            address: session.address,
            notes: session.notes || null
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_KEY
            }
          }
        );
        
        if (response.data.success) {
          const order = response.data.order;
          
          bot.sendMessage(
            chatId,
            `✅ *ĐẶT ĐƠN HÀNG THÀNH CÔNG!*\n\n` +
            `🔖 Mã đơn hàng: \`${order.order_code}\`\n` +
            `💰 Phí dịch vụ: ${order.service_fee.toLocaleString('vi-VN')} VNĐ\n\n` +
            `📦 Thông tin đơn hàng:\n` +
            `• Link: ${session.product_link}\n` +
            `• Số lượng: ${session.quantity}\n` +
            `• Người nhận: ${session.recipient_name}\n` +
            `• Địa chỉ: ${session.address}\n` +
            `• Liên hệ: ${session.phone_or_contact}\n\n` +
            `Sử dụng lệnh /track ${order.order_code} để tra cứu đơn hàng!`,
            { ...getMainMenuKeyboard(), parse_mode: 'Markdown' }
          );
          
          // Store order reference for notifications
          const user = botUsers.get(chatId);
          if (!user.orders) user.orders = [];
          user.orders.push(order.order_code);
          saveBotUsers();
        } else {
          bot.sendMessage(
            chatId,
            '❌ Không thể tạo đơn hàng. Vui lòng thử lại sau!',
            getMainMenuKeyboard()
          );
        }
      } catch (error) {
        console.error('Create order error:', error);
        let errorMsg = '❌ Lỗi khi tạo đơn hàng!';
        
        if (error.response?.data?.error) {
          errorMsg += `\n\n${error.response.data.error}`;
        }
        
        bot.sendMessage(chatId, errorMsg, getMainMenuKeyboard());
      }
      
      // Clear session
      orderSessions.delete(chatId);
      break;
  }
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    `📚 *HƯỚNG DẪN SỬ DỤNG*\n\n` +
    `*Các lệnh cơ bản:*\n` +
    `🔹 /start - Đăng ký/Khởi động bot\n` +
    `🔹 /menu - Hiển thị menu chính\n` +
    `🔹 /order - Đặt đơn hàng mới\n` +
    `🔹 /track MÃ_ĐƠN - Tra cứu đơn hàng\n` +
    `🔹 /tk - Xem thông tin tài khoản\n\n` +
    `*Quy trình đặt hàng:*\n` +
    `1️⃣ Sử dụng lệnh /order\n` +
    `2️⃣ Nhập link sản phẩm\n` +
    `3️⃣ Nhập số lượng\n` +
    `4️⃣ Nhập ghi chú (nếu có)\n` +
    `5️⃣ Nhập họ tên người nhận\n` +
    `6️⃣ Nhập địa chỉ giao hàng\n` +
    `7️⃣ Nhập số điện thoại/link liên hệ\n\n` +
    `💡 *Mẹo:* Sử dụng các nút menu để thao tác nhanh hơn!`,
    { parse_mode: 'Markdown' }
  );
});

// Helper functions
function getStatusText(status) {
  const statusMap = {
    'pending': 'Chờ xử lý',
    'processing': 'Đang xử lý',
    'shipping': 'Đang giao hàng',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
}

function getPaymentStatusText(status) {
  const paymentMap = {
    'unpaid': 'Chưa thanh toán',
    'paid': 'Đã thanh toán',
    'refunded': 'Đã hoàn tiền'
  };
  return paymentMap[status] || status;
}

// Webhook endpoint for order updates (optional - requires express server)
// You can set up a webhook on your website to call this endpoint when orders are updated
const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook/order-update', async (req, res) => {
  try {
    const { order_code, status, payment_status } = req.body;
    
    // Find users who have this order
    for (const [chatId, user] of botUsers.entries()) {
      if (user.orders && user.orders.includes(order_code)) {
        const statusEmoji = {
          'pending': '⏳',
          'processing': '🔄',
          'shipping': '🚚',
          'delivered': '✅',
          'cancelled': '❌'
        };
        
        bot.sendMessage(
          chatId,
          `🔔 *CẬP NHẬT ĐƠN HÀNG*\n\n` +
          `🔖 Mã đơn: \`${order_code}\`\n` +
          `${statusEmoji[status] || '⏳'} Trạng thái mới: *${getStatusText(status)}*\n\n` +
          `Sử dụng /track ${order_code} để xem chi tiết!`,
          { parse_mode: 'Markdown' }
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3000;
app.listen(WEBHOOK_PORT, () => {
  console.log(`Webhook server listening on port ${WEBHOOK_PORT}`);
});

console.log('🤖 Telegram bot is running...');
console.log('📱 Bot features:');
console.log('   ✅ User registration');
console.log('   ✅ Order placement');
console.log('   ✅ Order tracking');
console.log('   ✅ Account management');
console.log('   ✅ Order update notifications');
