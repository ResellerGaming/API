// api/send-pairing-baileys.js
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Send Pairing Link via Baileys (WhatsApp Web)
 * - Requires: apikey (global.apikey), consent is enforced by caller (we check consent param)
 * - Single route: /premium/send-pairing-baileys?apikey=&nomor=&jumlah=&consent=
 *
 * Notes:
 * - First run will output QR to console for scanning by the WhatsApp account you control.
 * - Auth state is saved in ./auth_sessions/wa/
 * - Rate: 1 message / 1000 ms enforced by setInterval in worker
 * - Safety caps: MAX_PER_JOB, MAX_PER_HOUR
 */

// === Config (safety)
const MAX_PER_JOB = 3;      // max links per single request
const MAX_PER_HOUR = 5;     // max messages per phone per hour
const MAX_QUEUE = 20000;    // queue capacity
const SEND_INTERVAL_MS = 1000; // user requested 1 second
const TOKEN_TTL_MS = 10 * 60 * 1000; // pairing link TTL 10 minutes
const PAIR_PATH = '/premium/pair'; // route that will verify token

// === In-memory stores (replace with DB/Redis in prod)
const perNumberStore = new Map(); // phone => { count, windowStart }
const sendQueue = []; // jobs
const tokenStore = new Map(); // token => { phone, createdAt, expiresAt, used }

// === Baileys socket holder
let waSocket = null;
let waInitPromise = null;
const AUTH_DIR = path.join(__dirname, '..', 'auth_sessions', 'wa');

// ensure auth dir exists
if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

// === Initialize Baileys (lazy)
async function initBaileys() {
  if (waSocket) return waSocket;
  if (waInitPromise) return waInitPromise;

  waInitPromise = (async () => {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    // try to get latest WA version
    let version = undefined;
    try {
      const v = await fetchLatestBaileysVersion();
      version = v.version;
    } catch (e) { /* ignore */ }

    const sock = makeWASocket({
      auth: state,
      version,
      printQRInTerminal: false
    });

    // if no saved creds yet, Baileys will emit 'connection.update' with QR
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        console.log('=== Baileys QR code (scan using your WhatsApp) ===');
        qrcode.generate(qr, { small: true });
      }
      if (connection === 'close') {
        const reason = (lastDisconnect && lastDisconnect.error && lastDisconnect.error?.output) ? lastDisconnect.error.output.statusCode : null;
        console.log('WA connection closed', reason || lastDisconnect?.error || '');
        waSocket = null;
        // try reconnect automatically after short delay
        setTimeout(() => { waInitPromise = null; initBaileys().catch(e=>console.error('reinit error', e)); }, 3000);
      } else if (connection === 'open') {
        console.log('WA connected (Baileys) - ready to send messages.');
      }
    });

    sock.ev.on('creds.update', saveCreds);

    waSocket = sock;
    return sock;
  })();

  return waInitPromise;
}

// Worker to process queue every SEND_INTERVAL_MS
let workerRunning = false;
function startWorker() {
  if (workerRunning) return;
  workerRunning = true;
  setInterval(async () => {
    if (sendQueue.length === 0) return;
    const job = sendQueue.shift();
    if (!job) return;
    try {
      const sock = await initBaileys();
      if (!sock) throw new Error('WA socket not ready');

      // Build message: you can change to template-type messages if approved
      const text = `Pairing link perangkat Anda: ${job.link}\nLink berlaku ${Math.floor(TOKEN_TTL_MS/60000)} menit.`;
      // Baileys wants phone in format 'countrycodexxx@s.whatsapp.net'
      const jid = job.phone.replace(/\D/g, '') + '@s.whatsapp.net';

      await sock.sendMessage(jid, { text });
      if (job.resolve) job.resolve({ ok: true });
      console.log(`[BAILEYS SENT] to=${job.phone}`);
    } catch (err) {
      if (job.reject) job.reject(err);
      console.error(`[BAILEYS FAILED] to=${job.phone} err=${err.message}`);
    }
  }, SEND_INTERVAL_MS);
}

