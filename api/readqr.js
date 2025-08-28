const fetch = require("node-fetch");
const FormData = require("form-data");

module.exports = {
  name: "Read QR",
  desc: "Membaca QR code dari gambar URL",
  category: "Tools",
  path: "/tools/readqr?url=",
  async run(req, res) {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({
        creator: "FR3HOSTING",
        status: false,
        error: "Parameter 'url' wajib diisi"
      });
    }

    try {
      const form = new FormData();
      form.append("fileurl", url);

      const response = await fetch("https://api.qrserver.com/v1/read-qr-code/", {
        method: "POST",
        body: form
      });

      const data = await response.json();
      const hasil = data?.[0]?.symbol?.[0]?.data;

      if (!hasil) {
        return res.status(400).json({
          creator: "FR3HOSTING",
          status: false,
          error: "QR code tidak bisa dibaca atau tidak valid"
        });
      }

      res.status(200).json({
        creator: "FR3HOSTING",
        status: true,
        result: hasil
      });
    } catch (err) {
      res.status(500).json({
        creator: "FR3HOSTING",
        status: false,
        error: err.message
      });
    }
  }
};
