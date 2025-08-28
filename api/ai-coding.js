const fetch = require("node-fetch");

module.exports = {
  name: "Ai Code",
  desc: "AI specifically to help with coding",
  category: "Openai",
  path: "/tools/aicoder?text=",

  async run(req, res) {
    const { text } = req.query;

    if (!text) {
      return res.json({ status: false, error: "Masukkan pertanyaan coding kamu. Contoh: ?text=buat%20rest%20api%20express" });
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/ai/opengpt?text=Kamu Sekarng Ai code yang selalu coding dan berbahasa indonesia. Jawab pertanyaan ini${encodeURIComponent(text)}`;

      const response = await fetch(apiUrl);
      const result = await response.json();

      if (!result || !result.result) {
        return res.json({ status: false, error: "Gagal mendapatkan respons dari AI" });
      }

      res.json({
        status: true,
        question: text,
        result: result.result
      });

    } catch (err) {
      res.status(500).json({ status: false, error: "Gagal memproses permintaan AI", detail: err.message });
    }
  }
};
