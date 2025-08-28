const ytmp3cc = async (url) => {
    const r = await fetch("https://e.ecoe.cc/?_=" + Math.random(), {
        body: JSON.stringify({ url }),
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!r.ok) {
        const text = await r.text().catch(() => null);
        throw Error(`fetch is not ok! ${r.status} ${r.statusText}\n${text}`);
    }

    return await r.json();
}


const ytmp4 = {
    headers: {
        "origin": "https://ytmp4.blog",
        "referer": "https://ytmp4.blog"
    },

    search: async (query) => {
        if (typeof (query) !== "string" || query.length === 0) throw Error("invalid search")
        const response = await fetch("https://us-central1-ytmp3-tube.cloudfunctions.net/searchResult?q=" + encodeURIComponent(query), {
            headers: ytmp4.headers
        })
        if (!response.ok) throw Error(`fetch search is not ok~ ${response.status} ${response.statusText}\n${await response.text() || null}`)
        const data = await response.json()
        return data
    },

    download: async (youtubeUrl) => {
        // first hit
        const api = "https://api.ytmp3.tube/mp3/1?url=" + youtubeUrl
        const response = await fetch(api, { headers: ytmp4.headers })
        if (!response.ok) throw Error(`fetch download on first hit is not ok~ ${response.status} ${response.statusText}\n${await response.text() || null}`)
        const html = await response.text()
        const match = html.match(/{\\"videoId\\":(.+?)}/)?.[0]
        if (!match) throw Error(`gagal menemukan match video id pada function download first hit.`)
        const cleaned = match.replaceAll(/\\/g, "")
        const json = JSON.parse(cleaned)

        // second hit
        // handling progress juga
        let json2 = {}
        const body = JSON.stringify(
            {
                "id": json.videoId,
                "audioBitrate": "128",
                "token": json.token,
                "timestamp": json.timestamp,
                "secretToken": json.encryptedVideoId
            }
        )
        const headers = {
            "origin": "https://api.ytmp3.tube",
            "referer": api
        }

        do {
            let response2 = await fetch("https://api.ytmp3.tube/api/download/mp3", {
                headers,
                body,
                "method": "POST",
            })
            if (!response2.ok) throw Error(`fetch download on second hit is not ok~ ${response2.status} ${response2.statusText}\n${await response2.text() || null}`)
            json2 = await response2.json()

            // delay
            await new Promise(re => setTimeout(re, 5000))
            console.log("cek status")
            if (json2.status == "fail") throw Error(`error dari server. katanya: ${json2.msg}`)
        } while (json2.status == "processing")
        
        return json2
    },

    searchAndDownload: async (query) => {
        const wolep = await ytmp4.search(query)
        const url = wolep[0].url

        const data = await ytmp4.download(url)
        return data
    }
}


module.exports = [
  {
    name: "Ytmp4",
    desc: "Download video youtube",
    category: "Downloader",
    path: "/download/ytmp4?url=",
    async run(req, res) {
      try {
        const { url } = req.query;
        if (!url)
          return res.json({ status: false, error: "Url is required" });

        const results = await ytmp4.download(url)
        res.status(200).json({
          status: true,
          result: results.link,
        });
      } catch (error) {
        res.status(500).json({ status: false, error: error.message });
      }
    },
  },

  {
    name: "Ytmp3",
    desc: "Download audio youtube",
    category: "Downloader",
    path: "/download/ytmp3?url=",
    async run(req, res) {
      try {
        const { url } = req.query;
        if (!url)
          return res.json({ status: false, error: "Url is required" });

        const results = await ytmp3cc(url)
        res.status(200).json({
          status: true,
          result: results.url
        });
      } catch (error) {
        res.status(500).json({ status: false, error: error.message });
      }
    },
  }
];