const axios = require("axios");
const cheerio = require("cheerio");

async function extractPost(array) {
  const result = [];
  for (const url of array) {
    const request = await axios.get(url, {
      headers: {
        "User-Agent": "Posify/1.0.0",
        "Referer": "dumpor.io"
      }
    }).catch(e => e.response);

    if (request.status !== 200) throw new Error(`Failed to fetch post data from ${url}`);

    const $ = cheerio.load(request.data);
    $(".card").each((_, card) => {
      const items = [];
      $(card).find(".carousel .carousel-item").each((_, el) => {
        const src = $(el).find("img").attr("src") || $(el).find("video").attr("src");
        if (src) items.push(src);
      });

      result.push({
        url,
        title: $(card).find(".card-body").find("p").text().trim(),
        likes: $(card).find(".card-body").eq(2).find("div").eq(0).text().trim(),
        comments: $(card).find(".card-body").eq(2).find("div").eq(1).text().trim(),
        uploaded: $(card).find(".card-body").eq(2).find("div").eq(2).text().trim(),
        downloads: items
      });
    });
  }
  return result;
}

async function dumporStalk(username) {
  const res = await axios.get(`https://dumpor.io/v/${username.split(" ").join("_").toLowerCase()}`, {
    headers: {
      "User-Agent": "Posify/1.0.0",
      "Referer": "dumpor.io"
    }
  }).catch(e => e.response);

  if (res.status !== 200) throw new Error("Failed to fetch user data!");

  const $ = cheerio.load(res.data);
  const metadata = {
    name: $(".items-top h2").text().trim(),
    username: $(".items-top h1").text().trim(),
    bio: $(".items-top .text-sm").text().trim(),
    avatar: $(".avatar img").attr("src") || null
  };

  $(".stats .stat").each((_, el) => {
    const key = $(el).find(".stat-title").text().trim().toLowerCase();
    const value = $(el).find(".stat-value").text().trim();
    metadata[key] = value;
  });

  const postUrls = [];
  $(".card").each((_, el) => {
    const url = $(el).find("a").attr("href");
    if (url) postUrls.push("https://dumpor.io" + url);
  });

  const posts = await extractPost(postUrls);
  return { metadata, posts };
}

module.exports = {
  name: "Instagram Stalk",
  desc: "Stalking Instagram account",
  category: "Stalker",
  path: "/stalk/instagram?username=",
  async run(req, res) {
    const { username } = req.query;

    if (!username)
      return res.json({ status: false, error: "Username is required" });

    try {
      const result = await dumporStalk(username);
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