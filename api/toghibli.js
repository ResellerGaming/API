module.exports = {
  name: "To Ghibli",
  desc: "Image to ghibli style",
  category: "Imagecreator",
  path: "/imagecreator/toghibli?url=",
  async run(req, res) {
    const { apikey, url } = req.query;
    if (!apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" });
    if (!url) return res.json({ status: false, error: "Url is required" });
    try {
      const ap = await fetchJson(`https://api.platform.web.id/ghibli?imageUrl=${url}`)
      res.status(200).json({ status: true, result: ap.image.url });
    } catch (e) {
      res.status(500).json({ status: false, error: e.message });
    }
  }
}
