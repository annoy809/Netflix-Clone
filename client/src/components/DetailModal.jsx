import React, { useState, useEffect } from "react";
import "../pages/DetailModal.css";
import Player from "../pages/player.jsx";

const DetailModal = ({ item, onClose, tvId, seasonNumber }) => {
  if (!item) return null;

  const [tab, setTab] = useState("episodes");
  const [showPlayer, setShowPlayer] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [similarItems, setSimilarItems] = useState([]);
  const [details, setDetails] = useState(null);
  const [selectedMoreItem, setSelectedMoreItem] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(seasonNumber || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isImdbLoading, setIsImdbLoading] = useState(false);

  const API_KEY = "80a440824f9a51de8cc051fe109b6e3c";
  const isTV = item?.media_type === "tv" || !!item?.first_air_date || Array.isArray(item?.episode_run_time);

// ================= POSTER FIX =================
const posterImage =
  item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : item.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
    : item.poster // ✅ fallback from SearchModal (OMDB)
    ? item.poster
    : "https://via.placeholder.com/500x750?text=No+Image";


  useEffect(() => {
    if (!tvId) return;
    const type = isTV ? "tv" : "movie";

    const fetchData = async () => {
      try {
        setIsImdbLoading(true);
        const detailsRes = await fetch(`https://api.themoviedb.org/3/${type}/${tvId}?api_key=${API_KEY}`);
        const detailsData = await detailsRes.json();
        const extRes = await fetch(`https://api.themoviedb.org/3/${type}/${tvId}/external_ids?api_key=${API_KEY}`);
        const extData = await extRes.json();
        const similarRes = await fetch(`https://api.themoviedb.org/3/${type}/${tvId}/similar?api_key=${API_KEY}`);
        const similarData = await similarRes.json();

        setDetails({ ...detailsData, imdbID: extData.imdb_id });
        setSimilarItems(similarData.results || []);

        if (isTV) {
          setSeasons((detailsData.seasons || []).filter(s => s.season_number > 0));
          if (detailsData.seasons && detailsData.seasons.length > 0) {
            const seasonRes = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${selectedSeason}?api_key=${API_KEY}`);
            const seasonData = await seasonRes.json();
            setEpisodes(seasonData.episodes || []);
          }
        }
        setIsImdbLoading(false);
      } catch (err) {
        console.error(err);
        setIsImdbLoading(false);
      }
    };

    fetchData();
  }, [tvId, isTV, selectedSeason]);

  const playEpisode = (ep) => {
    if (!details?.imdbID) return;
    setSelectedEpisode(ep.episode_number);
    setSelectedMoreItem({
      tmdbID: tvId,
      imdbID: details.imdbID,
      season: selectedSeason,
      episode: ep.episode_number,
      name: ep.name,
    });
    setShowPlayer(true);
  };

  const handleClose = () => {
    onClose?.();
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div className="detail-modal-backdrop" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="detail-modal-container">
        <div className="detail-modal-poster">
          <img src={posterImage} alt={item.title || item.name} />
          <button className="detail-modal-play" onClick={() => {
            if (!details?.imdbID) return;
            setSelectedMoreItem({ tmdbID: tvId, imdbID: details.imdbID, name: item.title || item.name });
            setShowPlayer(true);
          }}>▶</button>
        </div>

        <div className="detail-modal-content">
          <button className="detail-modal-close" onClick={handleClose}>×</button>
          <h2>{item.title || item.name}</h2>
          <p>{item.overview}</p>

          <div className="detail-modal-tabs">
            {(isTV ? ["episodes", "more", "details"] : ["more", "details"]).map(t => (
              <div key={t} className={`detail-modal-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</div>
            ))}
          </div>

          {isTV && tab === "episodes" && (
            <div className="detail-modal-episodes">
              <div className="season-selector">
                <select value={selectedSeason} onChange={e => setSelectedSeason(Number(e.target.value))}>
                  {seasons.map(s => <option key={s.id} value={s.season_number}>Season {s.season_number}</option>)}
                </select>
              </div>
              {episodes.map(ep => (
                <div key={ep.id} className="detail-modal-episode" onClick={() => playEpisode(ep)}>
                  <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : posterImage} alt={ep.name || `Episode ${ep.episode_number}`} />
                  <div><strong>Ep {ep.episode_number}: {ep.name}</strong><p>{ep.overview}</p></div>
                </div>
              ))}
            </div>
          )}

          {tab === "more" && (
            <div className="detail-modal-more">
              <h3>More Like This</h3>
              <div className="detail-modal-more-grid">
                {similarItems.slice(0, 12).map(sim => (
                  <div key={sim.id} className="detail-modal-more-item" onClick={async () => {
                    if (!sim.id) return;
                    setIsImdbLoading(true);
                    try {
                      const type = isTV ? "tv" : "movie";
                      const res = await fetch(`https://api.themoviedb.org/3/${type}/${sim.id}/external_ids?api_key=${API_KEY}`);
                      const data = await res.json();
                      setSelectedMoreItem({
                        tmdbID: sim.id,
                        imdbID: data.imdb_id,
                        name: sim.title || sim.name,
                        poster: sim.poster_path
                          ? `https://image.tmdb.org/t/p/w500${sim.poster_path}`
                          : sim.backdrop_path
                          ? `https://image.tmdb.org/t/p/w500${sim.backdrop_path}`
                          : "https://via.placeholder.com/150x225?text=No+Image",
                      });
                      setShowPlayer(true);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsImdbLoading(false);
                    }
                  }}>
                    <img src={sim.poster_path ? `https://image.tmdb.org/t/p/w300${sim.poster_path}` : sim.backdrop_path ? `https://image.tmdb.org/t/p/w300${sim.backdrop_path}` : "https://via.placeholder.com/150x225?text=No+Image"} alt={sim.title || sim.name} />
                    <p>{sim.title || sim.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "details" && details && (
            <div className="detail-modal-details">
              <h3>Details</h3>
              <p><strong>Title:</strong> {details.title || details.name}</p>
              <p><strong>Status:</strong> {details.status}</p>
              <p><strong>Release:</strong> {details.release_date || details.first_air_date}</p>
              <p><strong>Language:</strong> {details.original_language?.toUpperCase()}</p>
              <p><strong>Rating:</strong> ⭐ {details.vote_average}</p>
              <p><strong>Votes:</strong> {details.vote_count}</p>
              <p><strong>Genres:</strong> {details.genres?.map(g => g.name).join(", ")}</p>
            </div>
          )}

          {showPlayer && selectedMoreItem && (
            <div className="detail-modal-player">
              {isImdbLoading ? <p>Loading...</p> : <Player selectedMovie={selectedMoreItem} onClose={() => setShowPlayer(false)} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
