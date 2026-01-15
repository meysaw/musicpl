const DEFAULT_CLIENT_ID = '841052ed'; // User provided ID
const SUSPENDED_ID = 'a5518597';
const API_URL = 'https://api.jamendo.com/v3.0';

// Auto-fix: If local storage has the suspended ID, clear it to use the new default
if (localStorage.getItem('jamendo_client_id') === SUSPENDED_ID) {
    localStorage.removeItem('jamendo_client_id');
}

let clientId = localStorage.getItem('jamendo_client_id') || DEFAULT_CLIENT_ID;

const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volumeSlider');
const searchInput = document.getElementById('searchInput');

// Progress Bar Elements
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');

let currentTrackList = [];
let currentTrackIndex = 0;
let isPlaying = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchTrendingTracks();

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    volumeSlider.addEventListener('input', (e) => audioPlayer.volume = e.target.value);

    // Progress Bar Listeners
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalDurationEl.innerText = formatTime(audioPlayer.duration);
        progressBar.max = Math.floor(audioPlayer.duration);
    });
    progressBar.addEventListener('input', () => {
        audioPlayer.currentTime = progressBar.value;
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchTracks(e.target.value);
        }
    });

    audioPlayer.addEventListener('ended', playNext);
    prevBtn.addEventListener('click', playPrev);
    nextBtn.addEventListener('click', playNext);

    // Settings modal interactions
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    // Pre-fill input
    document.getElementById('clientIdInput').value = clientId;
});

// Settings / Modal
function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
    const newId = document.getElementById('clientIdInput').value.trim();
    if (newId) {
        clientId = newId;
        localStorage.setItem('jamendo_client_id', clientId);
        closeSettings();
        // Reload content
        fetchTrendingTracks();
    }
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.app-container section > div').forEach(div => {
        if (!div.id.includes('error')) div.style.display = 'none';
    });
    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));

    // Highlight active nav item
    const navItems = document.querySelectorAll('nav li');
    if (sectionId === 'home') navItems[0].classList.add('active');
    if (sectionId === 'search') navItems[1].classList.add('active');
    // skip library for now
    if (sectionId === 'download') navItems[3].classList.add('active');

    let targetId = '';
    if (sectionId === 'home') targetId = 'home-view';
    else if (sectionId === 'search') targetId = 'search-results';
    else if (sectionId === 'download') targetId = 'download-view';

    const section = document.getElementById(targetId);
    if (section) {
        section.style.display = 'block';
    }
}

// API Calls
async function fetchTrendingTracks() {
    document.getElementById('api-error-message').style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/tracks/?client_id=${clientId}&format=jsonpretty&limit=12&order=popularity_week`);
        const data = await response.json();

        if (data.headers && data.headers.status === 'failed') {
            throw new Error(data.headers.error_message || 'API Error');
        }

        if (data.results) {
            renderTracks(data.results, 'trending-tracks');
            if (currentTrackList.length === 0) currentTrackList = data.results;
        }
    } catch (error) {
        console.error('Error fetching trending tracks:', error);
        showError(error.message);
    }
}

async function searchTracks(query) {
    if (!query) return;

    showSection('search');
    const container = document.getElementById('search-tracks-list');
    container.innerHTML = '<p>Searching...</p>';
    document.getElementById('api-error-message').style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/tracks/?client_id=${clientId}&format=jsonpretty&limit=20&namesearch=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.headers && data.headers.status === 'failed') {
            throw new Error(data.headers.error_message || 'API Error');
        }

        if (data.results && data.results.length > 0) {
            currentTrackList = data.results;
            renderSearchList(data.results, 'search-tracks-list');
            document.getElementById('search-results').style.display = 'block';
            document.getElementById('home-view').style.display = 'none';
        } else {
            container.innerHTML = '<p>No results found.</p>';
        }
    } catch (error) {
        console.error('Error searching:', error);
        container.innerHTML = '';
        showError(error.message);
    }
}

function showError(msg) {
    const errorDiv = document.getElementById('api-error-message');
    const errorText = document.getElementById('error-text');
    errorText.innerText = `Error: ${msg}`;
    errorDiv.style.display = 'block';

    // Auto-open settings if it's an auth error
    if (msg.toLowerCase().includes('client id') || msg.toLowerCase().includes('credential')) {
        openSettings();
    }
}

// Rendering
function renderTracks(tracks, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    tracks.forEach((track, index) => {
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
            <div class="img-container" style="position:relative;">
                <img src="${track.album_image}" alt="${track.name}">
                <div class="play-overlay"><i class="fa-solid fa-play"></i></div>
            </div>
            <h3>${track.name}</h3>
            <p>${track.artist_name}</p>
        `;
        card.addEventListener('click', () => {
            currentTrackList = tracks; // Update context
            loadTrack(index);
        });
        container.appendChild(card);
    });
}

