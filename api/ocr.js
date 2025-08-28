const { ocrSpace } = require('ocr-space-api-wrapper');

module.exports = {
  name: "OCR",
  desc: "Ocr text in image",
  category: "Tools",
  path: "/tools/ocr?url=",
  async run(req, res) {
    const { url } = req.query;

    if (!url) {
      return res.json({ status: false, error: 'Url is required' });
    }

    try {
      const anuin = await ocrSpace(url)
      const anu = anuin.ParsedResults[0].ParsedText

      res.status(200).json({
        status: true,
        result: anu
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};