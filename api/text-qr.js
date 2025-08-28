const qrcode = require('qrcode');

module.exports = {
  name: "Text to QR",
  desc: "Generate QR code dari teks dan langsung kirim sebagai image/png",
  category: "Tools",
  path: "/tools/texttoqr?text=",
  async run(req, res) {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({
        creator: "FR3HOSTING",
        status: false,
        error: "Parameter 'text' wajib diisi"
      });
    }

    try {
      const buffer = await qrcode.toBuffer(text, {
        type: 'png',
        errorCorrectionLevel: 'H'
      });

      res.setHeader('Content-Type', 'image/png');
      res.send(buffer);
    } catch (err) {
      res.status(500).json({
        creator: "FR3HOSTING",
        status: false,
        error: err.message
      });
    }
  }
};
