const axios = require("axios");

async function cekEwallet(provider, nomor) {
  try {
    const timestamp = Date.now().toString();

    const params = new URLSearchParams();
    params.append("app_reg_id", "cdzXkBynRECkAODZEHwkeV:APA91bHRyLlgNSlpVrC4Yv3xBgRRaePSaCYruHnNwrEK8_pX3kzitxzi0CxIDFc2oztCwcw7-zPgwE-6v_-rJCJdTX8qE_ADiSnWHNeZ5O7_BIlgS_1N8tw");
    params.append("phone_uuid", "cdzXkBynRECkAODZEHwkeV");
    params.append("phone_model", "23124RA7EO");
    params.append("phoneNumber", nomor);
    params.append("request_time", timestamp);
    params.append("phone_android_version", "15");
    params.append("app_version_code", "250811");
    params.append("auth_username", "sumarjono");
    params.append("customerId", "");
    params.append("id", provider);
    params.append("auth_token", "2604338:tMbsgZKq2JYxOG8BvTQnfm1oup0XaNPI");
    params.append("app_version_name", "25.08.11");
    params.append("ui_mode", "dark");

    const config = {
      method: "POST",
      url: `https://checker.orderkuota.com/api/checkname/produk/bff66b406f/06/2604338/${provider}`,
      headers: {
        "User-Agent": "okhttp/4.12.0",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/x-www-form-urlencoded",
        "signature": "b2d5d7a5a3d69e7f208343fd0d278a5f1c55e42e109c58203103e634875becd946e547d5b4fe307e6cf0bcd70884d10dbdc3a58368d02e0ae64b7cd741ec354c",
        "timestamp": timestamp,
      },
      data: params.toString(),
    };

    const response = await axios.request(config);
    return { status: true, result: response.data };
  } catch (err) {
    return { status: false, error: err.message };
  }
}

// ROUTE EXPORT
module.exports = [
  {
    name: "Cek Ewallet Dana",
    desc: "Cek nama akun Dana",
    category: "Tools",
    path: "/tools/cekewallet/dana?nomor=",
    async run(req, res) {
      const { nomor } = req.query;
      if (!nomor) return res.json({ status: false, error: "Missing nomor" });
      const result = await cekEwallet("dana", nomor);
      res.json(result);
    },
  },
  {
    name: "Cek Ewallet OVO",
    desc: "Cek nama akun OVO",
    category: "Tools",
    path: "/tools/cekewallet/ovo?nomor=",
    async run(req, res) {
      const { nomor } = req.query;
      if (!nomor) return res.json({ status: false, error: "Missing nomor" });
      const result = await cekEwallet("ovo", nomor);
      res.json(result);
    },
  },
  {
    name: "Cek Ewallet Gopay",
    desc: "Cek nama akun Gopay",
    category: "Tools",
    path: "/tools/cekewallet/gopay?nomor=",
    async run(req, res) {
      const { nomor } = req.query;
      if (!nomor) return res.json({ status: false, error: "Missing nomor" });
      const result = await cekEwallet("gopay", nomor);
      res.json(result);
    },
  },
  {
    name: "Cek Ewallet Shopeepay",
    desc: "Cek nama akun Shopeepay",
    category: "Tools",
    path: "/tools/cekewallet/shopeepay?nomor=",
    async run(req, res) {
      const { nomor } = req.query;
      if (!nomor) return res.json({ status: false, error: "Missing nomor" });
      const result = await cekEwallet("shopeepay", nomor);
      res.json(result);
    },
  },
  {
    name: "Cek Ewallet LinkAja",
    desc: "Cek nama akun LinkAja",
    category: "Tools",
    path: "/tools/cekewallet/linkaja?nomor=",
    async run(req, res) {
      const { nomor } = req.query;
      if (!nomor) return res.json({ status: false, error: "Missing nomor" });
      const result = await cekEwallet("linkaja", nomor);
      res.json(result);
    },
  },
];
