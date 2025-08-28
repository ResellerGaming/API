const api = require('ab-downloader');

module.exports = {
    name: "Twitter",
    desc: "Twitter Downloader",
    category: "Downloader",
    path: "/download/twitter?url=",
    async run(req, res) {
      try {
        const { url } = req.query;
        if (!url)
          return res.json({ status: false, error: "Url is required" });

        const results = await api.twitter(url)
        res.status(200).json({
          status: true,
          result: results.url,
        });
      } catch (error) {
        res.status(500).json({ status: false, error: error.message });
      }
    }
}