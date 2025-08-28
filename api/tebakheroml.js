const fetch = require("node-fetch");

module.exports = {
  name: "Tebak Hero ML",
  desc: "Game tebak hero Mobile Legends",
  category: "Games",
  path: "/games/tebakheroml",

  async run(req, res) {
    try {
      const response = await fetch("https://api.siputzx.my.id/api/games/tebakheroml");
      const body = await response.json();

      const hero = body?.data;

      if (!hero || !hero.name || !hero.audio) {
        return res.status(502).json({
          status: false,
          error: "Data dari API tidak valid atau tidak lengkap",
          detail: body
        });
      }

      res.json({
        status: true,
        data: {
          name: hero.name,
          audio: hero.audio
        }
      });

    } catch (err) {
      res.status(500).json({
        status: false,
        error: "Gagal mengambil data dari API",
        detail: err.message
      });
    }
  }
};
