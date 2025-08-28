const fetch = require("node-fetch");

module.exports = {
  name: "Clear All Server Panel",
  desc: "Remove ALL servers from the panel",
  category: "Pterodactyl",
  path: "/pterodactyl/clearserver?domain=&plta=",
  async run(req, res) {
    const { domain, plta } = req.query;

    if (!domain || !plta) {
      return res.json({ status: false, error: "Wajib isi: domain dan plta" });
    }

    const headers = {
      "Authorization": `Bearer ${plta}`,
      "Accept": "Application/vnd.pterodactyl.v1+json"
    };

    try {
      let page = 1;
      let servers = [];

      while (true) {
        const getServers = await fetch(`${domain}/api/application/servers?page=${page}&per_page=100`, { headers });
        const data = await getServers.json();
        servers = servers.concat(data.data || []);

        if (!data.meta.pagination || data.meta.pagination.current_page >= data.meta.pagination.total_pages) {
          break;
        }

        page++;
      }

      let deleted = 0;

      for (const srv of servers) {
        const del = await fetch(`${domain}/api/application/servers/${srv.attributes.id}`, {
          method: "DELETE",
          headers
        });

        if (del.ok) deleted++;
      }

      res.json({
        status: true,
        message: "Semua server berhasil dihapus",
        total_deleted: deleted
      });

    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
