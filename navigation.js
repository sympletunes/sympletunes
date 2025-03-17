// Ensure functions are attached to window so they are globally accessible.
window.hideAllSections = function() {
    document.getElementById("symple-search-results-container").style.display = "none";
    document.getElementById("profile-section").style.display = "none";
    document.getElementById("track-section").style.display = "none";
    document.getElementById("album-section").style.display = "none";
    document.getElementById("video-section").style.display = "none";
    document.getElementById("news-section").style.display = "none";
  };
  
  window.showMainResults = function() {
    window.hideAllSections();
    document.getElementById("symple-search-results-container").style.display = "block";
  };
  
  window.openProfileSection = function(profileIdentifier) {
    window.hideAllSections();
    const profileSection = document.getElementById("profile-section");
    profileSection.style.display = "block";
    const decodedName = decodeURIComponent(profileIdentifier);
    // Find the profile in the global artistProfiles array.
    const profile = window.artistProfiles.find(a => a.name === decodedName);
    if (profile) {
      // Build a detailed view. (Customize as needed.)
      profileSection.innerHTML = `
        <div class="artist-profile-header-detailed" style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div class="artist-header-left" style="flex: 1; text-align: center;">
            <img src="${profile.image}" alt="${profile.name}" style="width:250px;height:250px;object-fit:cover;border-radius:50%; margin-bottom: 10px;">
            <div class="artist-actions-detailed" style="display: flex; gap: 10px; justify-content: center;">
              <button class="artist-listeners">Listeners</button>
              <button class="artist-follow">Follow</button>
              <button class="artist-unfollow">Unfollow</button>
              <button class="artist-comment">Comment</button>
            </div>
          </div>
          <div class="artist-header-right" style="flex: 2;">
            <h2>Stage Name: ${profile.name}</h2>
            <p><strong>Real Name:</strong> ${profile.realName || "Not Provided"}</p>
            <p><strong>Date of Birth:</strong> ${profile["life-span"].begin}</p>
            <p><strong>Occupation:</strong> ${profile.occupation || "Singer"}</p>
            <p><strong>Years Active:</strong> ${profile["life-span"].begin}${(profile["life-span"].ended === "true" && profile["life-span"].end) ? " – " + profile["life-span"].end : ""}</p>
            <p><strong>Genre:</strong> ${profile.genre}</p>
          </div>
        </div>
        <div class="artist-profile-lower-content" style="display: flex; gap: 20px;">
          <div class="artist-profile-lower-left" style="flex: 1; padding-right: 20px; border-right: 1px solid #ccc;">
            <h3>Tracks</h3>
            <ul>
              ${
                window.sampleTracks.filter(t => t.artist.toLowerCase().includes(profile.name.toLowerCase()))
                .map(t => `<li>${t.name} by ${t.artist}</li>`).join("") || "<li>No tracks available.</li>"
              }
            </ul>
            <h3>Albums</h3>
            <ul>
              ${
                window.sampleAlbums.filter(a => a.artist.toLowerCase().includes(profile.name.toLowerCase()))
                .map(a => `<li>${a.name} (${a.releaseDate})</li>`).join("") || "<li>No albums available.</li>"
              }
            </ul>
            <h3>Videos</h3>
            <ul>
              ${
                window.sampleVideos.filter(v => v.artist.toLowerCase().includes(profile.name.toLowerCase()))
                .map(v => `<li>${v.title} by ${v.artist}</li>`).join("") || "<li>No videos available.</li>"
              }
            </ul>
            <h3>News</h3>
            <ul>
              ${
                window.sampleNews.filter(n => n.headline.toLowerCase().includes(profile.name.toLowerCase()))
                .map(n => `<li>${n.headline} (${n.date})</li>`).join("") || "<li>No news available.</li>"
              }
            </ul>
          </div>
          <div class="artist-profile-lower-right" style="flex: 1; padding-left: 20px;">
            <h3>About / History</h3>
            <p>${profile.extract || profile.description || "No additional history available."}</p>
          </div>
        </div>
        <button onclick="showMainResults()" style="margin-top:20px;">Back</button>
      `;
    } else {
      profileSection.innerHTML = `<h2>Profile Detail Not Found</h2><button onclick="showMainResults()">Back</button>`;
    }
  };
  
  window.openTrackSection = function(trackIdentifier) {
    window.hideAllSections();
    const trackSection = document.getElementById("track-section");
    trackSection.style.display = "block";
    const decodedId = decodeURIComponent(trackIdentifier);
    const track = window.sampleTracks.find(t => t.videoId === decodedId);
    if (track) {
      trackSection.innerHTML = `
        <h2>${track.name}</h2>
        <img src="${track.image}" alt="${track.name}" style="width:200px;height:200px;object-fit:cover;">
        <p><strong>Artist:</strong> ${track.artist}</p>
        <p><strong>Listeners:</strong> ${track.listeners}</p>
        <button onclick="showMainResults()">Back</button>
      `;
    } else {
      trackSection.innerHTML = `<h2>Track Detail Not Found</h2><button onclick="showMainResults()">Back</button>`;
    }
  };
  
  window.openAlbumSection = function(albumIdentifier) {
    window.hideAllSections();
    const albumSection = document.getElementById("album-section");
    albumSection.style.display = "block";
    const decodedName = decodeURIComponent(albumIdentifier);
    const album = window.sampleAlbums.find(a => a.name === decodedName);
    if (album) {
      albumSection.innerHTML = `
        <h2>${album.name}</h2>
        <img src="${album.cover}" alt="${album.name}" style="width:200px;height:200px;object-fit:cover;">
        <p><strong>Artist:</strong> ${album.artist}</p>
        <p><strong>Release Date:</strong> ${album.releaseDate}</p>
        <div class="album-actions">
          <button>Share</button>
          <button>Comment</button>
        </div>
        <button onclick="showMainResults()">Back</button>
      `;
    } else {
      albumSection.innerHTML = `<h2>Album Detail Not Found</h2><button onclick="showMainResults()">Back</button>`;
    }
  };
  
  window.openVideoSection = function(videoIdentifier) {
    window.hideAllSections();
    const videoSection = document.getElementById("video-section");
    videoSection.style.display = "block";
    const decodedId = decodeURIComponent(videoIdentifier);
    const video = window.sampleVideos.find(v => v.videoId === decodedId);
    if (video) {
      videoSection.innerHTML = `
        <h2>${video.title}</h2>
        <img src="${video.image}" alt="${video.title}" style="width:200px;height:150px;object-fit:cover;">
        <p><strong>Artist:</strong> ${video.artist}</p>
        <button onclick="showMainResults()">Back</button>
      `;
    } else {
      videoSection.innerHTML = `<h2>Video Detail Not Found</h2><button onclick="showMainResults()">Back</button>`;
    }
  };
  
  window.openNewsSection = function(newsIdentifier) {
    window.hideAllSections();
    const newsSection = document.getElementById("news-section");
    newsSection.style.display = "block";
    const decodedHeadline = decodeURIComponent(newsIdentifier);
    const newsItem = window.sampleNews.find(n => n.headline === decodedHeadline);
    if (newsItem) {
      newsSection.innerHTML = `
        <h2>${newsItem.headline}</h2>
        <img src="${newsItem.image}" alt="${newsItem.headline}" style="width:300px;height:auto;">
        <p>${newsItem.info}</p>
        <p><strong>Source:</strong> ${newsItem.source} | <strong>Date:</strong> ${newsItem.date}</p>
        <button onclick="showMainResults()">Back</button>
      `;
    } else {
      newsSection.innerHTML = `<h2>News Detail Not Found</h2><button onclick="showMainResults()">Back</button>`;
    }
  };
  