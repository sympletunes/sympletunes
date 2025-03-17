document.addEventListener("DOMContentLoaded", () => {
    // API Keys
    const apiKeys = {
      youtube: 'AIzaSyBQIWtYcX11difFUjzD1xCGau282yqA0_c',
      lastfm: '327b9b7849f1befaa8b1f14488090040'
    };
  
    // Mapping of category IDs to YouTube search query strings
    const queryMapping = {
      official: "latest music video 2025",
      lyrics: "lyrics 2025",
      visualizer: "latest visualizer videos 2025",
      live: "artist live performance",
      choreography: "music dance videos",
      concert: "live music festivals artist recital video",
      acoustic: "unplugged performance music minimalist performances",
      cover: "music videos cover",
      djmix: "dj mix"
    };
  
    const categoryItems = document.querySelectorAll(".category-item");
    const detailsSection = document.getElementById("category-details");
    const detailsContents = document.querySelectorAll(".details-content");
  
    // Function to load 15 YouTube videos for a given category
    async function loadVideos(category) {
      const query = queryMapping[category];
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(query)}&key=${apiKeys.youtube}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const grid = document.getElementById(`video-grid-${category}`);
        if (grid) {
          grid.innerHTML = ""; // Clear previous content
          data.items.forEach(item => {
            const videoId = item.id.videoId;
            const snippet = item.snippet;
            
            // Create container for the video item
            const videoItem = document.createElement("div");
            videoItem.classList.add("video-item");
            
            // Create thumbnail element (HD image only)
            const thumbnail = document.createElement("img");
            thumbnail.src = snippet.thumbnails.high.url;
            thumbnail.alt = snippet.title;
            
            // Create title and artist elements
            const title = document.createElement("h3");
            title.textContent = snippet.title;
            const artist = document.createElement("p");
            artist.textContent = snippet.channelTitle;
            
            // Append elements to video item
            videoItem.appendChild(thumbnail);
            videoItem.appendChild(title);
            videoItem.appendChild(artist);
            
            // Click event to show video details overlay via the separate script
            videoItem.addEventListener("click", () => {
              // Calls the overlay function defined in symple-tunes-video.js
              if (window.showVideoFullOverlay) {
                window.showVideoFullOverlay(snippet, videoId);
              } else {
                console.error("Overlay function not available.");
              }
            });
            
            // Append video item to the grid
            grid.appendChild(videoItem);
          });
        }
      } catch (error) {
        console.error("Error loading videos:", error);
      }
    }
  
    // Function to show details for a given category and load its videos
    function showCategoryDetails(category) {
      detailsContents.forEach(detail => detail.classList.remove("active"));
      const activeDetail = document.getElementById(category);
      if (activeDetail) {
        activeDetail.classList.add("active");
        loadVideos(category);
      }
      detailsSection.style.display = "block";
    }
  
    // Attach click events to category items
    categoryItems.forEach(item => {
      item.addEventListener("click", function() {
        categoryItems.forEach(i => i.classList.remove("active"));
        this.classList.add("active");
        const category = this.getAttribute("data-category");
        showCategoryDetails(category);
      });
    });
  
    // Set default category to "official"
    const defaultCategory = "official";
    const defaultItem = Array.from(categoryItems).find(item => item.getAttribute("data-category") === defaultCategory);
    if (defaultItem) {
      defaultItem.classList.add("active");
      showCategoryDetails(defaultCategory);
    }
  });
  