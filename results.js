document.addEventListener("DOMContentLoaded", async function () {
  // === Responsive & Modern CSS Styling ===
  const style = document.createElement("style");
  style.innerHTML = `
    /* General Reset */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 1rem; }
    
    /* Header for Artist Profiles */
    .artist-profiles-header {
      font-size: 1.8rem;
      font-weight: bold;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    /* Artist Profiles Container */
    .artist-profiles-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .artist-profile-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 240px;
      height: 360px;
      border: 1px solid #ddd;
      padding: 1rem;
      background: #fff;
      border-radius: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .artist-profile-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }
    .artist-profile-item img {
      width: 180px;
      height: 180px;
      object-fit: cover;
      border-radius: 50%;
      margin-bottom: 0.5rem;
    }
    .artist-details {
      text-align: center;
      width: 100%;
    }
    
    /* Other Category Items */
    .search-result-item {
      border: 1px solid #ddd;
      padding: 1rem;
      margin: 0.5rem;
      border-radius: 8px;
      background: #fff;
      transition: transform 0.2s, box-shadow 0.2s;
      text-align: center;
    }
    .search-result-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }
    .search-result-item img {
      width: 100%;
      max-width: 100px;
      height: auto;
      margin-bottom: 0.5rem;
    }
    
    /* Album Container */
    .album-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    .album-container > h2 {
      width: 100%;
      margin-bottom: 1rem;
    }
    .album-item {
      flex: 1 1 calc(33.33% - 1rem);
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 8px;
      padding: 0.5rem;
    }
    .album-item img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }
    
    /* News Section (Guardian API) */
    .category-section {
      margin-bottom: 2rem;
    }
    .news-item {
      border: 1px solid #ddd;
      padding: 1rem;
      margin: 0.5rem;
      border-radius: 8px;
      background: #fff;
      text-align: center;
    }
    .news-item img {
      width: 100%;
      max-width: 100px;
      height: auto;
      margin-bottom: 0.5rem;
    }
    
    /* Responsive Behavior */
    @media (max-width: 768px) {
      .artist-profiles-container, .category-section, .album-container {
        flex-direction: column;
        align-items: center;
      }
      .artist-profile-item, .search-result-item, .album-item {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);

  // === API Keys & Audio Setup ===
  const apiKeys = {
    youtube: 'AIzaSyBQIWtYcX11difFUjzD1xCGau282yqA0_c',
    lastfm: '327b9b7849f1befaa8b1f14488090040'
  };
  const GUARDIAN_API_KEY = '316f4439-426a-4ddd-8ae6-3232e90388e3';
  const customSoundURL = "sympletunecostomsound.mp3";
  const preRollAudio = new Audio(customSoundURL);
  const postRollAudio = new Audio(customSoundURL);
  let isPreRollPlaying = false;

  // === DOM Containers & Initialization ===
  const searchResultsContainer = document.getElementById("symple-search-results-container");
  if (!searchResultsContainer) {
    console.error("❌ Required container 'symple-search-results-container' not found.");
    return;
  }

  // Get the search query from the URL - check both 'q' and 's'
  const urlParams = new URLSearchParams(window.location.search);
  const query = (urlParams.get('q') || urlParams.get('s'))?.trim();
  if (!query) {
    searchResultsContainer.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }
  
  // Display the search query on the page
  const searchQueryEl = document.getElementById("search-query");
  if (searchQueryEl) {
    searchQueryEl.textContent = query;
  }

  // Global arrays for fetched data
  window.artistProfiles = [];
  window.sampleTracks = [];
  window.sampleAlbums = [
    { cover: "sympletunesdefaultcover.jpg", artist: "Artist One", name: "Album One", releaseDate: "N/A" }
  ];
  window.sampleVideos = [];
  window.sampleNews = [];

  // Mapping country codes to full names
  const countryMapping = {
    "GH": "Ghana",
    "US": "United States",
    "GB": "United Kingdom"
  };

  // === FETCH ARTIST PROFILES FROM MUSICBRAINZ & ENRICH DETAILS ===
  async function fetchMusicBrainzInfo(query) {
    try {
      const baseQuery = query.charAt(0).toUpperCase() + query.slice(1);
      const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(baseQuery)}&fmt=json`;
      const response = await fetch(url, {
        headers: { "User-Agent": "SympleTunes/1.0 (your-email@example.com)" }
      });
      if (!response.ok) throw new Error(`MusicBrainz API failed: ${response.status}`);
      const data = await response.json();
      if (data.artists && data.artists.length > 0) {
        let filtered = data.artists.filter(artist =>
          artist.name.toLowerCase().includes(query.toLowerCase())
        );
        filtered.sort((a, b) => {
          if (a.name.toLowerCase() === query.toLowerCase()) return -1;
          if (b.name.toLowerCase() === query.toLowerCase()) return 1;
          return 0;
        });
        window.artistProfiles = filtered;
        for (let artist of window.artistProfiles) {
          if (!artist.country) artist.country = "N/A";
          if (!artist["life-span"] || !artist["life-span"].begin) {
            artist["life-span"] = { begin: "N/A" };
          }
          const lastFmInfo = await fetchLastFmArtistInfo(artist.name);
          if (lastFmInfo && lastFmInfo.tags?.tag?.length) {
            artist.genre = lastFmInfo.tags.tag[0].name;
          }
          const wikiData = await fetchWikipediaArtistData(artist.name);
          if (wikiData) {
            if (wikiData.image) artist.image = wikiData.image;
            if ((!artist.country || artist.country === "N/A") && wikiData.description) {
              artist.country = wikiData.description;
            }
          }
          if (!artist.image) {
            if (lastFmInfo && lastFmInfo.image?.length) {
              artist.image = lastFmInfo.image[lastFmInfo.image.length - 1]["#text"];
            } else {
              artist.image = `https://dummyimage.com/300x300/cccccc/000000.png?text=${encodeURIComponent(artist.name)}`;
            }
          }
          if (!artist.genre) artist.genre = "N/A";
        }
      }
    } catch (error) {
      console.error("❌ Error fetching MusicBrainz info:", error);
      searchResultsContainer.innerHTML += `
        <div class="artist-profiles-container">
          <p>No artist information found.</p>
          <hr>
        </div>
      `;
    }
  }

  // === FETCH LAST.FM INFO FOR ARTIST ===
  async function fetchLastFmArtistInfo(artistName) {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=${encodeURIComponent(artistName)}&api_key=${apiKeys.lastfm}&format=json`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Last.fm API failed: ${response.status}`);
      const data = await response.json();
      return data.artist;
    } catch (error) {
      console.error("Error fetching Last.fm info for", artistName, error);
      return null;
    }
  }

  // === FETCH WIKIPEDIA DATA FOR ARTIST ===
  async function fetchWikipediaArtistData(artistName) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artistName)}`;
    try {
      const res = await fetch(url);
      if (res.status === 404) {
        console.warn(`Wikipedia page not found for ${artistName}`);
        return null;
      }
      if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);
      const data = await res.json();
      return {
        image: data.thumbnail ? data.thumbnail.source : null,
        description: data.description || "",
        extract: data.extract || ""
      };
    } catch (error) {
      console.error("Error fetching Wikipedia data for", artistName, error);
      return null;
    }
  }

  // === FETCH TRACKS & VIDEOS FROM YOUTUBE & LAST.FM ===
  async function fetchSearchResults(query) {
    try {
      const youtubePromise = fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query + " music")}&key=${apiKeys.youtube}&maxResults=5`
      );
      const lastFmPromise = fetch(
        `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${apiKeys.lastfm}&format=json`
      );
      const [youtubeResponse, lastFmResponse] = await Promise.all([youtubePromise, lastFmPromise]);
      const youtubeResults = youtubeResponse.ok ? await youtubeResponse.json() : { items: [] };
      if (!lastFmResponse.ok) throw new Error(`Last.fm API failed: ${lastFmResponse.status}`);
      const lastFmResults = await lastFmResponse.json();
      
      // Populate sampleTracks from YouTube search results
      window.sampleTracks = youtubeResults.items.map(item => {
        const thumb = item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : "";
        return {
          videoId: item.id.videoId,
          name: item.snippet.title,
          artist: item.snippet.channelTitle,
          image: thumb,
          listeners: "N/A"
        };
      });
      
      // Also assign sampleVideos to the same five videos from YouTube
      window.sampleVideos = youtubeResults.items.slice(0,5).map(item => {
        const thumb = item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : "";
        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          image: thumb
        };
      });
      
      // Enrich track info with Last.fm data if available
      if (lastFmResults &&
          lastFmResults.results &&
          lastFmResults.results.trackmatches &&
          lastFmResults.results.trackmatches.track) {
        let lastFmTracks = lastFmResults.results.trackmatches.track;
        if (!Array.isArray(lastFmTracks)) lastFmTracks = [lastFmTracks];
        window.sampleTracks = window.sampleTracks.map(track => {
          const match = lastFmTracks.find(lfm =>
            lfm.name && lfm.name.toLowerCase() === track.name.toLowerCase()
          );
          if (match && match.listeners) {
            track.listeners = match.listeners;
          }
          return track;
        });
      }
    } catch (error) {
      console.error("❌ Error fetching search results:", error);
      searchResultsContainer.innerHTML += "<p>Error fetching search results</p>";
    }
  }

  // === HELPER: FETCH ALBUM RELEASE DATE FROM MUSICBRAINZ ===
  async function fetchMusicBrainzAlbumReleaseDate(artistName, albumName) {
    try {
      const query = `release:"${albumName}" AND artist:"${artistName}"`;
      const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=1`;
      const response = await fetch(url, {
        headers: { "User-Agent": "SympleTunes/1.0 (your-email@example.com)" }
      });
      if (!response.ok) throw new Error(`MusicBrainz Release API failed: ${response.status}`);
      const data = await response.json();
      if (data.releases && data.releases.length > 0 && data.releases[0].date) {
        return data.releases[0].date;
      }
    } catch (error) {
      console.error("Error fetching release date from MusicBrainz for", albumName, error);
    }
    return "N/A";
  }

  // === FETCH ALBUMS FROM LAST.FM & ENRICH WITH RELEASE DATE ===
  async function fetchAlbumData(query) {
    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(query)}&api_key=${apiKeys.lastfm}&format=json&limit=10`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Last.fm Album API failed: ${response.status}`);
      const data = await response.json();
      if (data.results && data.results.albummatches && data.results.albummatches.album) {
        window.sampleAlbums = await Promise.all(
          data.results.albummatches.album.map(async album => {
            let cover = "sympletunesdefaultcover.jpg";
            if (album.image && album.image.length > 0) {
              cover = album.image[album.image.length - 1]["#text"] || cover;
            }
            const releaseDate = await fetchMusicBrainzAlbumReleaseDate(album.artist, album.name);
            return {
              cover: cover,
              artist: album.artist,
              name: album.name,
              releaseDate: releaseDate
            };
          })
        );
      }
    } catch (error) {
      console.error("Error fetching album data:", error);
    }
  }

  // === FETCH NEWS CONTENT USING THE GUARDIAN API (including summary) ===
  async function fetchNewsContent(query) {
    try {
      const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&api-key=${GUARDIAN_API_KEY}&show-fields=thumbnail,headline,trailText,short-url`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Guardian API failed: ${response.status}`);
      const data = await response.json();
      if (data.response && data.response.results && data.response.results.length > 0) {
        window.sampleNews = data.response.results.map(item => {
          return {
            image: item.fields && item.fields.thumbnail ? item.fields.thumbnail : "https://dummyimage.com/300x200/cccccc/000000.png?text=News",
            headline: item.webTitle,
            info: item.fields && item.fields.trailText ? item.fields.trailText : "",
            source: item.sectionName ? item.sectionName : "Symple Tunes",
            date: new Date(item.webPublicationDate).toLocaleDateString()
          };
        });
      } else {
        window.sampleNews = [{
          image: "https://dummyimage.com/300x200/cccccc/000000.png?text=News",
          headline: "No news articles found.",
          info: "",
          source: "Symple Tunes",
          date: ""
        }];
      }
    } catch (error) {
      console.error("Error fetching news content:", error);
      window.sampleNews = [{
        image: "https://dummyimage.com/300x200/cccccc/000000.png?text=News",
        headline: "Error fetching news articles.",
        info: "",
        source: "Symple Tunes",
        date: ""
      }];
    }
  }

  // === INITIAL FETCH CALLS ===
  await fetchMusicBrainzInfo(query);
  await fetchSearchResults(query);
  await fetchAlbumData(query);
  await fetchNewsContent(query);

  // === RENDERING FUNCTIONS (with Deduplication) ===
  function renderResults(filter, isSummary) {
    searchResultsContainer.innerHTML = "";
    let html = "";
    if (filter === "all" || filter === "profiles") {
      html += `<div class="artist-profiles-header">Artist Profiles</div>`;
      html += renderProfiles(isSummary ? 3 : null);
    }
    if (filter === "all" || filter === "tracks") {
      html += renderTracks(isSummary ? 5 : 7);
    }
    if (filter === "all" || filter === "albums") {
      html += (filter === "all") ? renderAlbums(3) : renderAlbums();
    }
    if (filter === "all" || filter === "videos") {
      html += renderVideos(5);
    }
    if (filter === "all" || filter === "news") {
      html += renderNews(isSummary ? 7 : null);
    }
    searchResultsContainer.innerHTML += html;
  }

  // Render Artist Profiles.
  function renderProfiles(limit) {
    let profiles = window.artistProfiles.slice();
    const seen = new Set();
    profiles = profiles.filter(artist => {
      if (seen.has(artist.name)) return false;
      seen.add(artist.name);
      return true;
    });
    if (limit) profiles = profiles.slice(0, limit);
    let section = `<div class="artist-profiles-container">`;
    profiles.forEach(artist => {
      const fullCountry = artist.country ? (countryMapping[artist.country] || artist.country) : "N/A";
      const dateOfBirth = (artist["life-span"] && artist["life-span"].begin) ? artist["life-span"].begin : "N/A";
      let yearsActive = dateOfBirth;
      if (artist["life-span"] && artist["life-span"].ended === "true" && artist["life-span"].end) {
        yearsActive += " - " + artist["life-span"].end;
      }
      const genre = artist.genre || "N/A";
      section += `
        <div class="artist-profile-item">
          <img src="${artist.image}" alt="${artist.name}">
          <div class="artist-details">
            <p><strong>Country:</strong> ${fullCountry}</p>
            <p><strong>Date of Birth:</strong> ${dateOfBirth}</p>
            <p><strong>Years Active:</strong> ${yearsActive}</p>
            <p><strong>Genre:</strong> ${genre}</p>
          </div>
        </div>
      `;
    });
    section += `</div><hr>`;
    return section;
  }

  // Render Tracks.
  function renderTracks(limit) {
    let tracks = window.sampleTracks.slice();
    const seen = new Set();
    tracks = tracks.filter(track => {
      if (seen.has(track.name)) return false;
      seen.add(track.name);
      return true;
    });
    if (limit) tracks = tracks.slice(0, limit);
    let section = `<div class="category-section"><h2>Tracks</h2>`;
    tracks.forEach(track => {
      let cleanTitle = track.name.replace(/[\(\[\{].*?[\)\]\}]/g, "").trim();
      section += `
        <div class="search-result-item track-item">
          <img src="${track.image || "sympletunesdefaultcover.jpg"}" alt="${track.name}" style="max-width:100px;">
          <div class="track-details">
            <h3>${cleanTitle}</h3>
            <p>Artist: ${track.artist}</p>
            <p>Listeners: <strong>${isNaN(Number(track.listeners)) ? track.listeners : track.listeners}</strong></p>
            <div class="track-actions">
              <button onclick="playTrack('${track.videoId}', '${track.name}', '${track.artist}')" title="Play ▶">▶</button>
              <a href="sympletunes-download.html" target="_blank">
                <button title="Download ⬇">⬇</button>
              </a>
              <button title="Share 🔗">🔗</button>
              <button title="Comment 💬">💬</button>
            </div>
          </div>
        </div>
      `;
    });
    section += `</div>`;
    return section;
  }

  // Render Albums.
  function renderAlbums(limit) {
    let albums = window.sampleAlbums.slice();
    const seen = new Set();
    albums = albums.filter(album => {
      const key = album.cover + album.artist + album.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (limit) albums = albums.slice(0, limit);
    let section = `<div class="album-container"><h2>Albums</h2>`;
    albums.forEach(album => {
      section += `
        <div class="album-item">
          <img src="${album.cover}" alt="Album Cover">
          <div class="album-info">
            <h3>${album.name}</h3>
            <p>${album.artist}</p>
            <p>Release Date: ${album.releaseDate}</p>
          </div>
          <div class="album-actions">
            <button title="Share 🔗">🔗</button>
            <button title="Comment 💬">💬</button>
          </div>
        </div>
      `;
    });
    section += `</div>`;
    return section;
  }

  // Render Videos.
  function renderVideos(limit) {
    let videos = window.sampleVideos.slice();
    const seen = new Set();
    videos = videos.filter(video => {
      if (seen.has(video.title)) return false;
      seen.add(video.title);
      return true;
    });
    if (limit) videos = videos.slice(0, limit);
    let section = `<div class="category-section"><h2>Videos</h2>`;
    videos.forEach(video => {
      section += `
        <div class="search-result-item video-item">
          <img src="${video.image}" alt="${video.title}" style="max-width:100px;">
          <div class="video-details">
            <h3>${video.title}</h3>
            <p>Artist: ${video.artist}</p>
            <div class="video-actions">
              <a href="sympletunes-videos.html" target="_blank">
                <button title="Watch ▶">▶</button>
              </a>
              <a href="sympletunes-download.html" target="_blank">
                <button title="Download ⬇">⬇</button>
              </a>
              <button title="Share 🔗">🔗</button>
              <button title="Comment 💬">💬</button>
            </div>
          </div>
        </div>
      `;
    });
    section += `</div>`;
    return section;
  }

  // Render News Updates.
  function renderNews(limit) {
    let news = window.sampleNews.slice();
    const seen = new Set();
    news = news.filter(item => {
      if (seen.has(item.headline)) return false;
      seen.add(item.headline);
      return true;
    });
    if (limit) news = news.slice(0, limit);
    let section = `<div class="category-section"><h2>News Updates</h2>`;
    news.forEach(item => {
      section += `
        <div class="news-item">
          <img src="${item.image}" alt="News Image">
          <div class="news-details">
            <h3>${item.headline}</h3>
            <p>${item.info}</p>
            <div class="news-meta">
              <span>Source: ${item.source}</span> | <span>Date: ${item.date}</span>
            </div>
            <div class="news-actions">
              <button title="Share 🔗">🔗</button>
              <button title="Comment 💬">💬</button>
            </div>
          </div>
        </div>
      `;
    });
    section += `</div>`;
    return section;
  }

  // === AUDIO PLAYER LOGIC WITH CUSTOM PRE-/POST-ROLL AND OVERLAP ===
  // This function is triggered by a user click.
  let ytPlayer;
  let pendingVideoId = null; // Only declare once
  function playTrack(videoId, trackName, trackArtist) {
    console.log("Preparing to play track:", trackName, "with videoId:", videoId);
    const titleEl = document.querySelector("#music-player .track-title");
    const artistEl = document.querySelector("#music-player .track-artist");
    let cleanTitle = trackName.replace(/[\(\[\{].*?[\)\]\}]/g, "").trim();
    if (titleEl && cleanTitle) {
      titleEl.textContent = cleanTitle;
    }
    if (artistEl) artistEl.textContent = trackArtist;
    pendingVideoId = videoId;
    
    if (isPreRollPlaying) return;
    isPreRollPlaying = true;
    
    if (ytPlayer && ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
    }
    
    preRollAudio.currentTime = 0;
    preRollAudio.addEventListener("loadedmetadata", function onMeta() {
      const overlapDelay = (preRollAudio.duration - 2) * 1000;
      setTimeout(() => {
        console.log("Overlap triggered: starting YouTube video with overlap.");
        if (ytPlayer) {
          ytPlayer.loadVideoById(videoId);
        }
      }, overlapDelay);
      preRollAudio.removeEventListener("loadedmetadata", onMeta);
    });
    
    preRollAudio.play().then(() => {
      console.log("Custom pre-roll started.");
    }).catch(err => {
      console.error("Error playing pre-roll audio:", err);
      isPreRollPlaying = false;
    });
    
    preRollAudio.onended = function() {
      if (ytPlayer) {
        ytPlayer.loadVideoById(videoId);
      }
      isPreRollPlaying = false;
    };
  }

  // Update progress bar and time display.
  const progressEl = document.querySelector(".progress");
  function seekAudio(event) {
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percent = clickX / rect.width;
    if (ytPlayer && ytPlayer.getDuration) {
      ytPlayer.seekTo(ytPlayer.getDuration() * percent, true);
    }
  }
  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return minutes + ":" + (secs < 10 ? "0" : "") + secs;
  }
  setInterval(() => {
    if (ytPlayer && ytPlayer.getCurrentTime && ytPlayer.getDuration) {
      const current = ytPlayer.getCurrentTime();
      const duration = ytPlayer.getDuration();
      const percent = (current / duration) * 100;
      if (progressEl) progressEl.style.width = percent + "%";
      document.querySelector(".current-time").textContent = formatTime(current);
      document.querySelector(".total-time").textContent = formatTime(duration);
    }
  }, 500);

  // === YOUTUBE PLAYER SETUP ===
  let ytContainer = document.getElementById("youtube-player");
  if (!ytContainer) {
    ytContainer = document.createElement('div');
    ytContainer.id = "youtube-player";
    ytContainer.style.width = "0";
    ytContainer.style.height = "0";
    document.body.appendChild(ytContainer);
  }
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: '',
      playerVars: { origin: window.location.origin },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  };
  function onPlayerReady(event) {
    console.log("YouTube player ready");
    if (pendingVideoId) {
      ytPlayer.loadVideoById(pendingVideoId);
      pendingVideoId = null;
    }
  }
  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
      console.log("YouTube video ended. Playing custom post-roll...");
      postRollAudio.play().catch(err => console.error("Error playing post-roll audio:", err));
    }
  }
  window.playTrack = playTrack;
  const ytTag = document.createElement('script');
  ytTag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(ytTag, firstScriptTag);

  // === FILTERING NAVIGATION ===
  const navLinks = document.querySelectorAll(".results-list-container a");
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      searchResultsContainer.innerHTML = "";
      navLinks.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
      const filter = this.dataset.filter;
      const isSummary = (filter === "all");
      renderResults(filter, isSummary);
    });
  });

  // Render all results in summary mode by default.
  renderResults("all", true);
});
