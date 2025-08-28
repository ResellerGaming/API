const fetch = require("node-fetch");

module.exports = {
  name: "List User",
  desc: "Displays all users from the Pterodacty panel",
  category: "Pterodactyl",
  path: "/pterodactyl/listuser?domain=&plta=",

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
      const response = await fetch(`${domain}/api/application/users`, {
        method: "GET",
        headers
      });

      const data = await response.json();

      if (!data || !data.data) {
        return res.json({ status: false, error: "Gagal mengambil data user", response: data });
      }

      const users = data.data.map(u => ({
        id: u.attributes.id,
        username: u.attributes.username,
        email: u.attributes.email,
        admin: u.attributes.root_admin
      }));

      res.json({ status: true, total: users.length, users });

    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};