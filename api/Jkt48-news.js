const fetch = require("node-fetch");

module.exports = {
  name: "JKT48 News",
  desc: "Ambil berita terbaru dari API JKT48",
  category: "Berita",
  path: "/berita/jkt48news",

  async run(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const response = await fetch("https://api.siputzx.my.id/api/berita/jkt48");
      const data = await response.json();

      if (!data.status || !data.data || data.data.length === 0) {
        return res.json({ status: false, error: "Tidak ada berita ditemukan" });
      }

      const berita = data.data.slice(0, limit);

      res.json({
        creator: "FR3-NEWERA",
        status: true,
        data: berita,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        error: "Gagal mengambil data dari API JKT48",
        detail: err.message
      });
    }
  }
};
