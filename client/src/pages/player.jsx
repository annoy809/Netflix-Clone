import React, { useEffect, useRef, useState } from "react";
import "./player.css";

const SERVERS = [
  /* =====================
     🌍 INTERNATIONAL (STABLE)
  ===================== */

  {
    name: "VidLink",
    build: ({ tmdbID, s, e }) =>
      s && e
        ? `https://vidlink.pro/tv/${tmdbID}/${s}/${e}`
        : `https://vidlink.pro/movie/${tmdbID}`,
  },

  {
    name: "VidSrc",
    build: ({ tmdbID, s, e }) =>
      s && e
        ? `https://vidsrc.to/embed/tv/${tmdbID}/${s}/${e}`
        : `https://vidsrc.to/embed/movie/${tmdbID}`,
  },
];



const Player = ({ selectedMovie, onClose }) => {
  const { tmdbID, season, episode, episodes } = selectedMovie || {};

  const [currentEpisode, setCurrentEpisode] = useState(
    episodes?.[0] || (season && episode ? { season, episode } : null)
  );
  const [serverIndex, setServerIndex] = useState(0);
  const [iframeSrc, setIframeSrc] = useState("");
  const [serverOpen, setServerOpen] = useState(false);

  const playerRef = useRef(null);

  /* BUILD IFRAME URL */
  useEffect(() => {
    if (!tmdbID) return;
    setIframeSrc(
      SERVERS[serverIndex].build({
        tmdbID,
        s: currentEpisode?.season,
        e: currentEpisode?.episode,
      })
    );
  }, [tmdbID, currentEpisode, serverIndex]);

  /* MOBILE VH FIX */
  useEffect(() => {
    const fixVH = () =>
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    fixVH();
    window.addEventListener("resize", fixVH);
    window.addEventListener("orientationchange", fixVH);
    return () => {
      window.removeEventListener("resize", fixVH);
      window.removeEventListener("orientationchange", fixVH);
    };
  }, []);

  return (
    <div ref={playerRef} className="netflix-player">
      {/* TOP BAR */}
      <div className="player-topbar">
        <span className="player-logo">FLIXA</span>
        <div className="top-actions">
<button
  className="server-btn"
  onClick={() => setServerOpen(!serverOpen)}
  aria-label="Servers"
>
  &#9776;
</button>

          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* SERVER DROPDOWN */}
      {serverOpen && (
        <div className="server-dropdown">
          {SERVERS.map((s, i) => (
            <button
              key={s.name}
              className={i === serverIndex ? "active" : ""}
              onClick={() => {
                setServerIndex(i);
                setServerOpen(false);
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* VIDEO ONLY (NO OVERLAYS) */}
      <div className="player-wrapper">
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          title="Player"
        />
      </div>

      {/* EPISODES */}
      {episodes?.length > 0 && (
        <div className="episode-grid">
          {episodes.map((ep) => (
            <button
              key={`${ep.season}-${ep.episode}`}
              className={
                ep.season === currentEpisode?.season &&
                ep.episode === currentEpisode?.episode
                  ? "active"
                  : ""
              }
              onClick={() => setCurrentEpisode(ep)}
            >
              S{ep.season} • E{ep.episode}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Player;
