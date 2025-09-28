/* -------------- DEPENDENSI -------------- */
const axios    = require('axios');
const FormData = require('form-data');
const fetch    = require('node-fetch');

/* -------------- KONFIGURASI -------------- */
const presets = [
  "none", "3d-model", "abstract", "advertising", "alien", "analog-film", "anime", "architectural",
  "artnouveau", "baroque", "black-white-film-portrait", "cinematic", "collage", "comic-book",
  "craft-clay", "cubist", "dark-portrait-realism", "dark-realism", "digital-art", "disco",
  "dreamscape", "dystopian", "enhance", "fairy-tale", "fantasy-art", "fighting-game", "filmnoir",
  "flat-papercut", "food-photography", "gothic", "graffiti", "grunge", "gta", "hdr", "horror",
  "hyperrealism", "impressionist", "industrialfashion", "isometric-style", "light-portrait-realism",
  "light-realism", "line-art", "long-exposure", "minecraft", "minimalist", "monochrome", "nautical",
  "neon-noir", "neon-punk", "origami", "paper-mache", "papercut-collage", "papercut-shadow-box",
  "photographic", "pixel-art", "pointillism", "pokémon", "pop-art", "psychedelic", "real-estate",
  "renaissance", "retro-arcade", "retro-game", "romanticism", "rpg-fantasy-game", "silhouette",
  "space", "stacked-papercut", "stained-glass", "steampunk", "strategy-game", "street-fighter",
  "super-mario", "surrealist", "techwear-fashion", "texture", "thick-layered-papercut", "tilt-shift",
  "tribal", "typography", "vintagetravel", "watercolor"
];

const sizes = {
  square   : "1024x1024",
  portrait : "768x1024",
  landscape: "1024x768",
  widescreen:"1280x720",
  ultra    : "1536x1536"
};

/* -------------- FUNGSI UPLOAD -------------- */
async function uploadBuffer(buffer, fileName = 'image.png') {
  const form = new FormData();
  form.append('files[]', buffer, { filename: fileName });
  const res = await fetch('https://uguu.se/upload', {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });
  const data = await res.json();
  return Array.isArray(data) ? data[0].url : data.files?.[0];
}

/* -------------- FUNGSI UTAMA -------------- */
async function scrapeLinangData({ prompt, negativePrompt = '', preset = 'anime', orientation = 'portrait', seed = '' }) {
  if (!prompt) throw new Error('Prompt harus diisi!');
  if (!presets.includes(preset)) throw new Error('Preset tidak valid!');
  if (!sizes[orientation]) throw new Error('Ukuran tidak valid!');

  /* 1. Ambil cookie & UA */
  const home = await axios.get('https://linangdata.com/text-to-image-ai/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const cookie = home.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';

  /* 2. Kirim form */
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('negativePrompt', negativePrompt);
  form.append('preset', preset);
  form.append('orientation', orientation);
  form.append('seed', seed);

  const res = await axios.post('https://linangdata.com/text-to-image-ai/stablefusion-v2.php', form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://linangdata.com/text-to-image-ai/',
      'Cookie': cookie
    },
    timeout: 15000
  });

  if (!res.data?.image) throw new Error('Response tidak berisi gambar');

  const url = await uploadBuffer(Buffer.from(res.data.image, 'base64'), res.data.filename || 'linang.png');
  return { success: true, url, preset, size: sizes[orientation] };
}

/* -------------- ROUTE HANDLER -------------- */
module.exports = {
  name: 'LinangAI',
  desc: 'Generate AI image dari teks menggunakan LinangData (full-header, no-disk)',
  category: 'AI',
  path: '/ai/linang?prompt=',
  async run(req, res) {
    try {
      const { prompt, negative = '', preset = 'anime', orientation = 'portrait', seed = '' } = req.query;
      if (!prompt) return res.status(400).json({ status: false, error: 'Parameter prompt diperlukan' });

      const result = await scrapeLinangData({ prompt, negativePrompt: negative, preset, orientation, seed });
      res.json({ status: true, creator: 'RESMING-NEWERA', prompt, preset: result.preset, size: result.size, url: result.url });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
