import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import cors from "cors";
import nlp from "compromise";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEO_API = "https://nominatim.openstreetmap.org/search";

const fetchLocalNews = async (location) => {
    setLoading(true);
    try {
      console.log(`Fetching news for location: ${location}`);
      
      const res = await fetch(
        `http://api.mediastack.com/v1/news?access_key=${NEWS_API_KEY}&languages=en&countries=in&keywords=${encodeURIComponent(location)}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Fetched News Data:", data);

      if (data && data.data && data.data.length > 0) {
        setNews(data.data);
        sessionStorage.setItem("localNews", JSON.stringify(data.data));
      } else {
        console.warn(`No relevant news found for ${location}. Trying broader location...`);
        fetchLocalNews("Kerala"); // If no news, fetch broader region news
      }
    } catch (error) {
      console.error("Error fetching English news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };


// 📌 Extract locations from text using NLP
const extractLocations = (text) => {
  let doc = nlp(text);
  return doc.places().out("array");
};

// 📌 Verify locations using OpenStreetMap
const verifyLocation = async (location) => {
  try {
    const res = await axios.get(`${GEO_API}?q=${location}&format=json`);
    return res.data.length > 0;
  } catch (error) {
    console.error("Error verifying location:", error);
    return false;
  }
};

// 📌 Fetch & Filter News by User Location
app.post("/local-news", async (req, res) => {
  const userLocation = req.body.location.toLowerCase();
  const allNews = await fetchNews();

  if (!allNews.length) {
    return res.json({ message: "No news articles available." });
  }

  let filteredNews = [];

  const newsWithLocations = allNews.map((article) => ({
    article,
    locations: extractLocations(article.title + " " + article.description),
  }));

  for (const { article, locations } of newsWithLocations) {
    const validLocations = await Promise.all(
      locations.map(async (loc) => (loc.toLowerCase().includes(userLocation) ? verifyLocation(loc) : false))
    );

    if (validLocations.some((isValid) => isValid)) {
      filteredNews.push(article);
    }
  }

  res.json(filteredNews.length > 0 ? filteredNews : { message: "No local news found." });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
