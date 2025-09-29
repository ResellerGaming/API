const axios = require("axios");

module.exports = [
  {
    name: "Cek Tagihan Internet Indihome",
    desc: "Cek tagihan Indihome",
    category: "Tagihan",
    path: "/tagihan/indihome?nomor=",

    async run(req, res) {
      const { nomor } = req.query;
      if (!nomor) {
        return res.json({ status: false, error: "Nomor pelanggan wajib diisi" });
      }

      try {
        const url = `https://api.herideveloper.com/api/cektagihan?apikey=72252332ded5&jenis_tagihan=indihome&customer_no=${nomor}`;
        const response = await axios.get(url);
        const result = response.data;

        if (!result.status || !result.data || !result.data.length) {
          return res.json({ status: false, error: "Data tidak ditemukan" });
        }

        const tagihan = result.data[0];
        const output = {
          status: true,
          nomor_pelanggan: tagihan.customer_no,
          nama_pelanggan: tagihan.customer_name,
          total_bayar: tagihan.desc.detail.reduce((acc, d) => acc + parseInt(d.nilai_tagihan), 0)
        };

        res.json(output);
      } catch (error) {
        res.status(500).json({ status: false, error: error.message });
      }
    }
  }
];
