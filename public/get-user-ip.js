const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// دالة لاستخراج عنوان الـ IP للمستخدم
function getUserIP(req) {
  // إذا كان هناك وكيل (Proxy)، نأخذ الـ IP من الهيدر
  if (req.headers['x-forwarded-for']) {
    return req.headers['x-forwarded-for'].split(',')[0]; // أول IP في القائمة
  } else {
    // في حال عدم وجود وكيل (Proxy)، نأخذ الـ IP من الاتصال المباشر
    return req.connection.remoteAddress || req.socket.remoteAddress;
  }
}

// نقطة النهاية لاستخراج الـ IP
app.get('/get-user-ip', (req, res) => {
  const userIP = getUserIP(req);
  res.send(`عنوان الـ IP للمستخدم هو: ${userIP}`);
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
