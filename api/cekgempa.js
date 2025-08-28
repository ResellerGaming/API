const fetch = require("node-fetch");

module.exports = {
  name: "Cek Gempa",
  desc: "Cek info gempa terkini dari BMKG",
  category: "Tools",
  path: "/tools/cekgempa",

  async run(req, res) {
    try {
      const response = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json");
      const data = await response.json();

      if (!data.Infogempa || !data.Infogempa.gempa || data.Infogempa.gempa.length === 0) {
        return res.json({ status: false, error: "Data gempa tidak ditemukan." });
      }

      const latest = data.Infogempa.gempa[0];

      res.json({
        status: true,
        lokasi: latest.Wilayah,
        tanggal: latest.Tanggal,
        waktu: latest.Jam,
        magnitude: latest.Magnitude,
        kedalaman: latest.Kedalaman,
        koordinat: latest.Coordinates,
        dirasakan: latest.Dirasakan,
        potensi: latest.Potensi
      });

    } catch (err) {
      res.status(500).json({ status: false, error: "Gagal mengambil data BMKG", detail: err.message });
    }
  }
};
