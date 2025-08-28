const axios = require("axios");

async function npmstalk(packageName) {
  const stalk = await axios.get("https://registry.npmjs.org/" + packageName);
  const versions = stalk.data.versions;
  const allver = Object.keys(versions);
  const verLatest = allver[allver.length - 1];
  const verPublish = allver[0];
  const packageLatest = versions[verLatest];

  return {
    name: packageName,
    versionLatest: verLatest,
    versionPublish: verPublish,
    versionUpdate: allver.length,
    latestDependencies: Object.keys(packageLatest.dependencies || {}).length,
    publishDependencies: Object.keys(versions[verPublish].dependencies || {}).length,
    publishTime: stalk.data.time.created,
    latestPublishTime: stalk.data.time[verLatest]
  };
}

module.exports = {
  name: "Npm Stalk",
  desc: "Stalking npm package nodejs",
  category: "Stalker",
  path: "/stalk/npm?name=",
  async run(req, res) {
    const { name } = req.query;

    if (!name) {
      return res.json({ status: false, error: "Name is required" });
    }

    try {
      const result = await npmstalk(name);
      res.status(200).json({
        status: true,
        result
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message
      });
    }
  }
};