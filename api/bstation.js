const axios = require("axios")

const saa = {
  'Content-Type': 'application/json',
  'Origin': 'https://www.saveplays.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' 
}

function formatResponse(source, title, urls) {
  return {
    status: true,
    source,
    title,
    results: urls.map(v => ({
      quality: v.quality || v.resolution || 'unknown',
      ext: v.ext || (v.url.includes('.mp4') ? 'mp4' : 'unknown'),
      url: v.url.startsWith('/')
        ? `https://www.saveplays.com${v.url}`
        : v.url
    }))
  }
}

 async function Bilibili(url) {
  if (!/bilibili|b23\.tv/.test(url)) return { status: false, message: 'link bukan Bilibili' }

  try {
    const { data } = await axios.post(
      'https://www.saveplays.com/api/bilibili-downloader',
      { url },
      {
        headers: {
          ...saa,
          Referer: 'https://www.saveplays.com/bilibili-downloader/'
        }
      }
    )

    if (!data.downloadUrls) return { status: false, message: 'ga ada respon', raw: data }

    return formatResponse('bilibili', data.title, data.downloadUrls)
  } catch (e) {
    return {
      status: false,
      message: 'Gagal mengambil dari Bilibili',
      error: e.response?.data || e.message
    }
  }
}

module.exports = {
  name: "Bstation",
  desc: "Bstation Downloader",
  category: "Downloader",
  path: "/download/bstation?url=",
  async run(req, res) {
    const { url } = req.query;

    if (!url) {
      return res.json({ status: false, error: "Url is required" });
    }

    try {
      const resu = await Bilibili(url);
      let dat = resu.results
      res.status(200).json({
        status: true,
        result: dat
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};