const fetch = require("node-fetch");

module.exports = {
  name: "CekSholat",
  desc: "Cek jadwal sholat berdasarkan nama kota",
  category: "Tools",
  path: "/tools/ceksholat?kota=",

  async run(req, res) {
    const { kota } = req.query;

    if (!kota) {
      return res.json({ status: false, error: "Masukkan nama kota. Contoh: ?kota=Jakarta" });
    }

    try {
      const search = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(kota)}`);
      const searchData = await search.json();

      if (!searchData.status || !searchData.data?.length) {
        return res.json({ status: false, error: "Kota tidak ditemukan dalam database API." });
      }

      const kotaData = searchData.data[0];
      const idKota = kotaData.id;
      const today = new Date().toISOString().split("T")[0];
      const jadwalRes = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${idKota}/${today}`);
      const jadwalData = await jadwalRes.json();

      if (!jadwalData.status) {
        return res.json({ status: false, error: "Jadwal sholat tidak ditemukan." });
      }

      const jadwal = jadwalData.data.jadwal;

      res.json({
        status: true,
        kota: kotaData.lokasi,
        tanggal: jadwal.tanggal,
        imsyak: jadwal.imsak,
        subuh: jadwal.subuh,
        terbit: jadwal.terbit,
        dhuha: jadwal.dhuha,
        dzuhur: jadwal.dzuhur,
        ashar: jadwal.ashar,
        maghrib: jadwal.maghrib,
        isya: jadwal.isya
      });

    } catch (err) {
      res.status(500).json({ status: false, error: "Gagal mengambil data jadwal sholat", detail: err.message });
    }
  }
};
