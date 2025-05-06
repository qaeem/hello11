const express = require("express");
const app = express();

app.get("/get-user-ip", (req, res) => {
  const userIp = req.ip;  // أو استخدم مكتبة مثل 'request-ip' للحصول على الـ IP
  res.send(userIp);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
