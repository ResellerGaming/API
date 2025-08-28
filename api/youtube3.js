const axios = require('axios');
const cheerio = require('cheerio');

function murmurHash64(str) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;

    for (let i = 0; i < str.length; i++) {
        const k = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ k, 0x85ebca6b);
        h2 = Math.imul(h2 ^ k, 0xc2b2ae35);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 0x85ebca6b) ^ Math.imul(h2 ^ (h2 >>> 13), 0xc2b2ae35);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 0x85ebca6b) ^ Math.imul(h1 ^ (h1 >>> 13), 0xc2b2ae35);

    const h1Hex = (h1 >>> 0).toString(16).padStart(8, '0');
    const h2Hex = (h2 >>> 0).toString(16).padStart(8, '0');

    return h1Hex + h2Hex;
}

async function getDownloadLinks(youtubeUrl) {
    const mhash = murmurHash64(youtubeUrl);
    const targetApiUrl = `https://ssyoutube.rip/mates/en/analyze/ajax?retry=undefined&platform=youtube&mhash=${mhash}`;
    const siteKey = '0x4AAAAAAAzuNQE5IJEnuaAp';
    const solverApiUrl = `https://api.yogik.id/tools/tcloudflare/?url=https://ssyoutube.rip/en-a1/&siteKey=${siteKey}`;

    let cfToken;
    try {
        const tokenResponse = await axios.get(solverApiUrl);
        cfToken = tokenResponse.data?.data?.token;
        if (!cfToken) {
            console.error('❌ Gagal mendapatkan token yang valid dari solver API.');
            console.error('Respons API:', tokenResponse.data);
            return;
        }
    } catch (error) {
        console.error('❌ Terjadi kesalahan saat menghubungi API solver:', error.message);
        return;
    }

    const requestBody = new URLSearchParams({ 'url': youtubeUrl, 'ajax': '1', 'lang': 'en', 'cftoken': cfToken });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest', 'User-Agent': 'Mozilla/5.0' };

    try {
        const finalResponse = await axios.post(targetApiUrl, requestBody.toString(), { headers });

        if (finalResponse.data && typeof finalResponse.data.result === 'string') {
            const $ = cheerio.load(finalResponse.data.result);
            const title = $('#video_title').text().trim();

            if (!title) {
                console.error('❌ Gagal mem-parsing HTML. Kemungkinan struktur halaman telah berubah.');
                return;
            }

            const apiOutput = {
                status: 'success',
                metadata: {
                    title: title,
                    duration: $('p.m-b-0.m-t').text().replace('Duration:', '').trim(),
                    thumbnail: $('img.img-thumbnail').attr('src')
                },
                downloads: {
                    video: [],
                    audio: []
                }
            };

            let currentSection = '';
            $('table tr').each((index, element) => {
                const row = $(element);
                if (row.find('strong').length > 0) {
                    currentSection = row.find('strong').text().trim().toLowerCase();
                    return;
                }
                const columns = row.find('td');
                if (columns.length === 3) {
                    const downloadButton = $(columns[2]).find('a, button');
                    const url = downloadButton.attr('href') || downloadButton.data('url');
                    if (url) {
                        const format = {
                            url: url,
                            quality: $(columns[0]).text().trim().replace(/\s+/g, ' '),
                            ext: downloadButton.data('ftype'),
                            size: $(columns[1]).text().trim(),
                        };
                        if (currentSection === 'video') {
                            format.hasAudio = !row.hasClass('noaudio');
                            apiOutput.downloads.video.push(format);
                        } else if (currentSection === 'audio') {
                            apiOutput.downloads.audio.push(format);
                        }
                    }
                }
            });

            return apiOutput

        } else {
            console.error('❌ Gagal mendapatkan data dari ssyoutube.rip.');
            console.error('Respons dari server tidak memiliki format yang diharapkan.');
        }
    } catch (error) {
        console.error('❌ Terjadi kesalahan saat request utama:', error.response ? error.response.data : error.message);
    }
}

module.exports = {
    name: "Ytdl (alternatif)",
    desc: "Youtube downloader",
    category: "Downloader",
    path: "/download/ytdl?url=",
    async run(req, res) {
      try {
        const { url } = req.query;
        if (!url)
          return res.json({ status: false, error: "Url is required" });

        const results = await getDownloadLinks(url)
        res.status(200).json({
          status: true,
          result: {
          metadata: results.metadata, 
          media: {
          mp4: results.downloads.video[0].url, 
          mp3: results.downloads.audio[0].url, 
          }
          }
        });
      } catch (error) {
        res.status(500).json({ status: false, error: error.message });
      }
    },
}