const fetch = require("node-fetch");

module.exports = {
  name: "Delete Admin panel pterodactly",
  desc: "Remove admin user from system",
  category: "Pterodactyl",
  path: "/pterodactyl/deladmin?domain=&plta=&id=",
  async run(req, res) {
    const { domain, plta, id } = req.query;
    if (!domain || !plta || !id)
      return res.json({ status: false, error: "domain, plta, dan id wajib diisi" });

    try {
      const del = await fetch(`${domain}/api/application/users/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${plta}`,
          'Accept': 'Application/vnd.pterodactyl.v1+json',
        }
      });

      if (del.status !== 204) {
        const err = await del.json();
        throw new Error(err.errors?.[0]?.detail || JSON.stringify(err));
      }

      res.json({ status: true, message: "Admin berhasil dihapus dari sistem" });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
