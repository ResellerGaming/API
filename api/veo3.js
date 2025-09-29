const axios = require('axios');
const crypto = require('crypto');

/* ---------- logic ---------- */
async function veo3(prompt, { image = null } = {}) {
  if (!prompt) throw new Error('Prompt is required');

  // 1. bypass turnstile
  const { data: cf } = await axios.post('https://cf.nekolabs.my.id/action', {
    mode: 'turnstile-min',
    siteKey: '0x4AAAAAAANuFg_hYO9YJZqo',
    url: 'https://aivideogenerator.me/features/g-ai-video-generator'
  });

  const num = Math.floor(Math.random() * 100) + 1700;
  const uid = crypto.createHash('md5').update(Date.now().toString()).digest('hex');

  // 2. buat task
  const { data: task } = await axios.post('https://aiarticle.erweima.ai/api/v1/secondary-page/api/create', {
    prompt: prompt,
    imgUrls: image ? [image] : [],
    quality: '720p',
    duration: 8,
    autoSoundFlag: false,
    soundPrompt: '',
    autoSpeechFlag: false,
    speechPrompt: '',
    speakerId: 'Auto',
    aspectRatio: '16:9',
    secondaryPageId: num,
    channel: 'VEO3',
    source: 'aivideogenerator.me',
    type: 'features',
    watermarkFlag: true,
    privateFlag: true,
    isTemp: true,
    vipFlag: true,
    model: 'veo-3-fast'
  }, {
    headers: { uniqueid: uid, verify: cf.token }
  });

  // 3. polling hasil
  while (true) {
    const { data } = await axios.get(`https://aiarticle.erweima.ai/api/v1/secondary-page/api/${task.data.recordId}`, {
      headers: { uniqueid: uid, verify: cf.token }
    });

    if (data.data.state === 'fail') throw new Error(JSON.parse(data.data.completeData)?.message || 'Task failed');
    if (data.data.state === 'success') return JSON.parse(data.data.completeData);
    await new Promise(res => setTimeout(res, 1000));
  }
}

/* ---------- route handler ---------- */
module.exports = {
  name: 'Veo3Video',
  desc: 'Generate video dari teks/image via VEO-3 Fast',
  category: 'AI',
  path: '/ai/veo3?prompt=&image=',
  async run(req, res) {
    try {
      const { prompt, image } = req.query;
      if (!prompt) return res.status(400).json({ status: false, error: 'Parameter prompt diperlukan' });

      const result = await veo3(prompt, { image: image || null });

      res.json({ status: true, creator: 'RESMING-NEWERA', prompt, image: image || null, result });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  }
};
