const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');

async function snackvideo(url) {
  let data = qs.stringify({
    'ic-request': 'true',
    'id': url,
    'locale': 'id',
    'ic-element-id': 'main_page_form',
    'ic-id': '1',
    'ic-target-id': 'active_container',
    'ic-trigger-id': 'main_page_form',
    'ic-current-url': '/id/how-to-download-snack-video',
    'ic-select-from-response': '#id1',
    '_method': 'POST'
  });

  let config = {
    method: 'POST',
    url: 'https://getsnackvideo.com/results',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 8.1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      'Accept': 'text/html-partial, */*; q=0.9',
      'accept-language': 'id-ID',
      'referer': 'https://getsnackvideo.com/id/how-to-download-snack-video',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-ic-request': 'true',
      'x-http-method-override': 'POST',
      'x-requested-with': 'XMLHttpRequest',
      'origin': 'https://getsnackvideo.com'
    },
    data: data
  };

  const response = await axios.request(config);
  const $ = cheerio.load(response.data);

  const downloadUrl = $('.download_link.without_watermark').attr('href');
  const thumbnail = $('.img_thumb img').attr('src');

  if (!downloadUrl) throw new Error('Download URL not found');

  return {
    thumbnail: thumbnail || null,
    downloadUrl,
    mimetype: 'video/mp4'
  };
}

module.exports = {
  name: "Snackvideo",
  desc: "Snackvideo downloader",
  category: "Downloader",
  path: "/download/snackvideo?url=",
  async run(req, res) {
    const { url } = req.query;

    if (!url) {
      return res.json({ status: false, error: "Url is required" });
    }

    try {
      const result = await snackvideo(url);
      res.status(200).json({
        status: true,
        result
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message
      });
    }
  }
};