const yt = require("yt-search");

module.exports = {
  name: "Youtube Search",
  desc: "Search video youtube",
  category: "Search",
  path: "/search/youtube?q=",
  async run(req, res) {
    const { q } = req.query;

    if (!q) {
      return res.json({ status: false, error: "Query is required" });
    }

    try {
      const results = await yt(q);
      res.status(200).json({
        status: true,
        result: results.all
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};