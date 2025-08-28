const fetch = require("node-fetch");

module.exports = {
  name: "Tebak JKT48",
  desc: "Game tebak member JKT48",
  category: "Games",
  path: "/games/tebakjkt",

  async run(req, res) {
    try {
      const response = await fetch("https://api.siputzx.my.id/api/games/tebakjkt");
      const body = await response.json();

      if (!body || body.status !== true || !body.data) {
        return res.status(502).json({ status: false, error: "Data dari API tidak valid", detail: body });
      }

      // langsung passing data yang diterima
      return res.json({
        status: true,
        data: {
          index: body.data.index ?? null,
          gambar: body.data.gambar,
          jawaban: body.data.jawaban
        }
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        error: "Gagal mengambil data dari API",
        detail: err.message
      });
    }
  }
};
