const fetch = require("node-fetch");

module.exports = {
  name: "Delete Panel Pterodactyl",
  desc: "Deleting servers and users from Pterodactyl based on username",
  category: "Pterodactyl",
  path: "/pterodactyl/delpanel?domain=&plta=&id=",

  async run(req, res) {
    const { domain, plta, id } = req.query;

    if (!domain || !plta || !id) {
      return res.json({
        status: false,
        error: "Wajib isi: domain, plta, dan id user"
      });
    }

    const headers = {
      "Authorization": `Bearer ${plta}`,
      "Accept": "Application/vnd.pterodactyl.v1+json",
      "Content-Type": "application/json"
    };

    try {
      // Ambil semua server
      const getServers = await fetch(`${domain}/api/application/users/${id}?include=servers`, { headers });
      const userData = await getServers.json();

      const servers = userData.attributes.relationships?.servers?.data || [];

      // Hapus semua server milik user
      for (const srv of servers) {
        const del = await fetch(`${domain}/api/application/servers/${srv.attributes.id}`, {
          method: "DELETE",
          headers
        });

        if (!del.ok) {
          const txt = await del.text();
          return res.status(500).json({
            status: false,
            error: `Gagal hapus server ID ${srv.attributes.id}`,
            detail: txt
          });
        }
      }

      // Hapus user
      const deleteUser = await fetch(`${domain}/api/application/users/${id}`, {
        method: "DELETE",
        headers
      });

      if (!deleteUser.ok) {
        const txt = await deleteUser.text();
        return res.status(500).json({
          status: false,
          error: `Gagal hapus user ID ${id}`,
          detail: txt
        });
      }

      res.json({
        status: true,
        message: `User ID ${id} dan semua server miliknya berhasil dihapus.`,
        total_servers_deleted: servers.length
      });

    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};