document.addEventListener("DOMContentLoaded", () => {
  // Fixed list of top countries with "Dubai" added after "South Africa"
  const topCountries = [
    "Ghana", "Nigeria", "South Africa", "Dubai", "Kenya", "Egypt", "China",
    "India", "Japan", "Indonesia", "South Korea", "United Kingdom",
    "Germany", "France", "Italy", "Spain", "United States", "Brazil",
    "Mexico", "Argentina", "Canada"
  ];

  // Placeholder URLs for missing images
  const DEFAULT_FLAG_URL = 'https://via.placeholder.com/20x14?text=Flag';
  const DEFAULT_RADIO_LOGO = 'https://via.placeholder.com/80x80?text=Radio';

  // Helper: Convert country name to ISO country code for flag images
  function getCountryCode(countryName) {
    const mapping = {
      "Ghana": "gh",
      "Nigeria": "ng",
      "South Africa": "za",
      "Dubai": "ae",
      "Kenya": "ke",
      "Egypt": "eg",
      "China": "cn",
      "India": "in",
      "Japan": "jp",
      "Indonesia": "id",
      "South Korea": "kr",
      "United Kingdom": "gb",
      "Germany": "de",
      "France": "fr",
      "Italy": "it",
      "Spain": "es",
      "United States": "us",
      "Brazil": "br",
      "Mexico": "mx",
      "Argentina": "ar",
      "Canada": "ca"
    };
    return mapping[countryName] || "unknown";
  }

  // Populate the country row with the fixed list of countries
  function populateCountryRow() {
    const countryRow = document.getElementById("country-row");
    if (!countryRow) {
      console.error("Country row element not found.");
      return;
    }
    countryRow.innerHTML = "";
    
    topCountries.forEach(country => {
      const button = document.createElement("button");
      button.classList.add("country-button");
      button.dataset.country = country.toLowerCase();
      button.innerHTML = `<span class="country-name">${country}</span>`;
      button.addEventListener("click", () => {
        document.querySelectorAll('.country-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add("active");
        fetchRadioStations(button.dataset.country);
      });
      countryRow.appendChild(button);
    });
    
    // Set default country (Ghana)
    const defaultButton = Array.from(document.querySelectorAll('.country-button'))
      .find(btn => btn.dataset.country === "ghana");
    if (defaultButton) {
      defaultButton.classList.add("active");
      fetchRadioStations(defaultButton.dataset.country);
    } else if (countryRow.firstChild) {
      countryRow.firstChild.classList.add("active");
      fetchRadioStations(countryRow.firstChild.dataset.country);
    }
  }

  // Fetch stations from multiple sources for a given country and merge them by station name
  async function fetchAllStationsFromSources(country) {
    const endpoints = [
      `https://de1.api.radio-browser.info/json/stations/bycountry/${country}`,
      `https://at1.api.radio-browser.info/json/stations/bycountry/${country}`,
      `https://www.radio-api.com/api/stations?country=${country}`,
      `https://dir.xiph.org/json/stations?country=${country}`,
      `https://api.radiogarden.com/api/country/${country}/stations`,
      `https://live365.com/api/stations?country=${country}`
    ];
    
    try {
      const results = await Promise.all(
        endpoints.map(url =>
          fetch(url)
            .then(res => res.json())
            .catch(err => {
              console.error("Error fetching from:", url, err);
              return [];
            })
        )
      );
      
      const mergedStations = {};
      results.flat().forEach(station => {
        if (!station.name) return;
        const key = station.name.toLowerCase();
        if (!mergedStations[key]) {
          mergedStations[key] = {};
        }
        Object.assign(mergedStations[key], station);
      });
      
      let allStations = Object.values(mergedStations);
      allStations.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      return allStations;
    } catch (error) {
      console.error("Error fetching stations:", error);
      return [];
    }
  }

  // Fetch and render all available radio stations for a given country
  async function fetchRadioStations(country) {
    const stations = await fetchAllStationsFromSources(country);
    const radioContainer = document.getElementById("radio-list");
    if (!radioContainer) {
      console.error("Radio list container not found.");
      return;
    }
    radioContainer.innerHTML = "";
    
    stations.forEach(station => {
      const imgSrc = station.favicon && station.favicon.trim() !== '' 
        ? station.favicon 
        : DEFAULT_RADIO_LOGO;
      const stationElement = document.createElement("div");
      stationElement.classList.add("radio-station");
      stationElement.style.border = "1px solid var(--border-color)";
      stationElement.style.padding = "10px";
      stationElement.style.marginBottom = "10px";
      stationElement.addEventListener('click', () => {
        showStationDetails(station);
      });
      
      stationElement.innerHTML = `
        <div class="station-image" style="display: inline-block; vertical-align: top;">
          <img src="${imgSrc}" alt="${station.name}" width="80">
        </div>
        <div class="station-details" style="display: inline-block; margin-left: 10px; vertical-align: top;">
          <h3 style="margin: 0; color: var(--primary-color);">${station.name}</h3>
          <p><strong>Country:</strong> ${station.country || "N/A"}</p>
          <p><strong>Bitrate:</strong> ${station.bitrate || "N/A"}</p>
          <p><strong>Genre:</strong> ${station.genre || station.tags || "N/A"}</p>
          <p><strong>Website:</strong> <a href="${station.homepage || '#'}" target="_blank">${station.homepage || "N/A"}</a></p>
        </div>
      `;
      
      radioContainer.appendChild(stationElement);
    });
  }

  // Helper: Update the music player's details (track title and artist)
  function updatePlayerDetails(station) {
    const trackTitleEl = document.querySelector(".track-title");
    const trackArtistEl = document.querySelector(".track-artist");
    if (trackTitleEl) {
      trackTitleEl.textContent = station.name || "Now Playing";
    }
    if (trackArtistEl) {
      // If no explicit artist is available, fallback to genre/tags or default message
      trackArtistEl.textContent = station.artist || station.genre || station.tags || "Unknown Artist";
    }
  }

  // Show the detailed view for a clicked station, including extended details
  function showStationDetails(station) {
    const detailsView = document.getElementById("details-view");
    if (!detailsView) {
      console.error("Details view element not found.");
      return;
    }
    
    // Top section: Main image, station name, and country with flag
    const imageEl = detailsView.querySelector("#details-image");
    const nameEl = detailsView.querySelector("#details-name");
    const countryEl = detailsView.querySelector("#details-country");
    const flagEl = detailsView.querySelector("#details-flag");
    
    if (imageEl) {
      imageEl.src = station.favicon && station.favicon.trim() !== '' 
        ? station.favicon 
        : 'sympletunesdefaultcover.jpg';
    }
    if (nameEl) {
      nameEl.textContent = station.name || "Unknown Station";
    }
    if (countryEl) {
      countryEl.innerHTML = `<strong>Country:</strong> ${station.country || "N/A"} `;
    }
    if (flagEl) {
      const code = getCountryCode(station.country);
      flagEl.src = code !== "unknown" ? `https://flagcdn.com/20x14/${code}.png` : DEFAULT_FLAG_URL;
      flagEl.style.marginLeft = "5px";
    }
    
    // Additional top section info (bitrate, genre, website)
    const additionalInfoEl = detailsView.querySelector("#details-additional");
    if (additionalInfoEl) {
      additionalInfoEl.innerHTML = `
        <p><strong>Bitrate:</strong> ${station.bitrate || "N/A"}</p>
        <p><strong>Genre:</strong> ${station.genre || station.tags || "N/A"}</p>
        <p><strong>Website:</strong> <a href="${station.homepage || '#'}" target="_blank">${station.homepage || "N/A"}</a></p>
      `;
    }
    
    // Bottom left section: Extended details
    const bottomLeftEl = detailsView.querySelector(".details-bottom-left");
    if (bottomLeftEl) {
      bottomLeftEl.innerHTML = `
        <h4>Station Details</h4>
        <p><strong>Contact Info:</strong> ${station.contact || "N/A"}</p>
        <p><strong>Browser URL:</strong> <a href="${station.browser_url || station.url || '#'}" target="_blank">${station.browser_url || station.url || "N/A"}</a></p>
        <p><strong>Stream Format:</strong> ${station.stream_format || "N/A"}</p>
        <p><strong>Server Info:</strong> ${station.server_info || "N/A"}</p>
        <p><strong>Location Coordinates:</strong> ${station.location || "N/A"}</p>
        <p><strong>Listeners:</strong> ${station.listeners || "N/A"}</p>
        <p><strong>New Features:</strong> Coming soon...</p>
      `;
    }
    
    // Comments section (placeholder)
    const commentsListEl = detailsView.querySelector("#comments-list");
    if (commentsListEl) {
      commentsListEl.innerHTML = `<p>Comments section coming soon...</p>`;
    }
    
    // Play button functionality within the details view
    const playButton = detailsView.querySelector("#play-button");
    if (playButton) {
      playButton.onclick = () => {
        const audio = document.getElementById("radio-audio");
        if (audio) {
          audio.src = station.url_resolved;
          audio.play();
          // Update the music player section with current station details
          updatePlayerDetails(station);
        }
      };
    }
    
    detailsView.style.display = "block";
    detailsView.scrollIntoView({ behavior: "smooth" });
  }

  // Hide the details view (without stopping audio)
  const backButton = document.getElementById("back-button");
  if (backButton) {
    backButton.addEventListener("click", () => {
      const detailsView = document.getElementById("details-view");
      if (detailsView) {
        detailsView.style.display = "none";
      }
      const radioList = document.getElementById("radio-list");
      if (radioList) {
        radioList.scrollIntoView({ behavior: "smooth" });
      }
    });
  } else {
    console.error("Back button element not found.");
  }
  
  // Comment Form Submission & Celebration Alert (AJAX submission)
  const commentForm = document.getElementById("comment-form");
  if (commentForm) {
    commentForm.addEventListener("submit", async function(event) {
      event.preventDefault(); // Prevent default submission behavior
      
      const formData = new FormData(this);
      
      try {
        const response = await fetch(this.action, {
          method: "POST",
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
    
        if (response.ok) {
          showCelebrationAlert();
          this.reset();
        } else {
          alert("Error sending message. Please try again.");
        }
      } catch (error) {
        alert("Network error. Please check your connection.");
        console.error(error);
      }
    });
  }
  
  // Show celebration alert with confetti
  function showCelebrationAlert() {
    const alertBox = document.getElementById("celebration-alert");
    if (alertBox) {
      alertBox.classList.remove("message-sent-hidden");
      alertBox.classList.add("show");
      launchConfetti();
    }
  }
  
  // Close celebration alert
  window.closeCelebrationAlert = function() {
    const alertBox = document.getElementById("celebration-alert");
    if (alertBox) {
      alertBox.classList.remove("show");
      alertBox.classList.add("message-sent-hidden");
    }
  }
  
  // Confetti Effect
  function launchConfetti() {
    const confettiContainer = document.querySelector(".confetti");
    if (confettiContainer) {
      confettiContainer.innerHTML = "";
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti-piece");
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.animationDuration = (Math.random() * 2 + 1) + "s";
        confettiContainer.appendChild(confetti);
      }
      setTimeout(() => { confettiContainer.innerHTML = ""; }, 3000);
    }
  }
  
  // Initialize the country row on page load
  populateCountryRow();
});
