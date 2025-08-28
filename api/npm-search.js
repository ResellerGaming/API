const axios = require("axios");

module.exports = {
  name: "Npm Search",
  desc: "Search package nodejs",
  category: "Search",
  path: "/search/npm?q=",
  async run(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.json({ status: false, error: 'Query is required' });
      }

      const { data } = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${encodeURIComponent(q)}`);
      const results = data.objects.slice(0, 20).map(pkg => ({
        title: `${pkg.package.name}@^${pkg.package.version}`,
        author: pkg.package.publisher?.username || '-',
        update: pkg.package.date,
        links: pkg.package.links
      }));

      res.status(200).json({
        status: true,
        result: results
      });
    } catch (error) {
      res.status(500).json({ status: false, error: error.message });
    }
  }
};