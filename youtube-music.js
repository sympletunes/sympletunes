(function() {
  // GLOBAL VARIABLES
  let pendingVideoId = null;
  let ytPlayer;

  // API endpoints and keys
  const YOUTUBE_API_KEY = 'AIzaSyAnXYaWIpSW9dAkJm0qMEaAEqFLfJaTdBk';
  const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
  const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

  // Get current year and month
  const now = new Date();
  const currentYear = now.getFullYear();
  let currentMonth = (now.getMonth() + 1).toString();
  if (currentMonth.length < 2) currentMonth = '0' + currentMonth;

  /**
   * Cleans the track title by removing unwanted phrases.
   * @param {string} title 
   * @returns {string}
   */
  function cleanTitle(title) {
    return title
      .replace(/official\s*music\s*video/gi, '')
      .replace(/official\s*video/gi, '')
      .replace(/music\s*video/gi, '')
      .replace(/HD/gi, '')
      .trim();
  }

  /**
   * Returns true if the title suggests a DJ mix or mixtape.
   * @param {string} title 
   * @returns {boolean}
   */
  function isMix(title) {
    const lower = title.toLowerCase();
    return lower.includes("dj mix") || lower.includes("mixtape") || (lower.includes("mix") && !lower.includes("official"));
  }

  /**
   * Parses an ISO 8601 duration string (e.g., "PT3M45S") and returns duration in seconds.
   * @param {string} isoDuration 
   * @returns {number}
   */
  function parseDuration(isoDuration) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoDuration.match(regex);
    const hours = parseInt(matches[1] || 0, 10);
    const minutes = parseInt(matches[2] || 0, 10);
    const seconds = parseInt(matches[3] || 0, 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Fetches YouTube search results for a given query.
   * @param {string} query 
   * @param {number} maxResults 
   * @returns {Promise<Array>}
   */
  async function fetchTracks(query, maxResults = 3) {
    const url = `${YOUTUBE_SEARCH_URL}?part=snippet&type=video&order=date&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching YouTube tracks:', error);
      return [];
    }
  }

  /**
   * Fetches video details (including duration) from YouTube for a given video ID.
   * @param {string} videoId 
   * @returns {Promise<Object|null>}
   */
  async function fetchVideoDetails(videoId) {
    const url = `${YOUTUBE_VIDEOS_URL}?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].contentDetails;
      }
      return null;
    } catch (error) {
      console.error('Error fetching video details:', error);
      return null;
    }
  }

  /**
   * Merges two arrays of tracks and sorts them by published date (newest first).
   * Filters out any items lacking snippet or publishedAt.
   * @param {Array} array1 
   * @param {Array} array2 
   * @returns {Array}
   */
  function mergeAndSortTracks(array1, array2) {
    const merged = array1.concat(array2).filter(item => item.snippet && item.snippet.publishedAt);
    merged.sort((a, b) => {
      const dateA = new Date(a.snippet.publishedAt);
      const dateB = new Date(b.snippet.publishedAt);
      return dateB - dateA;
    });
    return merged;
  }

  /**
   * Creates an HTML article element for a track.
   * @param {string} videoId 
   * @param {string} title 
   * @param {string} thumbnail 
   * @param {string} artist 
   * @returns {string}
   */
  function createTrackArticle(videoId, title, thumbnail, artist) {
    const safeTitle = cleanTitle(title).replace(/'/g, "\\'");
    const safeArtist = artist.replace(/'/g, "\\'");
    return `
<article data-id="${videoId}" data-play-id="${videoId}" class="block-loop-item">
  <figure class="post-thumbnail">
    <div class="post-thumbnail-inner">
      <img fetchpriority="high" decoding="async" width="320" height="320" src="${thumbnail}" alt="Track Cover">
    </div>
    <div class="entry-action">
      <button class="btn-play" data-play-id="${videoId}" onclick="playAudio('${videoId}', '${safeTitle}', '${safeArtist}')">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M7 6v12l10-6z"/>
        </svg>
      </button>
    </div>
  </figure>
  <header class="entry-header">
    <div class="entry-header-inner">
      <h3 class="entry-title"><a href="#">${cleanTitle(title)}</a></h3>
      <div class="entry-meta">
        <span class="entry-artist">${artist}</span>
      </div>
    </div>
  </header>
  <div class="add_to_cart_inline">
    <a href="symple-tunes-play.html" class="action-btn" target="_blank">
      <img src="https://cdn-icons-png.flaticon.com/512/724/724933.png" alt="" class="icon">
    </a>
    <a href="symple-tunes-play.html" class="action-btn -btn" target="_blank">
      <img src="https://cdn-icons-png.flaticon.com/512/1380/1380338.png" alt="" class="icon">
    </a>
  </div>
</article>
    `;
  }

  /**
   * Loads trending pop and rap tracks from YouTube for USA and UK.
   * Uses search queries for trending pop and rap songs.
   * Filters out videos with mix/mixtape titles, videos longer than 5 minutes,
   * and those not published in the current year and month.
   * Displays the top 10 results in the trending-tracks container.
   */
  async function loadTrendingTracks() {
    // Define queries for USA and UK: (using "trending" keywords)
    const queries = [
      "trending USA rap songs official audio",
      "trending USA pop songs official audio",
      "trending UK rap songs official audio",
      "trending UK pop songs official audio"
    ];

    let results = [];
    // Fetch 3 results for each query
    for (const q of queries) {
      const items = await fetchTracks(q, 3);
      results = results.concat(items);
    }

    let mergedTracks = mergeAndSortTracks(results, []);

    // Filter out tracks
    const filteredTracks = [];
    for (const item of mergedTracks) {
      if (!item.id || !item.id.videoId || !item.snippet) continue;
      const videoId = item.id.videoId;
      const title = item.snippet.title || "";
      const artist = item.snippet.channelTitle || "Unknown Artist";
      if (isMix(title)) {
        console.log(`Filtered out mix: ${title}`);
        continue;
      }
      const details = await fetchVideoDetails(videoId);
      if (!details || !details.duration) continue;
      const durationSec = parseDuration(details.duration);
      if (durationSec > 300) { // skip videos longer than 5 minutes
        console.log(`Filtered out long video (${durationSec}s): ${title}`);
        continue;
      }
      const publishedDate = new Date(item.snippet.publishedAt);
      if (publishedDate.getFullYear() !== currentYear || (publishedDate.getMonth() + 1) !== parseInt(currentMonth)) {
        console.log(`Filtered out video not in current month: ${title}`);
        continue;
      }
      filteredTracks.push(item);
    }

    // Sort filtered tracks and take top 10
    filteredTracks.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
    const topTracks = filteredTracks.slice(0, 10);

    const container = document.querySelector('#trending-tracks .block-loop-items');
    if (!container) {
      console.error('Trending tracks container not found.');
      return;
    }
    container.innerHTML = '';
    topTracks.forEach(item => {
      const videoId = item.id.videoId;
      const title = item.snippet.title || "Unknown Title";
      const artist = item.snippet.channelTitle || "Unknown Artist";
      const thumbnail = item.snippet.thumbnails?.medium?.url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      container.innerHTML += createTrackArticle(videoId, title, thumbnail, artist);
    });
  }

  // === AUDIO PLAYER LOGIC: Play track directly (no pre/post roll) ===
  function playTrack(videoId, trackName, trackArtist) {
    console.log("Preparing to play track:", trackName, "with videoId:", videoId);
    const titleEl = document.querySelector("#music-player .track-title");
    const artistEl = document.querySelector("#music-player .track-artist");
    if (titleEl) titleEl.textContent = trackName;
    if (artistEl) artistEl.textContent = trackArtist;
    if (ytPlayer) {
      ytPlayer.loadVideoById(videoId);
    } else {
      console.error("YouTube player not initialized.");
    }
  }

  // Expose playAudio globally so inline onclicks work
  window.playAudio = function(videoId, trackName, trackArtist) {
    playTrack(videoId, trackName, trackArtist);
  };

  // === PROGRESS & VOLUME CONTROLS ===
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
      const currentTimeEl = document.querySelector(".current-time");
      const totalTimeEl = document.querySelector(".total-time");
      if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
      if (totalTimeEl) totalTimeEl.textContent = formatTime(duration);
    }
  }, 500);

  // === YOUTUBE PLAYER SETUP ===
  document.addEventListener("DOMContentLoaded", function() {
    // Ensure the YouTube container exists
    let ytContainer = document.getElementById("youtube-player");
    if (!ytContainer) {
      ytContainer = document.createElement("div");
      ytContainer.id = "youtube-player";
      ytContainer.style.width = "0";
      ytContainer.style.height = "0";
      document.body.appendChild(ytContainer);
    }
    // Initialize control event listeners
    const playPauseBtn = document.getElementById("play-pause");
    playPauseBtn.addEventListener("click", function() {
      if (ytPlayer) {
        const state = ytPlayer.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
          ytPlayer.pauseVideo();
          this.textContent = "▶";
        } else {
          ytPlayer.playVideo();
          this.textContent = "⏸";
        }
      }
    });
    document.getElementById("prev-track").addEventListener("click", function() {
      console.log("Previous track button clicked.");
      // TODO: Implement previous track logic if desired
    });
    document.getElementById("next-track").addEventListener("click", function() {
      console.log("Next track button clicked.");
      // TODO: Implement next track logic if desired
    });
    document.getElementById("volume-slider").addEventListener("input", function(event) {
      const volume = event.target.value;
      if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(volume);
      }
    });
    // Load trending tracks (merged pop and rap for USA and UK drill/rap/pop) for current month/year
    loadTrendingTracks();
  });

  // YouTube IFrame API callback
  window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player("youtube-player", {
      height: "0",
      width: "0",
      videoId: "",
      playerVars: { origin: window.location.origin },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  };

  function onPlayerReady(event) {
    console.log("YouTube player ready");
    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
      ytPlayer.setVolume(volumeSlider.value);
    }
  }

  function onPlayerStateChange(event) {
    // You can add further state change handling here if needed
  }
})();
