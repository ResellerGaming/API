module.exports = {
  name: "To Hitam",
  desc: "Hitamkan foto orang",
  category: "Imagecreator",
  path: "/imagecreator/tohitam?url=",
  async run(req, res) {
    const { url } = req.query;
    if (!url) return res.json({ status: false, error: "Url is required" });
    try {
      const ap = await fetchJson(`https://api.platform.web.id/hitam?imageUrl=${url}`)
      res.status(200).json({ status: true, result: ap.image.url });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  }
}
