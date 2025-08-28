const fetch = require("node-fetch");

module.exports = {
  name: "Tebak Game",
  desc: "Tebak nama game dari gambar",
  category: "Games",
  path: "/games/tebakgame",

  async run(req, res) {
    try {
      const r = await fetch("https://api.siputzx.my.id/api/games/tebakgame");
      const b = await r.json();

      if (!b?.data?.img || !b?.data?.jawaban) {
        return res.status(502).json({ status: false, error: "Data dari API tidak valid", detail: b });
      }

      res.json({
        status: true,
        data: {
          img: b.data.img,
          jawaban: b.data.jawaban
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: "Gagal mengambil data", detail: err.message });
    }
  }
};
