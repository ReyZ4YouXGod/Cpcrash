import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// PENTING: Path static harus keluar satu folder ke ../public
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Configuration
const apikey = 'ptla_hfTku60K0sxQg0Xha6uGErwvwkypkdmr0QPmMtMhN0B';
const capikey = 'ptlc_gLJ0RdOKGDIVHEYlXhKfIfHqjvjpTK1CgfHxZ9EauOH';
const domain = 'https://reystcloud.serverkont.biz.id';
const nestid = '5';
const egg = '15';
const loc = '1';
const gmailadmin = 'admin@gmail.com'; 
const telegramBotToken = '7805124868:AAFZtImH0qfvyddaX2ba4NwXEPy55k6n04I';
const adminTelegramId = '2027479396';

// In-memory storage (Akan reset tiap Vercel 'tidur')
let servers = [];
let users = [];
let admins = [];

// Telegram helper function
async function sendTelegramMessage(chatId, message) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Authentication endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'rey' && password === 'dev') {
    res.json({ success: true, user: { username: 'ReyCloud', role: 'Admin' } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Create panel
app.post('/api/create', async (req, res) => {
  const { username, email, ram, disk, cpu, telegramId } = req.body;
  const password = username + Math.floor(Math.random() * 10000);
  const name = username + '-Buyyer';

  try {
    const userRes = await fetch(`${domain}/api/application/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email, username, first_name: username, last_name: 'User',
        password, language: 'en'
      })
    });

    const userData = await userRes.json();
    if (userData.errors) return res.json({ error: userData.errors[0].detail });

    const userId = userData.attributes.id;

    const eggData = await fetch(`${domain}/api/application/nests/${nestid}/eggs/${egg}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apikey}`, 'Accept': 'application/json' }
    });

    const eggJson = await eggData.json();
    
    const serverRes = await fetch(`${domain}/api/application/servers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apikey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name, user: userId, egg: parseInt(egg),
        docker_image: eggJson.attributes.docker_image,
        startup: eggJson.attributes.startup,
        environment: { INST: 'npm', USER_UPLOAD: '0', AUTO_UPDATE: '0', CMD_RUN: 'npm start' },
        limits: { memory: ram, swap: 0, disk: disk || ram, io: 500, cpu: cpu || 100 },
        feature_limits: { databases: 5, backups: 5, allocations: 5 },
        deploy: { locations: [parseInt(loc)], dedicated_ip: false, port_range: [] }
      })
    });

    const serverData = await serverRes.json();
    if (serverData.errors) return res.json({ error: serverData.errors[0].detail });

    // Notify Telegram
    const msg = `🆕 <b>New Panel Created!</b>\n👤 User: ${username}\n🔑 Pass: ${password}\n💾 RAM: ${ram}MB`;
    await sendTelegramMessage(adminTelegramId, msg);

    res.json({ username, password, email, panel_url: domain, server_id: serverData.attributes.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed', detail: err.message });
  }
});

// Endpoint lainnya (Get servers, delete, dll tetap sama kodenya)
// ... (Sisa API kamu tetap sama) ...

// Root endpoint FIX untuk Vercel
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// API Info
app.get('/api', (req, res) => {
  res.json({ message: 'API Online', status: 'ready' });
});

// EXPORT UNTUK VERCEL (PENGGANTI app.listen)
export default app;
