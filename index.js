const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_FILE = "keys.json";

// tạo file nếu chưa có
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// đọc key
function readKeys() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

// ghi key
function saveKeys(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/* ====== TRANG CHỦ (QUAN TRỌNG) ====== */
app.get("/", (req, res) => {
  res.send(`
    <h2>✅ ADMIN KEY SERVER ĐANG CHẠY</h2>
    <p>Dùng các API:</p>
    <ul>
      <li>POST /create</li>
      <li>POST /delete</li>
      <li>POST /check</li>
      <li>GET /list</li>
    </ul>
  `);
});

/* ====== TẠO KEY ====== */
app.post("/create", (req, res) => {
  const { key } = req.body;
  if (!key) return res.json({ ok: false, msg: "Thiếu key" });

  let keys = readKeys();
  if (keys.find(k => k.key === key))
    return res.json({ ok: false, msg: "Key đã tồn tại" });

  keys.push({
    key,
    device: null,
    expire: Date.now() + 24 * 60 * 60 * 1000
  });

  saveKeys(keys);
  res.json({ ok: true });
});

/* ====== XOÁ KEY ====== */
app.post("/delete", (req, res) => {
  const { key } = req.body;
  let keys = readKeys().filter(k => k.key !== key);
  saveKeys(keys);
  res.json({ ok: true });
});

/* ====== CHECK KEY (1 KEY = 1 MÁY) ====== */
app.post("/check", (req, res) => {
  const { key, device } = req.body;
  let keys = readKeys();
  let k = keys.find(x => x.key === key);

  if (!k) return res.json({ ok: false, msg: "Key sai" });
  if (Date.now() > k.expire)
    return res.json({ ok: false, msg: "Key hết hạn" });

  if (!k.device) {
    k.device = device;
    saveKeys(keys);
  }

  if (k.device !== device)
    return res.json({ ok: false, msg: "Key đã dùng trên máy khác" });

  res.json({ ok: true });
});

/* ====== XEM DANH SÁCH KEY ====== */
app.get("/list", (req, res) => {
  res.json(readKeys());
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
