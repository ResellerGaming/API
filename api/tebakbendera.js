const fetch = require("node-fetch");

module.exports = {
  name: "TebakBendera",
  desc: "Tebak nama negara dari benderanya",
  category: "Games",
  path: "/games/tebakbendera",

  async run(req, res) {
    try {
      const r = await fetch("https://api.siputzx.my.id/api/games/tebakbendera");
      const b = await r.json();

      if (!b?.name || !b?.img) {
        return res.status(502).json({ status: false, error: "Data dari API tidak valid", detail: b });
      }

      res.json({
        status: true,
        data: {
          name: b.name,
          img: b.img
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: "Gagal mengambil data", detail: err.message });
    }
  }
};
