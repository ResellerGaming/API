const axios = require('axios');
const FormData = require('form-data');

async function imglarger(buffer, options = {}) {
    const { scale = '2', type = 'upscale' } = options;
    
    const config = {
        scales: ['2', '4'],
        types: { upscale: 13, enhance: 2, sharpener: 1 }
    };
    
    if (!Buffer.isBuffer(buffer)) throw new Error('Image buffer is required');
    if (!config.types[type]) throw new Error(`Available types: ${Object.keys(config.types).join(', ')}`);
    if (type === 'upscale' && !config.scales.includes(scale.toString())) throw new Error(`Available scales: ${config.scales.join(', ')}`);
    
    try {
        const form = new FormData();
        form.append('file', buffer, `rynn_${Date.now()}.jpg`);
        form.append('type', config.types[type].toString());
        if (!['sharpener'].includes(type)) form.append('scaleRadio', type === 'upscale' ? scale.toString() : '1');
        
        const { data: p } = await axios.post('https://photoai.imglarger.com/api/PhoAi/Upload', form, {
            headers: {
                ...form.getHeaders(),
                accept: 'application/json, text/plain, */*',
                origin: 'https://imglarger.com',
                referer: 'https://imglarger.com/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
            }
        });
        if (!p.data.code) throw new Error('Upload failed - no code received');
        
        while (true) {
            const { data: r } = await axios.post('https://photoai.imglarger.com/api/PhoAi/CheckStatus', {
                code: p.data.code,
                type: config.types[type]
            }, {
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json',
                    origin: 'https://imglarger.com',
                    referer: 'https://imglarger.com/',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
                }
            });
            
            if (r.data.status === 'waiting') continue;
            if (r.data.status === 'success') return r.data.downloadUrls[0];
            await new Promise(res => setTimeout(res, 2000));
        }
        
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }
}


module.exports = {
  name: "Upscale",
  desc: "Upscale quality images",
  category: "Imagecreator",
  path: "/imagecreator/upscale?url=",
  async run(req, res) {
    const { url } = req.query;
    if (!url) return res.json({ status: false, error: "Url is required" });
    try {
      const images = await getBuffer(url)
      const result = await imglarger(images, { scale: '2' });
      if (!result) throw new Error("Gagal mendapatkan hasil upscale");
      res.status(200).json({ status: true, result });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  }
}
