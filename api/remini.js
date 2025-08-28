const axios = require('axios');
const qs = require('qs');
const { fromBuffer } = require('file-type');

async function uploadToPxpic(buffer) {
  const { ext, mime } = await fromBuffer(buffer) || {};
  const fileName = `${Date.now()}.${ext}`;
  const { data } = await axios.post('https://pxpic.com/getSignedUrl', {
    folder: 'uploads',
    fileName
  }, { headers: { 'Content-Type': 'application/json' } });
  await axios.put(data.presignedUrl, buffer, { headers: { 'Content-Type': mime } });
  return `https://files.fotoenhancer.com/uploads/${fileName}`;
}

async function createPxpicImage(buffer, type = "removebg") {
  const url = await uploadToPxpic(buffer);
  const data = qs.stringify({
    imageUrl: url,
    targetFormat: 'png',
    needCompress: 'no',
    imageQuality: '100',
    compressLevel: '6',
    fileOriginalExtension: 'png',
    aiFunction: type,
    upscalingLevel: ''
  });
  const result = await axios.post('https://pxpic.com/callAiFunction', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return result.data?.resultImageUrl;
}

module.exports = [
{
  name: "Removebg",
  desc: "Remove background image",
  category: "Imagecreator",
  path: "/imagecreator/removebg?url=",
  async run(req, res) {
    const { url } = req.query;
    if (!url) return res.json({ status: false, error: "Url is required" });
    try {
      const buffer = await getBuffer(url);
      const result = await createPxpicImage(buffer, "removebg");
      if (!result) throw new Error("Gagal mendapatkan hasil removebg");
      res.status(200).json({ status: true, result });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  }
}, 
{
  name: "Remini",
  desc: "HD quality image",
  category: "Imagecreator",
  path: "/imagecreator/remini?url=",
  async run(req, res) {
    const { url } = req.query;
    if (!url) return res.json({ status: false, error: "Url is required" });
    try {
      const buffer = await getBuffer(url);
      const result = await createPxpicImage(buffer, "upscale");
      if (!result) throw new Error("Gagal mendapatkan hasil remini");
      res.status(200).json({ status: true, result });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  }
}
]
