module.exports = {ma
  name: "Ai With Image",
  desc: "Ai gemini models",
  category: "Openai",
  path: "/ai/gemini?prompt=&imageUrl=",
  async run(req, res) {
    const { prompt, imageUrl } = req.query;
    if (!text) return res.json({ status: false, error: "Prompt is required" });   
      if (!imageUrl) return res.json({ status: false, error: "Prompt is required" });
    try {
      const data = await fetchJson(`https://api.platform.web.id/gemini?prompt=${prompt}&imageUrl=${imageUrl}`)
      res.json({ status: true, result: data.result });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};