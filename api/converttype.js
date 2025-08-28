module.exports = {
  name: "ConvertModule",
  desc: "Convert ESModule ⇄ CommonJS",
  category: "Tools",
  path: "/tools/convert?code=&type=",

  async run(req, res) {
    const { code, type } = req.query;

    if (!code || !type)
      return res.json({ status: false, error: "Wajib isi 'code' dan 'type' (to-cjs / to-esm)" });

    function convertToCommonJS(code) {
      return code
        .replace(/import\s+(.+?)\s+from\s+['"](.+?)['"]/g, (match, what, from) => {
          if (what.includes("{")) {
            return `const ${what.replace(/[{}]/g, "").trim()} = require("${from}");`;
          } else {
            return `const ${what.trim()} = require("${from}");`;
          }
        })
        .replace(/export\s+default\s+/, "module.exports = ")
        .replace(/export\s+\{([^}]+)\};?/g, (_, exports) => {
          return `module.exports = { ${exports.trim()} };`;
        });
    }

    function convertToESModule(code) {
      return code
        .replace(/const\s+(.+?)\s+=\s+require\(['"](.+?)['"]\);?/g, (match, what, from) => {
          return `import ${what.trim()} from "${from}";`;
        })
        .replace(/module\.exports\s+=\s+/, "export default ")
        .replace(/module\.exports\s+=\s+\{([^}]+)\};?/g, (_, exports) => {
          return `export { ${exports.trim()} };`;
        });
    }

    try {
      const converted = type === "to-cjs"
        ? convertToCommonJS(code)
        : type === "to-esm"
        ? convertToESModule(code)
        : null;

      if (!converted) throw new Error("Tipe convert salah, gunakan 'to-cjs' atau 'to-esm'");

      res.json({
        status: true,
        type,
        result: converted
      });
    } catch (err) {
      res.status(500).json({ status: false, error: err.message });
    }
  }
};
