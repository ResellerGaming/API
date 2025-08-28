module.exports = {
  name: "Ssweb",
  desc: "Screenshot website",
  category: "Tools",
  path: "/tools/ssweb?url=",
  async run(req, res) {
    const { url } = req.query;

    if (!url) {
      return res.json({ status: false, error: 'Url is required' });
    }

    try {
      const response = await fetchJson(`https://api.pikwy.com/?tkn=125&d=3000&u=${encodeURIComponent(url)}&fs=0&w=1280&h=1200&s=100&z=100&f=jpg&rt=jweb`);
      
      if (!response.iurl) {
        throw new Error('Failed to get screenshot image URL');
      }

      res.status(200).json({
        status: true,
        result: response.iurl
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};