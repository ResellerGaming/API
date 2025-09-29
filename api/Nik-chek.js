const axios = require("axios");

module.exports = [
  {
    name: "NIK Checker",
    desc: "Cek detail informasi berdasarkan NIK",
    category: "Tools",
    path: "/tools/nik-checker?nik=",
    async run(req, res) {
      const { nik } = req.query;
      if (!nik) return res.json({ status: false, error: "Parameter 'nik' wajib diisi" });

      try {
        const response = await axios.get(`https://api.siputzx.my.id/api/tools/nik-checker?nik=${nik}`);
        res.json({
          creator: "FR3-NEWERA",
          ...response.data
        });
      } catch (error) {
        res.status(500).json({
          status: false,
          error: "Gagal mengambil data NIK",
          detail: error.message
        });
      }
    }
  }
];
