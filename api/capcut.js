const axios = require('axios');
const cheerio = require('cheerio');

async function capcutdl(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const videoElement = $('video.player-o3g3Ag');
    const videoSrc = videoElement.attr('src');
    const posterSrc = videoElement.attr('poster');
    const title = $('h1.template-title').text().trim();
    const actionsDetail = $('p.actions-detail').text().trim();
    const [date, uses, likes] = actionsDetail.split(',').map(item => item.trim());
    const authorAvatar = $('span.lv-avatar-image img').attr('src');
    const authorName = $('span.lv-avatar-image img').attr('alt');

    if (!videoSrc) throw new Error('Video URL not found');

    return {
      title: title || 'Unknown Title',
      date: date || 'Unknown Date',
      pengguna: uses || 'Unknown Uses',
      likes: likes || 'Unknown Likes',
      author: {
        name: authorName || 'Unknown Author',
        avatarUrl: authorAvatar || null
      },
      videoUrl: videoSrc,
      posterUrl: posterSrc || null
    };
  } catch (error) {
    throw new Error('Failed to fetch Capcut data: ' + error.message);
  }
}

module.exports = {
  name: "Capcut",
  desc: "Capcut video downloader",
  category: "Downloader",
  path: "/download/capcut?url=",
  async run(req, res) {
    const { url } = req.query;
    if (!url) {
      return res.json({ status: false, error: 'Url is required' });
    }

    try {
      const results = await capcutdl(url);
      res.status(200).json({
        status: true,
        result: results
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message
      });
    }
  }
};