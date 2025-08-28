const fetch = require("node-fetch");

module.exports = {
  name: "CekCuaca",
  desc: "Cek kondisi cuaca terkini berdasarkan nama kota",
  category: "Tools",
  path: "/tools/cekcuaca?kota=",

  async run(req, res) {
    const { kota } = req.query;

    if (!kota) {
      return res.json({ status: false, error: "Masukkan nama kota. Contoh: ?kota=Jakarta" });
    }

    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(kota)}?format=j1`);
      const data = await response.json();

      const cuaca = data?.current_condition?.[0];
      if (!cuaca) return res.json({ status: false, error: "Data cuaca tidak ditemukan." });

      res.json({
        status: true,
        kota: data?.nearest_area?.[0]?.areaName?.[0]?.value || kota,
        suhu: `${cuaca.temp_C}°C`,
        deskripsi: cuaca.weatherDesc[0].value,
        kelembaban: `${cuaca.humidity}%`,
        angin: `${cuaca.windspeedKmph} km/j`,
        tekanan: `${cuaca.pressure} hPa`,
        visibility: `${cuaca.visibility} km`,
        update: cuaca.observation_time + " UTC"
      });

    } catch (err) {
      res.status(500).json({ status: false, error: "Gagal mengambil data cuaca", detail: err.message });
    }
  }
};