function renderSearchList(tracks, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'track-list-item';
        item.innerHTML = `
            <img src="${track.album_image}" alt="${track.name}">
            <div class="track-info-list">
                <h3>${track.name}</h3>
                <p>${track.artist_name}</p>
            </div>
            <span><i class="fa-solid fa-play-circle"></i></span>
        `;
        item.addEventListener('click', () => {
            loadTrack(index);
        });
        container.appendChild(item);
    });
}

// Player Logic
function loadTrack(index) {
    if (index < 0 || index >= currentTrackList.length) return;

    currentTrackIndex = index;
    const track = currentTrackList[index];

    // Update UI
    document.getElementById('player-img').src = track.album_image;
    document.getElementById('player-title').innerText = track.name;
    document.getElementById('player-artist').innerText = track.artist_name;

    // Load Audio
    if (track.audio) {
        audioPlayer.src = track.audio;
        audioPlayer.play().catch(e => console.error("Playback error:", e));
        isPlaying = true;
        updatePlayBtn();
    } else {
        alert("No audio stream available for this track.");
    }
}

function togglePlay() {
    if (!audioPlayer.src) return;
    if (audioPlayer.paused) {
        audioPlayer.play();
        isPlaying = true;
    } else {
        audioPlayer.pause();
        isPlaying = false;
    }
    updatePlayBtn();
}

function updatePlayBtn() {
    playBtn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

function playNext() {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= currentTrackList.length) nextIndex = 0; // Loop
    loadTrack(nextIndex);
}

function playPrev() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = currentTrackList.length - 1;
    loadTrack(prevIndex);
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('settings-modal');
    if (event.target == modal) {
        closeSettings();
    }
}

function updateProgress() {
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration;

    if (duration) {
        progressBar.value = current;
        currentTimeEl.innerText = formatTime(current);
        // Ensure max is set (sometimes loadedmetadata fails if stream is weird)
        progressBar.max = Math.floor(duration);
        totalDurationEl.innerText = formatTime(duration);
    }
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Download Feature
document.addEventListener('DOMContentLoaded', () => {
    const dlBtn = document.getElementById('yt-download-btn');
    if (dlBtn) {
        dlBtn.addEventListener('click', () => {
            const url = document.getElementById('yt-link-input').value.trim();
            const statusDiv = document.getElementById('download-status');

            if (!url) {
                statusDiv.innerHTML = '<span style="color: #f87171;">Please enter a URL.</span>';
                return;
            }

            const encodedUrl = encodeURIComponent(url);

            // Direct Native Download
            // This will trigger the browser to download the file directly from our server
            window.location.href = `/api/download?url=${encodedUrl}`;

            statusDiv.innerHTML = `
                <p style="color: #4ade80; margin-bottom: 10px;"><i class="fa-solid fa-spinner fa-spin"></i> Converting & Downloading...</p>
                <p style="font-size: 0.8rem; color: #71717a;">Please wait. The file will start downloading automatically.</p>
            `;
        });
    }
});
