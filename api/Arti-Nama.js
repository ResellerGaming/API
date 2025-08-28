const fetch = require("node-fetch");

module.exports = {
  name: "ArtiNama",
  desc: "Cek arti nama via Siputzx",
  category: "Random",
  path: "/random/namameaning?nama=",

  async run(req, res) {
    const { nama } = req.query;
    if (!nama) return res.json({ status: false, error: "Masukkan nama. Contoh: ?nama=Rasya" });

    try {
      const response = await fetch(`https://api.siputzx.my.id/api/primbon/artinama?nama=${encodeURIComponent(nama)}`);
      const result = await response.json();

      const arti = result?.data?.arti || result?.arti || "Tidak ditemukan arti nama.";

      res.json({ status: true, input: nama, arti });
    } catch (err) {
      res.status(500).json({ status: false, error: "Gagal koneksi ke API Arti Nama", detail: err.message });
    }
  }
};
