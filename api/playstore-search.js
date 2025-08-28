const axios = require("axios");
const cheerio = require("cheerio");

async function PlayStore(search) {
  try {
    const { data } = await axios.get(`https://play.google.com/store/search?q=${encodeURIComponent(search)}&c=apps`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const $ = cheerio.load(data);
    const hasil = [];

    $('a[href^="/store/apps/details?id="]').each((_, el) => {
      const link = `https://play.google.com${$(el).attr("href")}`;
      const nama = $(el).find('div.DdYX5c span').first().text() || "No name";
      const developer = $(el).find('div.wMUdtb').first().text() || "No developer";
      const rate = $(el).find('span.w2kbF').attr('aria-label') || "No rating";
      const rate2 = $(el).find('span.w2kbF').text() || "No rating text";

      hasil.push({
        nama,
        developer,
        rate,
        rate2,
        link,
        img: "https://files.catbox.moe/dklg5y.jpg",
        link_dev: `https://play.google.com/store/apps/developer?id=${encodeURIComponent(developer)}`
      });
    });

    return hasil.slice(0, Math.max(3, Math.min(5, hasil.length)));
  } catch (err) {
    throw new Error("Gagal mengambil data dari Play Store");
  }
}

module.exports = {
  name: "Playstore Search",
  desc: "Search apk playstore",
  category: "Search",
  path: "/search/playstore?q=",
  async run(req, res) {
    const { q } = req.query;

    if (!q) {
      return res.json({ status: false, error: "Query is required" });
    }

    try {
      const result = await PlayStore(q);
      if (!result.length) return res.json({ status: false, error: "No results found" });

      res.json({
        status: true,
        result
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};