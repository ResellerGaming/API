const axios = require("axios");

async function shortUrl(links) {
  try {
    const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(links)}`);
    return res.data.toString();
  } catch (error) {
    throw new Error("Failed to shorten the URL");
  }
}

module.exports = {
  name: "TinyURL Shortener",
  desc: "Shorturl by tinyurl",
  category: "Tools",
  path: "/tools/tinyurl?url=",
  async run(req, res) {
    const { url } = req.query;

    if (!url) {
      return res.json({ status: false, error: 'Url is required' });
    }

    try {
      const result = await shortUrl(url);
      res.status(200).json({
        status: true,
        result
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};