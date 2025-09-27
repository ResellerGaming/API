const axios = require('axios');
const crypto = require('crypto');

/* ---------- class wrapper ---------- */
class ElevenLabs {
  constructor() {
    this.ins = axios.create({
      baseURL: 'https://tts1.squinty.art/api/v1',
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'user-agent': 'NX/1.0.0'
      }
    });
  }

  /* utils */
  randHex = (l) => crypto.randomUUID().replace(/-/g, '').slice(0, l);
  randNum = (d) => String(Math.floor(Math.random() * 10 ** d)).padStart(d, '0');
  getRand = (a, b) => (~~(Math.random() * (~~b - ~~a + 1)) + ~~a);

  /* generate fake user */
  genLogin() {
    const b = this.getRand(0, 4);
    const [
      devices,
      country,
      lang,
      zone,
      fnList,
      lnList
    ] = [
      ['Samsung Galaxy S25 Ultra', 'Google Pixel 10', 'OnePlus 13', 'Xiaomi 15 Ultra', 'Oppo Find X8 Pro'],
      ['ID', 'VN', 'PH', 'MM', 'JP'],
      ['id', 'vi', 'en', 'my', 'jp'],
      ['Asia/Jakarta', 'Asia/Ho_Chi_Minh', 'Asia/Manila', 'Asia/Yangon', 'Asia/Tokyo'],
      ['Hiro', 'Yuki', 'Sora', 'Riku', 'Kaito'],
      ['Tanaka', 'Sato', 'Nakamura', 'Kobayashi', 'Yamamoto']
    ];
    const fn = fnList[Math.floor(Math.random() * fnList.length)];
    const ln = lnList[Math.floor(Math.random() * lnList.length)];

    return {
      build: '14',
      country: country[b],
      deviceId: this.randHex(16),
      deviceModel: devices[this.getRand(0, devices.length - 1)],
      displayName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}${this.randNum(4)}${this.randHex(4)}@gmail.com`,
      googleAccountId: this.randNum(18),
      language: lang[b],
      osVersion: String(26 + Math.floor(Math.random() * 4)),
      platform: 'android',
      timeZone: zone[b],
      version: '1.1.4'
    };
  }

  /* auth */
  async login() {
    const { data } = await this.ins.post('/login/login', this.genLogin());
    this.ins.defaults.headers.common.authorization = `Bearer ${data.token}`;
    return data.token;
  }

  /* TTS */
  async create({ text = 'hello', id = '2EiwWnXFnvU5JabPnv8n', model = 'eleven_turbo_v2_5', exaggeration = '50', clarity = '50', stability = '50' } = {}) {
    const { data } = await this.ins.post('/generate/generate', {
      text,
      voiceId: id,
      modelId: model,
      styleExaggeration: exaggeration,
      claritySimilarityBoost: clarity,
      stability
    });
    return data;
  }
}

/* ---------- route handler ---------- */
module.exports = {
  name: 'ElevenLabs',
  desc: 'Generate TTS mp3 dari teks (voiceId otomatis)',
  category: 'AI',
  path: '/ai/elevenlabs?teks=', // <-- tidak ada ? ataupun query
  async run(req, res) {
    // hanya menerima ?teks=...
    const { teks } = req.query;
    if (!teks) {
      return res.status(400).json({ status: false, error: 'Parameter teks diperlukan' });
    }

    try {
      const el = new ElevenLabs();
      await el.login();

      // voiceId & parameter lain sudah diisi di sini
      const result = await el.create({
        text: teks,
        id: '2EiwWnXFnvU5JabPnv8n', // default voice
        model: 'eleven_turbo_v2_5',
        exaggeration: '50',
        clarity: '50',
        stability: '50'
      });

      res.json({ status: true, result });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message || 'Gagal generate TTS' });
    }
  }
};
