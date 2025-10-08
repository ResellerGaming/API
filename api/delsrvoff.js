const axios = require('axios');

async function getServerStatus(uuid, domain, pltcKey) {
  try {
    const { data } = await axios.get(
      `${domain}/api/client/servers/${uuid}/resources`,
      { headers: { Authorization: `Bearer ${pltcKey}` } }
    );
    return data?.attributes?.current_state || 'unknown';
  } catch {
    return 'unknown';
  }
}

async function deleteOfflineServers(domain, pltaKey, pltcKey) {
  let page = 1;
  const allServers = [];

  // 1. Ambil semua server (paginasi)
  while (true) {
    const { data: res } = await axios.get(
      `${domain}/api/application/servers?page=${page}`,
      { headers: { Authorization: `Bearer ${pltaKey}` } }
    );
    if (res.errors) throw new Error(res.errors[0].detail);
    allServers.push(...res.data);
    if (res.meta.pagination.current_page >= res.meta.pagination.total_pages) break;
    page++;
  }

  // 2. Filter offline / stopped
  const toDelete = [];
  for (const srv of allServers) {
    const status = await getServerStatus(srv.attributes.uuid, domain, pltcKey);
    if (status === 'offline' || status === 'stopped') {
      toDelete.push({
        id  : srv.attributes.id,
        name: srv.attributes.name,
        status
      });
    }
  }

  // 3. Hapus satu-per-satu
  const report = { total: 0, deleted: 0, details: [] };
  for (const s of toDelete) {
    try {
      const del = await axios.delete(
        `${domain}/api/application/servers/${s.id}`,
        { headers: { Authorization: `Bearer ${pltaKey}` } }
      );
      if (del.status === 204) {
        report.deleted++;
        report.details.push({ name: s.name, id: s.id, status: s.status, result: 'terhapus' });
      } else {
        report.details.push({ name: s.name, id: s.id, status: s.status, result: 'gagal', code: del.status });
      }
    } catch (e) {
      report.details.push({ name: s.name, id: s.id, status: s.status, result: 'error', message: e.message });
    }
  }
  report.total = toDelete.length;
  return report;
}

module.exports = {
  name: 'DelSrvV1Off',
  desc: 'Hapus server V1 offline via query (domain, plta, pltc)',
  category: 'Pterodactyl',
  path: '/pterodactyl/delsrvoff?domain=&plta=&pltc=',
  async run(req, res) {
    try {
      const { domain, plta, pltc } = req.query;
      if (!domain || !plta || !pltc) {
        return res.status(400).json({
          status: false,
          error: 'Query wajib: domain, plta, pltc',
          example: '/pterodactyl/delsrvoff?domain=https://panel.com&plta=plta_xxx&pltc=pltc_xxx'
        });
      }

      const report = await deleteOfflineServers(domain, plta, pltc);
      res.json({ status: true, creator: 'RESMING-NEWERA', domain, report });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
