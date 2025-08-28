const fetch = require("node-fetch");

module.exports = {
  name: "Karakter Free Fire",
  desc: "Tebak karakter Free Fire dari gambar",
  category: "Games",
  path: "/games/karakterfreefire",

  async run(req, res) {
    try {
      const r = await fetch("https://api.siputzx.my.id/api/games/karakter-freefire");
      const b = await r.json();

      if (!b?.data?.name || !b?.data?.gambar) {
        return res.status(502).json({ status: false, error: "Data dari API tidak valid", detail: b });
      }

      res.json({
        status: true,
        data: {
          index: b.data.index ?? null,
          name: b.data.name,
          gambar: b.data.gambar
        }
      });
    } catch (err) {
      res.status(500).json({ status: false, error: "Gagal mengambil data", detail: err.message });
    }
  }
};
