import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

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
  square: "1024x1024",
  portrait: "768x1024",
  landscape: "1024x768",
  widescreen: "1280x720",
  ultra: "1536x1536"
};

async function uploadUguu(filePath) {
  const form = new FormData();
  form.append("files[]", fs.createReadStream(filePath));
  const res = await fetch("https://uguu.se/upload", { method: "POST", body: form, headers: form.getHeaders() });
  const data = await res.json();
  return Array.isArray(data) ? data[0].url : data.files?.[0];
}

async function scrapeLinangData({ prompt, negativePrompt = "", preset = "anime", orientation = "portrait", seed = "" }) {
  if (!prompt) throw new Error("Prompt harus diisi!");
  if (!presets.includes(preset)) throw new Error(`Preset tidak valid! Pilih salah satu: ${presets.join(", ")}`);
  if (!sizes[orientation]) throw new Error(`Size tidak valid! Pilih salah satu: ${Object.keys(sizes).join(", ")}`);

  const form = new FormData();
  form.append("prompt", prompt);
  form.append("negativePrompt", negativePrompt);
  form.append("preset", preset);
  form.append("orientation", orientation);
  form.append("seed", seed);

  const res = await axios.post("https://linangdata.com/text-to-image-ai/stablefusion-v2.php", form, {
    headers: { ...form.getHeaders(), accept: "application/json, text/plain, */*", "x-requested-with": "XMLHttpRequest", referer: "https://linangdata.com/text-to-image-ai/" }
  });

  const { filename, image } = res.data || {};
  if (!image) throw new Error("Response tidak berisi gambar");

  const buffer = Buffer.from(image, "base64");
  const filePath = path.join(process.cwd(), filename || `linang_${Date.now()}.png`);
  fs.writeFileSync(filePath, buffer);
  const url = await uploadUguu(filePath);
  fs.unlinkSync(filePath);

  return { success: true, url, preset, size: sizes[orientation] };
}

/* ---------- route handler ---------- */
export default {
  name: "LinangAI",
  desc: "Generate AI image dari teks menggunakan LinangData",
  category: "AI",
  path: "/ai/linang?prompt=",
  async run(req, res) {
    try {
      const { prompt, negative = "", preset = "anime", orientation = "portrait", seed = "" } = req.query;

      if (!prompt) {
        return res.status(400).json({ status: false, error: "Parameter prompt diperlukan" });
      }

      const result = await scrapeLinangData({
        prompt,
        negativePrompt: negative,
        preset,
        orientation,
        seed
      });

      if (!result.success) {
        return res.status(500).json({ status: false, error: result.error });
      }

      res.json({
        status: true,
        creator: "Reseller Gaming",
        prompt,
        preset: result.preset,
        size: result.size,
        url: result.url
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
