const fetch = require("node-fetch");

module.exports = {
  name: "Clear All User Panel",
  desc: "Remove ALL users from Pterodactyl",
  category: "Pterodactyl",
  path: "/pterodactyl/clearuser?domain=&plta=",

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
      const getUsers = await fetch(`${domain}/api/application/users?per_page=10000`, { headers });
      const userData = await getUsers.json();
      const users = userData.data || [];

      let deleted = 0;

      for (const user of users) {
        const del = await fetch(`${domain}/api/application/users/${user.attributes.id}`, {
          method: "DELETE",
          headers
        });

        if (del.ok) deleted++;
      }

      res.json({
        status: true,
        message: "Semua user berhasil dihapus",
        total_deleted: deleted
      });

    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
