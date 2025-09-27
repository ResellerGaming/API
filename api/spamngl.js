const fetch = require("node-fetch");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function spamngl(link, pesan, jumlah, delayMs = 1000) {
  if (!link.startsWith("https://ngl.link/"))
    throw new Error("Link NGL tidak valid");
  if (!pesan) throw new Error("Pesan tidak boleh kosong");
  if (isNaN(jumlah) || jumlah < 1)
    throw new Error("Jumlah minimal harus lebih dari 0");
  const username = link.split("https://ngl.link/")[1];
  if (!username) throw new Error("Username NGL tidak ditemukan");

  for (let i = 0; i < jumlah; i++) {
    try {
      await fetch("https://ngl.link/api/submit", {
        method: "POST",
        headers: {
          accept: "*/*",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: `username=${username}&question=${encodeURIComponent(pesan)}&deviceId=1`,
      });
      await delay(delayMs);
    } catch (err) {
      console.error("Gagal kirim:", err.message);
    }
  }
  return `Sukses mengirim ${jumlah} pesan ke ${username} dengan delay ${delayMs}ms`;
}

module.exports = {
  name: "SpamNGL",
  desc: "Spam pesan ke NGL (ngl.link)",
  category: "Tools",
  path: "/tools/spamngl?link=&jumlah=&pesan&delay",
  async run(req, res) {
    try {
      const { link, jumlah, pesan, delay = 1000 } = req.query;

      if (!link || !jumlah || !pesan) {
        return res.status(400).json({
          status: false,
          creator: "Reseller Gaming",
          error: "Parameter 'link', 'jumlah', dan 'pesan' wajib diisi",
          example: "/tools/spamngl?link=https://ngl.link/username&jumlah=3&pesan=halo&delay=2000",
        });
      }

      const result = await spamngl(
        link.trim(),
        pesan.trim(),
        parseInt(jumlah),
        parseInt(delay)
      );

      res.json({
        status: true,
        creator: "Reseller Gaming",
        query: { link, jumlah, pesan, delay },
        result,
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        creator: "Vanzz Ryuichi",
        error: err.message,
      });
    }
  },
};
