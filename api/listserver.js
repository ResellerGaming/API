const fetch = require("node-fetch");

module.exports = {
  name: "List Server Pterodactyl",
  desc: "Display all servers from the Pterodactyl panel",
  category: "Pterodactyl",
  path: "/pterodactyl/listserver?domain=&plta=",

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
      const response = await fetch(`${domain}/api/application/servers`, {
        method: "GET",
        headers
      });

      const data = await response.json();

      if (!data || !data.data) {
        return res.json({ status: false, error: "Gagal mengambil data server", response: data });
      }

      const servers = data.data.map(s => ({
        id: s.attributes.id,
        uuid: s.attributes.uuid,
        name: s.attributes.name,
        identifier: s.attributes.identifier,
        owner_id: s.attributes.user,
        description: s.attributes.description
      }));

      res.json({ status: true, total: servers.length, servers });

    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};