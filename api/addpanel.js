const fetch = require("node-fetch");

module.exports = {
  name: "Add Panel Pterodactyl",
  desc: "Create Node.js users and servers directly in Pterodactyl",
  category: "Pterodactyl",
  path: "/pterodactyl/addpanel?domain=&plta=&username=&disk=&cpu=",
  
  async run(req, res) {
    const { domain, plta, username, disk, cpu } = req.query;

    if (!domain || !plta || !username || !disk || !cpu) {
      return res.json({
        status: false,
        error: "Wajib isi: domain, plta, username, disk, cpu"
      });
    }

    const email = `${username}@mail.com`;
    const password = username;

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${plta}`,
      "Accept": "Application/vnd.pterodactyl.v1+json"
    };

    try {
      // 1. Buat user
      const createUser = await fetch(`${domain}/api/application/users`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          username,
          password,
          first_name: "panel",
          last_name: "pterodactyl"
        })
      });

      const userData = await createUser.json();
      const userId = userData?.attributes?.id;

      if (!userId) {
        return res.json({ status: false, error: "Gagal membuat user", response: userData });
      }

      // 2. Ambil node dengan location_id = 1
      const getNodes = await fetch(`${domain}/api/application/nodes`, { headers });
      const nodesData = await getNodes.json();

      const targetNode = nodesData.data.find(n => n.attributes.location_id === 1);
      if (!targetNode) return res.json({ status: false, error: "Node dengan lokasi 1 tidak ditemukan" });

      // 3. Ambil allocations dari node itu
      const getAllocs = await fetch(`${domain}/api/application/nodes/${targetNode.attributes.id}/allocations`, { headers });
      const allocData = await getAllocs.json();

      const availableAllocs = allocData.data.filter(a => !a.attributes.assigned);
      if (!availableAllocs.length) {
        return res.json({ status: false, error: "Tidak ada allocation tersedia di lokasi 1" });
      }

      // 4. Pilih satu allocation secara acak
      const allocation = availableAllocs[Math.floor(Math.random() * availableAllocs.length)];

      // 5. Buat server
      const serverBody = {
        name: username,
        user: userId,
        egg: 15,
        nest: 5,
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: "npm start",
        environment: {
          CMD_RUN: "npm start",
          PORT: `${allocation.attributes.port}`
        },
        limits: {
          memory: 1024,
          swap: 0,
          disk: Number(disk),
          io: 500,
          cpu: Number(cpu)
        },
        feature_limits: {
          databases: 1,
          allocations: 1,
          backups: 1
        },
        allocation: {
          default: allocation.attributes.id
        }
      };

      const createServer = await fetch(`${domain}/api/application/servers`, {
        method: "POST",
        headers,
        body: JSON.stringify(serverBody)
      });

      if (!createServer.ok) {
        const errTxt = await createServer.text();
        return res.status(createServer.status).json({
          status: false,
          error: `Gagal membuat server: ${createServer.statusText}`,
          detail: errTxt
        });
      }

      const serverData = await createServer.json();

      res.json({
        status: true,
        message: "User dan server Node.js berhasil dibuat",
        user: userData,
        server: serverData
      });

    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};