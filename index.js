const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// file lưu key
const KEY_FILE = "./keys.json";
if (!fs.existsSync(KEY_FILE)) fs.writeFileSync(KEY_FILE, "[]");

// 👉 TRANG ADMIN (CÁI BẠN ĐANG LOAD)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// lấy danh sách key
app.get("/keys", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(KEY_FILE)));
});

// tạo key
app.post("/keys", (req, res) => {
  const keys = JSON.parse(fs.readFileSync(KEY_FILE));
  const key = "KEY-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  keys.push({ id: Date.now(), key, type: "FREE" });
  fs.writeFileSync(KEY_FILE, JSON.stringify(keys, null, 2));
  res.json({ success: true, key });
});

// xoá key
app.delete("/keys/:id", (req, res) => {
  let keys = JSON.parse(fs.readFileSync(KEY_FILE));
  keys = keys.filter(k => k.id != req.params.id);
  fs.writeFileSync(KEY_FILE, JSON.stringify(keys, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log("ADMIN KEY SERVER RUNNING ON PORT", PORT);
});
