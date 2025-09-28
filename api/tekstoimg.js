const axios    = require('axios');
const FormData = require('form-data');
const fetch    = require('node-fetch');

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

async function scrapeLinangData({ prompt, negativePrompt = '', preset = 'anime', orientation = 'portrait', seed = '' }) {
  if (!prompt) throw new Error('Prompt harus diisi!');
  if (!presets.includes(preset)) throw new Error('Preset tidak valid!');
  if (!sizes[orientation]) throw new Error('Ukuran tidak valid!');

  const form = new FormData();
  form.append('prompt', prompt);
  form.append('negativePrompt', negativePrompt);
  form.append('preset', preset);
  form.append('orientation', orientation);
  form.append('seed', seed);

  const { data } = await axios.post('https://linangdata.com/text-to-image-ai/stablefusion-v2.php', form, {
    headers: { ...form.getHeaders(), accept: 'application/json', 'x-requested-with': 'XMLHttpRequest' }
  });

  if (!data?.image) throw new Error('Response tidak berisi gambar');

  const buffer = Buffer.from(data.image, 'base64');
  const url = await uploadBuffer(buffer, data.filename || 'linang.png');
  return { success: true, url, preset, size: sizes[orientation] };
}

module.exports = {
  name: 'LinangAI',
  desc: 'Generate AI image dari teks menggunakan LinangData (no disk write)',
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
