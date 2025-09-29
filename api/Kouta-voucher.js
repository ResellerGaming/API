const fetch = require("node-fetch");
const API_KEY = "fr3newera";

async function cekVoucher(provider, number) {
  const url = `https://api.payday.my.id/trueid/cek_vcr/${provider}/?number=${encodeURIComponent(number)}&key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json().catch(async () => {
    return { raw: await response.text() };
  });
  return data;
}

module.exports = [
  {
    name: "Cek Voucher Axis",
    desc: "Cek voucher Axis",
    category: "Voucher",
    path: "/voucher/axis?number=",
    async run(req, res) {
      const { number } = req.query;
      if (!number) return res.json({ status: false, error: "Masukkan parameter number" });
      const result = await cekVoucher("axis", number);
      res.json({ creator: "FR3-NEWERA", status: true, provider: "axis", number, result });
    }
  },
  {
    name: "Cek Voucher By.U",
    desc: "Cek voucher By.U",
    category: "Voucher",
    path: "/voucher/byu?number=",
    async run(req, res) {
      const { number } = req.query;
      if (!number) return res.json({ status: false, error: "Masukkan parameter number" });
      const result = await cekVoucher("byu", number);
      res.json({ creator: "FR3-NEWERA", status: true, provider: "byu", number, result });
    }
  },
  {
    name: "Cek Voucher Indosat",
    desc: "Cek voucher Indosat",
    category: "Voucher",
    path: "/voucher/indosat?number=",
    async run(req, res) {
      const { number } = req.query;
      if (!number) return res.json({ status: false, error: "Masukkan parameter number" });
      const result = await cekVoucher("indosat", number);
      res.json({ creator: "FR3-NEWERA", status: true, provider: "indosat", number, result });
    }
  },
  {
    name: "Cek Voucher Smartfren",
    desc: "Cek voucher Smartfren",
    category: "Voucher",
    path: "/voucher/smartfren?number=",
    async run(req, res) {
      const { number } = req.query;
      if (!number) return res.json({ status: false, error: "Masukkan parameter number" });
      const result = await cekVoucher("smartfren", number);
      res.json({ creator: "FR3-NEWERA", status: true, provider: "smartfren", number, result });
    }
  },
  {
    name: "Cek Voucher Telkomsel",
    desc: "Cek voucher Telkomsel",
    category: "Voucher",
    path: "/voucher/telkomsel?number=",
    async run(req, res) {
      const { number } = req.query;
      if (!number) return res.json({ status: false, error: "Masukkan parameter number" });
      const result = await cekVoucher("telkomsel", number);
      res.json({ creator: "FR3-NEWERA", status: true, provider: "telkomsel", number, result });
    }
  },
  {
    name: "Cek Voucher XL",
    desc: "Cek voucher XL",
    category: "Voucher",
    path: "/voucher/xl?number=",
    async run(req, res) {
      const { number } = req.query;
      if (!number) return res.json({ status: false, error: "Masukkan parameter number" });
      const result = await cekVoucher("xl", number);
      res.json({ creator: "FR3-NEWERA", status: true, provider: "xl", number, result });
    }
  }
];
