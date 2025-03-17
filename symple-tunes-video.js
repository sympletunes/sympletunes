document.addEventListener("DOMContentLoaded", () => {
  const apiKey = 'AIzaSyBQIWtYcX11difFUjzD1xCGau282yqA0_c'; // Replace with your actual API key

  // Function to return the overlay element
  function createOverlay() {
      let overlay = document.getElementById("video-detail-section");
      if (!overlay) console.error("Overlay element not found.");
      return overlay;
  }

  // Function to load similar videos using a fallback search (keyword based)
  async function loadSimilarVideos(fallbackQuery) {
      let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=5&q=${encodeURIComponent(fallbackQuery)}&key=${apiKey}`;
      
      try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`API request failed: ${res.status}`);
          const data = await res.json();

          if (!data.items || data.items.length === 0) 
              throw new Error("No videos found with the given query");

          populateSimilarVideos(data.items);
      } catch (error) {
          console.error("Error loading similar videos:", error);
      }
  }

  // Function to populate the similar videos list
  function populateSimilarVideos(items) {
      const container = document.getElementById("similar-videos-list");
      container.innerHTML = ""; // Clear previous results

      items.forEach(item => {
          const simVideoId = item.id.videoId;
          const snippet = item.snippet;
          const simVideo = document.createElement("div");
          simVideo.style.cursor = "pointer";
          simVideo.style.display = "flex";
          simVideo.style.gap = "10px";
          simVideo.style.alignItems = "center";

          simVideo.innerHTML = `
              <img src="${snippet.thumbnails.default.url}" alt="${snippet.title}" style="width:60px; height:45px; object-fit:cover; border-radius:4px;" />
              <div style="font-size:0.8rem; color:#fff;">${snippet.title}</div>
          `;

          simVideo.addEventListener("click", () => {
              showVideoFullOverlay(snippet, simVideoId);
          });

          container.appendChild(simVideo);
      });
  }

  // Function to display video overlay with embedded player
  window.showVideoFullOverlay = function (snippet, videoId) {
      console.log("Displaying video:", snippet.title, videoId);
      const overlay = createOverlay();
      if (!overlay) return;

      // Display YouTube player
      const playerSection = document.getElementById("video-player-section");
      if (!playerSection) {
          console.error("Video player section missing.");
          return;
      }
      playerSection.innerHTML = ""; // Clear previous video

      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.allow = "autoplay; encrypted-media";
      playerSection.appendChild(iframe);

      // Update video details
      document.getElementById("overlay-video-title").textContent = snippet.title;
      document.getElementById("overlay-video-channel").textContent = snippet.channelTitle;
      document.getElementById("overlay-video-description").textContent = snippet.description || "No description available.";

      // Fetch similar videos using a fallback query based on the video title
      loadSimilarVideos(snippet.title + " music");

      // Show the overlay
      overlay.style.display = "flex";
  };

  // Attach close event for the overlay
  const closeBtn = document.getElementById("close-video-detail");
  if (closeBtn) {
      closeBtn.addEventListener("click", () => {
          const overlay = document.getElementById("video-detail-section");
          if (overlay) overlay.style.display = "none";
      });
  } else {
      console.error("Close button not found.");
  }

  // Dummy comment submit handler
  const commentForm = document.getElementById("comment-form");
  if (commentForm) {
      commentForm.addEventListener("submit", (e) => {
          e.preventDefault();
          alert("Comment submitted!");
          e.target.reset();
      });
  }
});
