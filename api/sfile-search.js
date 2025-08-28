const cheerio = require("cheerio");
const fetch = require("node-fetch");

const sfile = {
    search: async (query, page = 1) => {
        try {
            const res = await fetch(`https://sfile.mobi/search.php?q=${encodeURIComponent(query)}&page=${page}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const html = await res.text();
            const $ = cheerio.load(html);
            const arr = [];
            
            $('div.list').each((idx, el) => {
                const title = $(el).find('a').text().trim();
                const sizeText = $(el).text().trim();
                const sizeMatch = sizeText.match(/\(([^)]+)\)/);
                const size = sizeMatch ? sizeMatch[1] : 'Unknown';
                const link = $(el).find('a').attr('href');
                
                if (link && title) {
                    arr.push({ 
                        title, 
                        size, 
                        link: link.startsWith('http') ? link : `https://sfile.mobi${link}` 
                    });
                }
            });
            
            return arr;
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }
};

module.exports = {
    name: "Sfile Search",
    desc: "Search sfile.mobi for file downloads",
    category: "Search",
    path: "/search/sfile?q=",
    async run(req, res) {
        const { q, page = 1 } = req.query;
        
        if (!q) {
            return res.status(400).json({ 
                status: false, 
                error: "Query parameter 'q' is required" 
            });
        }

        try {
            const results = await sfile.search(q, page);
            res.status(200).json({
                status: true,
                query: q,
                page: parseInt(page),
                results
            });
        } catch (error) {
            res.status(500).json({ 
                status: false, 
                error: "Failed to search Sfile",
                details: error.message 
            });
        }
    }
};
