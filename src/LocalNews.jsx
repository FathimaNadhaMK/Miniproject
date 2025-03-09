import React, { useState, useEffect } from "react";
import "./LocalNews.css"; // Import styles
import { useNavigate, useLocation } from "react-router-dom";

function LocalNews() {
  const navigate = useNavigate();
  const { state: routerState } = useLocation();
  // Get the location and coordinates passed from homepage (if available)
  const { location: fetchedLocation, lat, lon } = routerState || {};

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  // Use the passed location, or fallback to a default value
  const [locationName, setLocationName] = useState(fetchedLocation || "📍 സ്ഥലം കണ്ടെത്തുന്നു...");
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  // On mount, use the passed location to fetch nearby places and news
  useEffect(() => {
    if (fetchedLocation) {
      setLocationName(fetchedLocation);
      // If coordinates are available, fetch nearby places first
      if (lat && lon) {
        fetchNearbyPlaces(lat, lon).then(() => {
          fetchRSSNews(fetchedLocation);
        });
      } else {
        fetchRSSNews(fetchedLocation);
      }
    } else {
      // Fallback: if no location was passed, you might choose to show general news
      fetchRSSNews("Unknown");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedLocation, lat, lon]);

  // 2️⃣ Find Nearby Places (Within 100km)
  const fetchNearbyPlaces = async (lat, lon) => {
    try {
      const res = await fetch("/kerala_places.json"); // Predefined list of cities/towns
      const places = await res.json();

      let nearby = places.filter((place) => {
        let distance = getDistance(lat, lon, place.lat, place.lon);
        return distance <= 100; // Search radius: 100km
      });

      setNearbyPlaces(nearby.map((p) => p.name));
      console.log("📍 Nearby Places:", nearby);
    } catch (error) {
      console.error("❌ Error fetching nearby places:", error);
    }
  };

  // Calculate Distance Between Two Coordinates
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 3️⃣ RSS Feed URLs
  const RSS_FEED_URLS = [
    "https://pulamantholevaarttha.com/feed/",
    "https://feeds.feedburner.com/meenachilnews/Ubwq", 
    "https://www.meenachilnews.com/rss.xml",
    "https://erattupettanews.com/feed/",
    "https://cefakottayam.webnode.page/rss/news-.xml",
    "https://malayalam.oneindia.com/rss/feeds/oneindia-malayalam-fb.xml",
    "https://malayalam.oneindia.com/rss/feeds/malayalam-news-fb.xml",
    "https://malayalam.oneindia.com/rss/feeds/malayalam-astrology-fb.xml",
    "https://malayalam.oneindia.com/rss/feeds/oneindia-malayalam-fb.xml",
    "https://malayalam.oneindia.com/rss/feeds/malayalam-jobs-fb.xml",
  ];

  // 4️⃣ Fetch RSS News
  const fetchRSSNews = async (locationName) => {
    const CORS_PROXY = "https://api.codetabs.com/v1/proxy?quest=";
    let allNews = [];

    for (let RSS_FEED_URL of RSS_FEED_URLS) {
      try {
        const res = await fetch(`${CORS_PROXY}${encodeURIComponent(RSS_FEED_URL)}`);
        const data = await res.text();

        console.log(`✅ RAW XML FROM: ${RSS_FEED_URL}`, data);

        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");

        let items = xmlDoc.getElementsByTagName("item");

        for (let i = 0; i < items.length; i++) {
          let title = items[i].getElementsByTagName("title")[0]?.textContent || "❌ Title Not Found";
          let descriptionRaw = items[i].getElementsByTagName("description")[0]?.textContent || "❌ No Description";
          let description = cleanHTML(descriptionRaw); // Remove HTML content
          let pubDate = items[i].getElementsByTagName("pubDate")[0]?.textContent || "📅 No Date";
          let link = items[i].getElementsByTagName("link")[0]?.textContent || "#";

          // Extract image from various possible sources
          let imageUrl =
            items[i].getElementsByTagName("media:content")[0]?.getAttribute("url") ||
            items[i].getElementsByTagName("enclosure")[0]?.getAttribute("url") ||
            extractImageFromDescription(descriptionRaw) ||
            "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png";

          allNews.push({ title, description, pubDate, imageUrl, link });
        }
      } catch (error) {
        console.error(`❌ RSS Fetch Error from ${RSS_FEED_URL}:`, error);
      }
    }

    console.log("✅ Final Fetched News List:", allNews);
    filterNewsByLocation(allNews, locationName);
  };

  // Remove HTML tags and extra content from description
  const cleanHTML = (html) => {
    let doc = new DOMParser().parseFromString(html, "text/html");
    let textContent = doc.body.textContent || "";
    textContent = textContent.replace(/https?:\/\/[^\s]+/g, "");
    textContent = textContent.replace(/\s{2,}/g, " ").trim();
    textContent = textContent.split("...")[0];
    return textContent;
  };

  // Extract image URL from HTML description if available
  const extractImageFromDescription = (description) => {
    if (!description) return "";
    const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/);
    return imgMatch ? imgMatch[1] : "";
  };

  // Mapping English location names to Malayalam (if needed)
  const locationMap = {
    "kottayam": "കോട്ടയം",
    "poonjar": "പൂഞ്ഞാർ",
    "meenachil": "മീനച്ചിൽ",
    "kerala": "കേരളം",
    "ernakulam": "എറണാകുളം",
    "pathanamthitta": "പത്തനംതിട്ട",
    "thiruvananthapuram": "തിരുവനന്തപരം",
    "Pulamanthole": "പുലാമന്തോൾ",
    "Tirur": "തിരൂർ",
    "kuttipuram": "കുറ്റിപ്പുറം",
    "paloor": "പാലൂർ",
    "melattur": "മേലാറ്റൂർ"
  };

  // Filter news articles by matching location keywords
  const filterNewsByLocation = (newsList, userLocation) => {
    if (!userLocation) {
      console.log("❌ User location not detected. Showing general news.");
      setNews(newsList.slice(0, 10));
      setLoading(false);
      return;
    }

    let englishLocation = userLocation.toLowerCase();
    let malayalamLocation = locationMap[englishLocation] || englishLocation;
    let locationVariants = [malayalamLocation, ...nearbyPlaces.map((place) => place.toLowerCase())];

    console.log("🔎 Filtering news for:", locationVariants);

    let filteredNews = newsList.filter((article) => {
      let title = article.title.toLowerCase();
      let description = article.description.toLowerCase();
      return locationVariants.some((place) => title.includes(place) || description.includes(place));
    });

    console.log(`✅ Found ${filteredNews.length} location-based news articles`);
    setNews(filteredNews.length > 0 ? filteredNews : newsList.slice(0, 10));
    setLoading(false);
  };

  return (
    <div className="local-news-container">
      <h1>📰 {locationName}ലെ ഏറ്റവും പുതിയ വാർത്തകൾ</h1>
      {loading ? <p>🔄 വാർത്തകൾ ലോഡുചെയ്യുന്നു...</p> : null}
      <div className="news-list">
        {news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className="news-item" onClick={() => window.open(article.link, "_blank")}>
              <img
                src={article.imageUrl}
                alt="വാർത്താ ചിത്രം"
                className="news-image"
                onError={(e) =>
                  (e.target.src = "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png")
                }
              />
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <p className="news-date">📅 {article.pubDate}</p>
            </div>
          ))
        ) : (
          !loading && <p>❌ ഈ സ്ഥലത്തിന്റെയും യാതൊരു വാർത്തകളും ലഭ്യമല്ല.</p>
        )}
      </div>
      <button className="back-button" onClick={() => navigate("/home")}>🏠</button>
    </div>
  );
}

export default LocalNews;
