const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 5000;

// News sources covering global, African, and entertainment news
const SOURCES = [
    {
        name: "Billboard",
        url: "https://www.billboard.com/music",
        articleSelector: ".lrv-a-unstyle-list h3 a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: `https://www.billboard.com${$(el).attr("href")}`,
            image: null, // Billboard doesn't provide images in headlines
        }),
    },
    {
        name: "Pitchfork",
        url: "https://pitchfork.com/news/",
        articleSelector: "h2 a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: `https://pitchfork.com${$(el).attr("href")}`,
            image: null,
        }),
    },
    {
        name: "RollingStone",
        url: "https://www.rollingstone.com/music/music-news/",
        articleSelector: ".c-card__title a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: $(el).attr("href"),
            image: null,
        }),
    },
    {
        name: "Ghana Web",
        url: "https://www.ghanaweb.com/GhanaHomePage/entertainment/",
        articleSelector: ".section-article h2 a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: `https://www.ghanaweb.com${$(el).attr("href")}`,
            image: null,
        }),
    },
    {
        name: "Joy News",
        url: "https://www.myjoyonline.com/entertainment/",
        articleSelector: ".jeg_post_title a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: $(el).attr("href"),
            image: null,
        }),
    },
    {
        name: "BBC Entertainment",
        url: "https://www.bbc.com/news/entertainment_and_arts",
        articleSelector: ".gs-c-promo-heading a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: `https://www.bbc.com${$(el).attr("href")}`,
            image: null,
        }),
    },
    {
        name: "Big Africa News",
        url: "https://bigafricanews.com/category/entertainment/",
        articleSelector: ".entry-title a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: $(el).attr("href"),
            image: null,
        }),
    },
    {
        name: "Nigerian Entertainment",
        url: "https://www.thenigerianvoice.com/NigeriaHome/entertainment/",
        articleSelector: ".content-articles h3 a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: `https://www.thenigerianvoice.com${$(el).attr("href")}`,
            image: null,
        }),
    },
    {
        name: "Global Entertainment",
        url: "https://www.eonline.com/news",
        articleSelector: ".content-item__title a",
        extract: ($, el) => ({
            title: $(el).text().trim(),
            url: `https://www.eonline.com${$(el).attr("href")}`,
            image: null,
        }),
    },
];

async function scrapeNews(artist) {
    let allArticles = [];

    for (const source of SOURCES) {
        try {
            const { data } = await axios.get(source.url);
            const $ = cheerio.load(data);

            $(source.articleSelector).each((i, el) => {
                const article = source.extract($, el);

                // Filter articles by artist name
                if (!artist || article.title.toLowerCase().includes(artist.toLowerCase())) {
                    allArticles.push({ ...article, source: source.name });
                }
            });
        } catch (error) {
            console.error(`❌ Error scraping from ${source.name}:`, error.message);
        }
    }

    return { artist, articles: allArticles };
}

// API Endpoint: Fetch news by artist
app.get("/api/news", async (req, res) => {
    const artist = req.query.artist || "";
    const newsData = await scrapeNews(artist);
    res.json(newsData);
});

app.listen(PORT, () => {
    console.log(`✅ Scraper running at http://localhost:${PORT}/api/news`);
});
