const fetch = require("node-fetch");

module.exports = {
  name: "List Admin Panel Pterodactyl",
  desc: "Displays all admin users",
  category: "Pterodactyl",
  path: "/pterodactyl/listadmin?domain=&plta=",
  async run(req, res) {
    const { domain, plta } = req.query;
    if (!domain || !plta)
      return res.json({ status: false, error: "domain dan plta wajib diisi" });

    try {
      const response = await fetch(`${domain}/api/application/users`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${plta}`,
          'Accept': 'Application/vnd.pterodactyl.v1+json',
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.errors?.[0]?.detail || JSON.stringify(data));

      const admins = data.data.filter(user => user.attributes.root_admin);
      res.json({ status: true, total_admin: admins.length, admins });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
