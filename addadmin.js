const fetch = require("node-fetch");

module.exports = {
  name: "Add Admin Panel Pterodactyl",
  desc: "Create a new user as admin",
  category: "Pterodactyl",
  path: "/pterodactyl/addadmin?domain=&plta=&username=",
  async run(req, res) {
    const { domain, plta, username } = req.query;
    if (!domain || !plta || !username)
      return res.json({ status: false, error: "domain, plta, dan username wajib diisi" });

    try {
      const response = await fetch(`${domain}/api/application/users`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${plta}`,
          'Content-Type': 'application/json',
          'Accept': 'Application/vnd.pterodactyl.v1+json',
        },
        body: JSON.stringify({
          username,
          email: `${username}@fr3.com`,
          first_name: "admin",
          last_name: username,
          password: username,
          root_admin: true
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.errors?.[0]?.detail || JSON.stringify(data));
      res.json({ status: true, message: "Admin berhasil dibuat", data });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
