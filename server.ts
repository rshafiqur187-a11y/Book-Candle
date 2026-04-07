import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, setDoc, getDoc } from 'firebase/firestore';
import { db } from './src/lib/firebase';

const PORT = 3000;
const TELEGRAM_TOKEN = '8675336737:AAF_JtR964QOxhqRepqNnDEc_lxu7kmYeKY';
const ADMIN_CODE = 'FRS1';

// Store admin chat IDs in memory for simplicity, or we could store in Firestore
const adminChats = new Set<number>();

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Telegram Bot Logic
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome to BooK Candle Bot. Type /admin to login as admin.');
});

bot.onText(/\/admin/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Please enter the admin code:');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  let isAdmin = adminChats.has(chatId);
  if (!isAdmin) {
    try {
      const adminDoc = await getDoc(doc(db, 'bot_admins', chatId.toString()));
      if (adminDoc.exists()) {
        isAdmin = true;
        adminChats.add(chatId);
      }
    } catch (e) {
      console.error("Error checking admin status", e);
    }
  }

  if (text === ADMIN_CODE) {
    adminChats.add(chatId);
    try {
      await setDoc(doc(db, 'bot_admins', chatId.toString()), { isAdmin: true });
    } catch (e) {
      console.error("Error saving admin", e);
    }
    bot.sendMessage(chatId, 'Admin access granted. Use the menu below.', {
      reply_markup: {
        keyboard: [
          [{ text: 'Add Product' }, { text: 'List Products' }],
          [{ text: 'View Orders (Today)' }]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  if (!isAdmin) return;

  // Admin Commands
  if (text === 'List Products') {
    const snapshot = await getDocs(collection(db, 'products'));
    if (snapshot.empty) {
      bot.sendMessage(chatId, 'No products found.');
      return;
    }
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      bot.sendMessage(chatId, `*${p.title}*\nPrice: ${p.price} BDT\nDiscount: ${p.discount || 0}%\nID: \`${docSnap.id}\``, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Delete', callback_data: `del_prod_${docSnap.id}` }]
          ]
        }
      });
    });
  } else if (text === 'Add Product') {
    bot.sendMessage(chatId, 'To add a product, send a message in this format:\n\nADD_PROD\nTitle\nPrice\nDiscount\nDescription\nImageURL\n\nTo edit, use:\nEDIT_PROD\nProductID\nTitle\nPrice\nDiscount\nDescription\nImageURL');
  } else if (text.startsWith('ADD_PROD')) {
    const lines = text.split('\n').map(l => l.trim());
    if (lines.length >= 6) {
      try {
        const title = lines[1];
        const price = Number(lines[2]);
        const discount = Number(lines[3]);
        const image = lines[lines.length - 1];
        const description = lines.slice(4, lines.length - 1).join('\n').trim();

        await addDoc(collection(db, 'products'), {
          title,
          price,
          discount,
          description,
          image,
          createdAt: new Date().toISOString()
        });
        bot.sendMessage(chatId, 'Product added successfully!');
      } catch (e: any) {
        bot.sendMessage(chatId, 'Error adding product: ' + e.message);
      }
    } else {
      bot.sendMessage(chatId, 'Invalid format. Please ensure you provide all fields.');
    }
  } else if (text.startsWith('EDIT_PROD')) {
    const lines = text.split('\n').map(l => l.trim());
    if (lines.length >= 7) {
      try {
        const id = lines[1];
        const title = lines[2];
        const price = Number(lines[3]);
        const discount = Number(lines[4]);
        const image = lines[lines.length - 1];
        const description = lines.slice(5, lines.length - 1).join('\n').trim();

        await updateDoc(doc(db, 'products', id), {
          title,
          price,
          discount,
          description,
          image
        });
        bot.sendMessage(chatId, 'Product updated successfully!');
      } catch (e: any) {
        bot.sendMessage(chatId, 'Error updating product: ' + e.message);
      }
    } else {
      bot.sendMessage(chatId, 'Invalid format. Please ensure you provide all fields.');
    }
  } else if (text.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Date filter for orders
    const dateStr = text;
    const snapshot = await getDocs(collection(db, 'orders'));
    let found = false;
    snapshot.forEach(docSnap => {
      const order = docSnap.data();
      if (order.createdAt && order.createdAt.startsWith(dateStr)) {
        found = true;
        sendOrderToAdmin(chatId, docSnap.id, order);
      }
    });
    if (!found) bot.sendMessage(chatId, `No orders found for ${dateStr}`);
  }
});

bot.on('callback_query', async (query) => {
  const data = query.data;
  const chatId = query.message?.chat.id;
  if (!data || !chatId) return;

  if (data.startsWith('del_prod_')) {
    const id = data.replace('del_prod_', '');
    await deleteDoc(doc(db, 'products', id));
    bot.sendMessage(chatId, 'Product deleted.');
  } else if (data.startsWith('confirm_order_')) {
    const id = data.replace('confirm_order_', '');
    await updateDoc(doc(db, 'orders', id), { status: 'confirmed' });
    bot.sendMessage(chatId, `Order ${id} confirmed.`);
  } else if (data.startsWith('reject_order_')) {
    const id = data.replace('reject_order_', '');
    await updateDoc(doc(db, 'orders', id), { status: 'cancelled' });
    bot.sendMessage(chatId, `Order ${id} cancelled.`);
  }
});

function sendOrderToAdmin(chatId: number, orderId: string, order: any) {
  const items = order.items.map((i: any) => `${i.title} (x${i.quantity})`).join(', ');
  const msg = `📦 *New Order!*\n\n*Name:* ${order.name}\n*Phone:* ${order.phone}\n*Address:* ${order.address}\n*Items:* ${items}\n*Payment:* ${order.paymentMethod}\n*TrxID:* ${order.transactionId || 'N/A'}\n*Total:* ${order.total} BDT\n*Status:* ${order.status}`;
  
  bot.sendMessage(chatId, msg, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Confirm', callback_data: `confirm_order_${orderId}` },
          { text: 'Reject', callback_data: `reject_order_${orderId}` }
        ]
      ]
    }
  });
}

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // API Route for new orders
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = { ...req.body, status: 'pending', createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Notify all admins
      adminChats.forEach(chatId => {
        sendOrderToAdmin(chatId, docRef.id, orderData);
      });

      res.json({ success: true, orderId: docRef.id });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Failed to place order' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
