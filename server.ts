import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import TelegramBot from 'node-telegram-bot-api';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './src/lib/firebase';

const PORT = 3000;
const TELEGRAM_TOKEN = '8675336737:AAF_JtR964QOxhqRepqNnDEc_lxu7kmYeKY';
const ADMIN_CODE = 'FRS1';

// Store admin chat IDs in memory for simplicity, or we could store in Firestore
const adminChats = new Set<number>();
const pixelSetupState = new Set<number>();

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

import { Readable } from 'stream';

async function streamToBlob(stream: Readable, mimeType: string): Promise<Blob> {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return new Blob([buffer], { type: mimeType });
}

async function uploadToCatbox(stream: NodeJS.ReadableStream, filename: string, mimeType: string): Promise<string> {
  const blob = await streamToBlob(stream as Readable, mimeType);
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, filename);

  const response = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData as any
  });

  if (!response.ok) {
    throw new Error(`Catbox upload failed: ${response.statusText}`);
  }

  return await response.text();
}

// Telegram Bot Logic
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Welcome to BooK Candle Bot. Type /admin to login as admin.');
});

bot.onText(/\/admin/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Please enter the admin code:');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || msg.caption || '';
  const photo = msg.photo;
  const video = msg.video || msg.animation;

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
          [{ text: 'View Orders (Today)' }, { text: 'Pixel Setup' }]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  if (!isAdmin) return;

  // Admin Commands
  if (pixelSetupState.has(chatId)) {
    pixelSetupState.delete(chatId);
    if (text.trim()) {
      try {
        await setDoc(doc(db, 'settings', 'pixel'), { id: text.trim() });
        bot.sendMessage(chatId, '✅ Facebook Pixel ID saved successfully! It is now active on your website.');
      } catch (e: any) {
        bot.sendMessage(chatId, '❌ Error saving Pixel ID: ' + e.message);
      }
    } else {
      bot.sendMessage(chatId, '❌ Invalid Pixel ID. Setup cancelled.');
    }
    return;
  }

  if (text === 'Pixel Setup') {
    pixelSetupState.add(chatId);
    bot.sendMessage(chatId, 'Please send your Facebook Pixel ID (e.g., 123456789012345):');
    return;
  }

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
    bot.sendMessage(chatId, 'To add a product, send a message in this format (You can also attach a photo or video with this text as caption):\n\nADD_PROD\nTitle\nPrice\nDiscount\nDescription\nMediaURL (Optional if media attached)\n\nTo edit, use:\nEDIT_PROD\nProductID\nTitle\nPrice\nDiscount\nDescription\nMediaURL (Optional if media attached)');
  } else if (text.startsWith('ADD_PROD')) {
    const lines = text.split('\n').map(l => l.trim());
    if (lines.length >= 5) {
      try {
        const title = lines[1];
        const priceStr = lines[2].replace(/[^\d.]/g, '');
        const price = priceStr ? Number(priceStr) : 0;
        const discountStr = lines[3].replace(/[^\d.]/g, '');
        const discount = discountStr ? Number(discountStr) : 0;
        let image = '';
        let description = '';
        let mediaType = 'image';

        if (video) {
          bot.sendMessage(chatId, 'Uploading video, please wait...');
          const fileId = video.file_id;
          const file = await bot.getFile(fileId);
          const ext = file.file_path?.split('.').pop()?.toLowerCase() || 'mp4';
          const stream = bot.getFileStream(fileId);
          image = await uploadToCatbox(stream, `video.${ext}`, `video/${ext}`);
          mediaType = 'video';
          description = lines.slice(4).join('\n').trim();
        } else if (photo && photo.length > 0) {
          bot.sendMessage(chatId, 'Uploading image, please wait...');
          const fileId = photo[photo.length - 1].file_id;
          const file = await bot.getFile(fileId);
          const ext = file.file_path?.split('.').pop()?.toLowerCase() || 'jpg';
          const stream = bot.getFileStream(fileId);
          image = await uploadToCatbox(stream, `image.${ext}`, `image/${ext}`);
          mediaType = 'image';
          description = lines.slice(4).join('\n').trim();
        } else {
          image = lines[lines.length - 1];
          mediaType = image.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image';
          description = lines.slice(4, lines.length - 1).join('\n').trim();
        }

        await addDoc(collection(db, 'products'), {
          title,
          price,
          discount,
          description,
          image,
          mediaType,
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
    if (lines.length >= 6) {
      try {
        const id = lines[1];
        const title = lines[2];
        const priceStr = lines[3].replace(/[^\d.]/g, '');
        const price = priceStr ? Number(priceStr) : 0;
        const discountStr = lines[4].replace(/[^\d.]/g, '');
        const discount = discountStr ? Number(discountStr) : 0;
        let image = '';
        let description = '';
        let mediaType = 'image';

        if (video) {
          bot.sendMessage(chatId, 'Uploading video, please wait...');
          const fileId = video.file_id;
          const file = await bot.getFile(fileId);
          const ext = file.file_path?.split('.').pop()?.toLowerCase() || 'mp4';
          const stream = bot.getFileStream(fileId);
          image = await uploadToCatbox(stream, `video.${ext}`, `video/${ext}`);
          mediaType = 'video';
          description = lines.slice(5).join('\n').trim();
        } else if (photo && photo.length > 0) {
          bot.sendMessage(chatId, 'Uploading image, please wait...');
          const fileId = photo[photo.length - 1].file_id;
          const file = await bot.getFile(fileId);
          const ext = file.file_path?.split('.').pop()?.toLowerCase() || 'jpg';
          const stream = bot.getFileStream(fileId);
          image = await uploadToCatbox(stream, `image.${ext}`, `image/${ext}`);
          mediaType = 'image';
          description = lines.slice(5).join('\n').trim();
        } else {
          image = lines[lines.length - 1];
          mediaType = image.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image';
          description = lines.slice(5, lines.length - 1).join('\n').trim();
        }

        await updateDoc(doc(db, 'products', id), {
          title,
          price,
          discount,
          description,
          image,
          mediaType
        });
        bot.sendMessage(chatId, 'Product updated successfully!');
      } catch (e: any) {
        bot.sendMessage(chatId, 'Error updating product: ' + e.message);
      }
    } else {
      bot.sendMessage(chatId, 'Invalid format. Please ensure you provide all fields.');
    }
  } else if (text === 'View Orders (Today)') {
    const today = new Date().toISOString().split('T')[0];
    const snapshot = await getDocs(collection(db, 'orders'));
    let found = false;
    snapshot.forEach(docSnap => {
      const order = docSnap.data();
      if (order.createdAt && order.createdAt.startsWith(today)) {
        found = true;
        sendOrderToAdmin(chatId, docSnap.id, order);
      }
    });
    if (!found) bot.sendMessage(chatId, `No orders found for today (${today}).`);
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
  } else if (photo || video) {
    bot.sendMessage(chatId, '⚠️ You sent a media file without product details.\n\nTo add a product, please upload the image/video and write the details in the **Caption** like this:\n\nADD_PROD\nProduct Title\nPrice\nDiscount\nDescription');
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
    bot.sendMessage(chatId, `Order confirmed.`);
  } else if (data.startsWith('reject_order_')) {
    const id = data.replace('reject_order_', '');
    await updateDoc(doc(db, 'orders', id), { status: 'cancelled' });
    bot.sendMessage(chatId, `Order cancelled.`);
  }
});

function sendOrderToAdmin(chatId: number, orderId: string, order: any) {
  const itemsList = order.items.map((i: any) => `- ${i.title} (x${i.quantity})`).join('\n');
  
  let msg = `📦 *New Order!*\n\n`;
  msg += `*Full Name:* ${order.name}\n`;
  msg += `*Phone Number:* ${order.phone}\n`;
  msg += `*Location:* ${order.location === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}\n`;
  msg += `*Full Address:* ${order.address}\n`;
  msg += `*Payment Method:* ${order.paymentMethod === 'bkash' ? 'bKash' : 'Cash on Delivery'}\n`;
  
  if (order.paymentMethod === 'bkash') {
    msg += `*bKash Number:* ${order.senderNumber || 'N/A'}\n`;
    msg += `*Transaction ID:* ${order.transactionId || 'N/A'}\n`;
  }

  msg += `\n*Items:*\n${itemsList}\n\n`;
  msg += `*Subtotal:* ${order.subtotal} BDT\n`;
  msg += `*Delivery Charge:* ${order.deliveryCharge} BDT\n`;
  msg += `*Total:* ${order.total} BDT`;
  
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

// Listen for new orders in Firestore
const ordersRef = collection(db, 'orders');
onSnapshot(ordersRef, (snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'added') {
      const order = change.doc.data();
      const orderId = change.doc.id;
      
      // Only notify if not already notified
      if (!order.notified) {
        try {
          const adminsSnapshot = await getDocs(collection(db, 'bot_admins'));
          adminsSnapshot.forEach(docSnap => {
            const chatId = parseInt(docSnap.id, 10);
            if (!isNaN(chatId)) {
              sendOrderToAdmin(chatId, orderId, order);
            }
          });
          
          // Mark as notified
          await updateDoc(doc(db, 'orders', orderId), { notified: true });
        } catch (error) {
          console.error("Error notifying admins:", error);
        }
      }
    }
  });
});

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // API Route for serving Telegram media securely
  app.get('/api/media/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    try {
      const file = await bot.getFile(fileId);
      const ext = file.file_path?.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
      else if (ext === 'png') contentType = 'image/png';
      else if (ext === 'mp4') contentType = 'video/mp4';
      else if (ext === 'webm') contentType = 'video/webm';
      else if (ext === 'ogg') contentType = 'video/ogg';
      else if (ext === 'gif') contentType = 'image/gif';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      const stream = bot.getFileStream(fileId);
      stream.on('error', (err) => {
        console.error('Error fetching media from Telegram:', err);
        if (!res.headersSent) res.status(500).send('Error fetching media');
      });
      stream.pipe(res);
    } catch (e) {
      if (!res.headersSent) res.status(500).send('Error');
    }
  });

  // Keep old route for backwards compatibility with existing products
  app.get('/api/image/:fileId', async (req, res) => {
    const fileId = req.params.fileId;
    try {
      const file = await bot.getFile(fileId);
      const ext = file.file_path?.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
      else if (ext === 'png') contentType = 'image/png';
      else if (ext === 'gif') contentType = 'image/gif';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      const stream = bot.getFileStream(fileId);
      stream.on('error', (err) => {
        if (!res.headersSent) res.status(500).send('Error fetching image');
      });
      stream.pipe(res);
    } catch (e) {
      if (!res.headersSent) res.status(500).send('Error');
    }
  });

  // API Route for Facebook Pixel
  app.get('/api/pixel', async (req, res) => {
    try {
      const pixelDoc = await getDoc(doc(db, 'settings', 'pixel'));
      if (pixelDoc.exists()) {
        res.json({ id: pixelDoc.data().id });
      } else {
        res.json({ id: null });
      }
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch pixel' });
    }
  });

  // API Route for new orders
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = { ...req.body, status: 'pending', createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Notify all admins from database
      try {
        const adminsSnapshot = await getDocs(collection(db, 'bot_admins'));
        adminsSnapshot.forEach(docSnap => {
          const chatId = parseInt(docSnap.id, 10);
          if (!isNaN(chatId)) {
            sendOrderToAdmin(chatId, docRef.id, orderData);
          }
        });
      } catch (notifyError) {
        console.error("Error notifying admins:", notifyError);
      }

      res.json({ success: true, orderId: docRef.id });
    } catch (e) {
      console.error("Order error:", e);
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
