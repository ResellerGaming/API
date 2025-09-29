module.exports = {
  name: "Pairing Code Simulator",
  desc: "Generate pairing codes for testing (does NOT send WA). Premium (dev/test).",
  category: "Premium",
  path: "/premium/pairing-sim?apikey=&nomor=&jumlah=",

  async run(req, res) {
    try {
      const { apikey, nomor } = req.query;
      let jumlah = parseInt(req.query.jumlah || "1", 10);

      // validate apikey via global.apikey loaded in index.js
      if (!apikey || !global.apikey || !global.apikey.includes(apikey)) {
        return res.json({
          status: false,
          error: "Silahkan Beli Apikey Ke https://t.me/fr3newera Ya, Harga Terjangkau."
        });
      }

      if (!nomor) return res.json({ status: false, error: "Parameter 'nomor' wajib diisi" });

      if (!Number.isFinite(jumlah) || jumlah < 1) jumlah = 1;
      if (jumlah > 5000) { // safety cap for simulator
        return res.json({ status: false, error: "Jumlah terlalu besar (max 5000 untuk simulator)" });
      }

      // Generate pairing codes (6-digit) and deterministic id/timestamp
      const codes = [];
      const now = Date.now();
      for (let i = 0; i < jumlah; i++) {
        // simple secure-ish random 6-digit code
        const code = String(Math.floor(100000 + Math.random() * 900000));
        codes.push({
          nomor,
          code,
          ttl_seconds: 300, // typical pairing TTL
          created_at: new Date(now + i).toISOString()
        });
      }

      return res.json({
        status: true,
        message: "Pairing codes generated (SIMULATOR). Codes are NOT sent to the phone.",
        requested: jumlah,
        nomor,
        codes
      });
    } catch (err) {
      return res.status(500).json({ status: false, error: err.message });
    }
  }
};
