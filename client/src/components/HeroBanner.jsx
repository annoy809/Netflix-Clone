import React, { useEffect, useState } from "react";
import "../pages/HeroBanner.css";

const TMDB_API_KEY = "80a440824f9a51de8cc051fe109b6e3c";
const SWITCH_TIME = 4000;

export default function HeroBanner({ onPlay, onInfoClick }) {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();
        setBanners(data.results.filter((item) => item.backdrop_path));
      } catch (err) {
        console.error("Banner fetch failed:", err);
      }
    }
    fetchBanner();
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % banners.length),
      SWITCH_TIME
    );
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners.length) return null;

  const banner = banners[index];
  const background = `https://image.tmdb.org/t/p/w1280${banner.backdrop_path}`;

  const title = banner.title || banner.name || "Untitled";
  const description = banner.overview || "No description available.";
  const year =
    banner.release_date?.split("-")[0] ||
    banner.first_air_date?.split("-")[0] ||
    "N/A";

  const enrichedItem = {
    ...banner,
    id: banner.id,
    media_type: banner.media_type || (banner.name ? "tv" : "movie"),
    season: 1,
    title,
    description,
  };

  return (
    <div className="hero-wrap">
      <div
        className="hero-banner-card"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="hero-banner-overlay" />

        <div className="hero-banner-content">
          <h1 className="hero-banner-title">{title}</h1>

          <div className="hero-banner-meta">
            <span>{year}</span>
            <span className="tag">HD</span>
            <span className="tag red">Flixa</span>
          </div>

          <p className="hero-banner-desc">{description}</p>

          <div className="hero-banner-buttons">
            <button
              className="hero-play"
              onClick={() =>
                onPlay({ ...enrichedItem, tvId: enrichedItem.id, seasonNumber: 1 })
              }
            >
              ▶ Play
            </button>

            <button
              className="hero-info"
              onClick={() =>
                onInfoClick({
                  ...enrichedItem,
                  tvId: enrichedItem.id,
                  seasonNumber: 1,
                })
              }
            >
              ℹ More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
