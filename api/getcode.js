const fetch = require("node-fetch");
const cheerio = require("cheerio");

module.exports = {
  name: "Get Code",
  desc: "Ambil source code HTML, CSS, dan JS dari sebuah URL",
  category: "Tools",
  path: "/tools/getcode?url=",
  async run(req, res) {
    const { url } = req.query;
    if (!url) return res.json({ status: false, error: "Parameter url wajib diisi" });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Gagal mengambil URL: ${response.status} ${response.statusText}`);
      const html = await response.text();

      const $ = cheerio.load(html);
      const cssLinks = [];
      const jsLinks = [];

      $("link[rel='stylesheet']").each((_, el) => {
        const href = $(el).attr("href");
        if (href) cssLinks.push(new URL(href, url).href);
      });

      $("script[src]").each((_, el) => {
        const src = $(el).attr("src");
        if (src) jsLinks.push(new URL(src, url).href);
      });

      res.json({
        status: true,
        result: {
          html,
          css: cssLinks,
          js: jsLinks,
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