// Helper: token gen, normalize phone, build link
function genToken(len = 24) {
  return crypto.randomBytes(len).toString('hex');
}
function normalizePhone(p) {
  if (!p) return null;
  return p.replace(/\s+/g, '').replace(/^0/, (m)=>{ /* keep local leading 0, but better require +62 or full e.164 */ return m; });
}
function buildPairLink(req, token) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0];
  const host = req.get('host');
  return `${proto}://${host}${PAIR_PATH}?token=${encodeURIComponent(token)}`;
}
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [t, meta] of tokenStore.entries()) {
    if (meta.expiresAt <= now || meta.used) tokenStore.delete(t);
  }
}
setInterval(cleanupExpiredTokens, 60*1000);

// Exported route
module.exports = {
  name: "Send Pairing Baileys",
  desc: "Generate and send pairing link via Baileys (WhatsApp Web). Requires apikey and consent=yes. Rate-limited (1s).",
  category: "Premium",
  path: "/premium/send-pairing-baileys?apikey=&nomor=&jumlah=&consent=",

  async run(req, res) {
    try {
      const { apikey } = req.query;
      let { nomor, jumlah } = req.query;
      const consent = (req.query.consent || '').toLowerCase();

      // apikey check
      if (!apikey || !global.apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Silahkan Beli Apikey Ke https://t.me/fr3newera Ya, Harga Terjangkau." });
      }

      if (!nomor) return res.json({ status: false, error: "Parameter 'nomor' wajib diisi" });
      nomor = normalizePhone(nomor);
      if (!nomor) return res.json({ status: false, error: "Nomor tidak valid" });

      jumlah = parseInt(jumlah || '1', 10);
      if (!Number.isFinite(jumlah) || jumlah <= 0) jumlah = 1;
      if (jumlah > MAX_PER_JOB) return res.json({ status: false, error: `Jumlah dibatasi maksimum ${MAX_PER_JOB} per request` });

      if (consent !== 'yes') return res.json({ status: false, error: "Penerima harus memberikan izin (consent). Tambahkan param ?consent=yes" });

      // per-number hourly limit
      const now = Date.now();
      const hourMs = 60*60*1000;
      const entry = perNumberStore.get(nomor) || { count: 0, windowStart: now };
      if (now - entry.windowStart > hourMs) { entry.count = 0; entry.windowStart = now; }
      if ((entry.count + jumlah) > MAX_PER_HOUR) {
        return res.json({ status: false, error: `Limit pengiriman tercapai (max ${MAX_PER_HOUR}/jam). Sudah terkirim: ${entry.count}` });
      }

      // queue guard
      if (sendQueue.length + jumlah > MAX_QUEUE) return res.status(503).json({ status: false, error: "Server sibuk. Coba lagi nanti." });

      // generate tokens, store, and enqueue jobs
      const tokensPreview = [];
      const enqueuePromises = [];
      for (let i=0; i<jumlah; i++) {
        const token = genToken(16);
        const createdAt = Date.now();
        const expiresAt = createdAt + TOKEN_TTL_MS;
        tokenStore.set(token, { phone: nomor, createdAt, expiresAt, used: false });
        const link = buildPairLink(req, token);

        const jobPromise = new Promise((resolve, reject) => {
          sendQueue.push({ phone: nomor, link, enqueueAt: Date.now(), resolve, reject });
        });
        enqueuePromises.push(jobPromise);
        tokensPreview.push({ preview: token.slice(0,6)+'....', expiresAt: new Date(expiresAt).toISOString() });
      }

      // reserve per-number
      entry.count += jumlah;
      perNumberStore.set(nomor, entry);

      // start worker
      startWorker();
      // init Baileys early (to prompt QR if needed)
      initBaileys().catch(e => console.error('initBaileys err', e));

      // respond quick (do not return full tokens)
      res.json({
        status: true,
        message: `Pairing link(s) queued for sending to ${nomor} (interval ${SEND_INTERVAL_MS} ms).`,
        queued: jumlah,
        tokens_preview: tokensPreview,
        note: 'Do not share full tokens. Links expire after 10 minutes.'
      });

      // optional: logging on completion
      Promise.allSettled(enqueuePromises).then(results => {
        const ok = results.filter(r=>r.status==='fulfilled').length;
        const fail = results.filter(r=>r.status==='rejected').length;
        console.log(`[BAILEYS QUEUE RESULT] to=${nomor} queued=${jumlah} success=${ok} fail=${fail}`);
      });

    } catch (err) {
      console.error('send-pairing-baileys error', err);
      return res.status(500).json({ status: false, error: err.message });
    }
  }
};
