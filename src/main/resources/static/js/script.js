const DEFAULT_CLIENT_ID = '841052ed';
const API_URL = 'https://api.jamendo.com/v3.0';


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

// Like Button
const likeBtn = document.querySelector('.player-bar .like-btn');
const likeIcon = likeBtn.querySelector('i');
let downloadBtn;
let currentTrackList = [];
let currentTrackIndex = 0;
let isPlaying = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check login status first
    checkLoginStatus();

    // Redirect if not logged in
    if (!localStorage.getItem('jamplayer_current_user')) {
        window.location.href = 'login.html';
        return;
    }

    // Load initial content
    fetchTrendingTracks();

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    volumeSlider.addEventListener('input', (e) => audioPlayer.volume = e.target.value);

    // Like button
    likeBtn.addEventListener('click', toggleLike);

    // Download button
    downloadBtn = document.querySelector('.player-bar .download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadTrack);
    }

    // Sign out button
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);

    // Progress Bar Listeners
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalDurationEl.innerText = formatTime(audioPlayer.duration);
        progressBar.max = Math.floor(audioPlayer.duration);
    });
    progressBar.addEventListener('input', () => {
        audioPlayer.currentTime = progressBar.value;
    });

    // Search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchTracks(e.target.value);
        }
    });

    audioPlayer.addEventListener('ended', playNext);
    prevBtn.addEventListener('click', playPrev);
    nextBtn.addEventListener('click', playNext);

    // Pre-fill client ID input if it exists
    const idInput = document.getElementById('clientIdInput');
    if (idInput) idInput.value = clientId;
    const collapseBtn = document.getElementById('collapse-btn');
    if (collapseBtn) collapseBtn.addEventListener('click', toggleSidebar);

});

function checkLoginStatus() {
    const userJson = localStorage.getItem('jamplayer_current_user');
    const userBtn = document.getElementById('user-btn');

    if (userJson) {
        const user = JSON.parse(userJson);

    } else {

    }
}
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}
function handleUserBtnClick() {
    const userJson = localStorage.getItem('jamplayer_current_user');
    if (userJson) {
        // Logged in -> Open Profile/Settings
        openSettings();
        // Populate profile fields
        const user = JSON.parse(userJson);
        const nameDisplay = document.getElementById('user-name-display');
        if (nameDisplay) nameDisplay.value = user.fullName;

        const idInput = document.getElementById('clientIdInput');
        if (idInput) idInput.value = clientId; // Current Client ID
    } else {
        // Not logged in -> Go to Login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Settings / Modal
function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}



function handleSignOut() {
    console.log("Signing out...");
    localStorage.removeItem('jamplayer_current_user');
    localStorage.removeItem('jamplayer_remember');
    localStorage.removeItem('jamendo_client_id');

    closeSettings();
    window.location.href = 'login.html';
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
    if (sectionId === 'library') {
        navItems[2].classList.add('active');
        fetchLikedTracks();
    }
    if (sectionId === 'download') navItems[3].classList.add('active');

    let targetId = '';
    if (sectionId === 'home') targetId = 'home-view';
    else if (sectionId === 'search') targetId = 'search-results';
    else if (sectionId === 'library') targetId = 'library-view';
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
        const response = await fetch(`${API_URL}/tracks/?client_id=${clientId}&format=jsonpretty&limit=21&order=popularity_week`);
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
        const response = await fetch(`${API_URL}/tracks/?client_id=${clientId}&format=jsonpretty&limit=30&namesearch=${encodeURIComponent(query)}`);
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
            currentTrackList = tracks; // Important to update context
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
        checkIfLiked(track.id);
    } else {
        alert("No audio stream available for this track.");
    }
}

async function checkIfLiked(trackId) {
    const userJson = localStorage.getItem('jamplayer_current_user');
    if (!userJson) {
        setLikeStatus(false);
        return;
    }

    const user = JSON.parse(userJson);
    try {
        const response = await fetch(`/api/library/check?userId=${user.id}&trackId=${trackId}`);
        const isLiked = await response.json();
        setLikeStatus(isLiked);
    } catch (error) {
        console.error("Error checking like status:", error);
    }
}

function setLikeStatus(isLiked) {
    if (isLiked) {
        likeBtn.style.color = '#ff4b4b';
        likeIcon.classList.remove('fa-regular');
        likeIcon.classList.add('fa-solid');
    } else {
        likeBtn.style.color = 'var(--text-secondary)';
        likeIcon.classList.remove('fa-solid');
        likeIcon.classList.add('fa-regular');
    }
}
function downloadTrack() {
    const track = currentTrackList[currentTrackIndex];
    if (!track || !track.id) return alert("Play a track first!");

    // Direct redirection for download
    const downloadUrl = `/api/download/jamendo?trackId=${track.id}`;
    window.location.href = downloadUrl;
}
async function toggleLike() {
    const userJson = localStorage.getItem('jamplayer_current_user');
    if (!userJson) {
        alert("Please login to like tracks!");
        return;
    }

    if (currentTrackIndex < 0 || currentTrackList.length === 0) return;

    const user = JSON.parse(userJson);
    const track = currentTrackList[currentTrackIndex];
    const isCurrentlyLiked = likeIcon.classList.contains('fa-solid') && !likeIcon.classList.contains('fa-regular');

    try {
        if (isCurrentlyLiked) {
            // Unlike
            await fetch(`/api/library/unlike?userId=${user.id}&trackId=${track.id}`, {
                method: 'DELETE'
            });
            setLikeStatus(false);
        } else {
            // Like
            await fetch('/api/library/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    trackId: track.id,
                    trackName: track.name,
                    artistName: track.artist_name,
                    albumImage: track.album_image,
                    audioUrl: track.audio
                })
            });
            setLikeStatus(true);
        }
    } catch (error) {
        console.error("Error toggling like:", error);
    }
}

async function fetchLikedTracks() {
    const userJson = localStorage.getItem('jamplayer_current_user');
    if (!userJson) {
        document.getElementById('library-tracks-list').innerHTML = '<p>Please login to see your library.</p>';
        return;
    }

    const user = JSON.parse(userJson);
    try {
        const response = await fetch(`/api/library/${user.id}`);
        const tracks = await response.json();

        const formattedTracks = tracks.map(t => ({
            id: t.trackId,
            name: t.trackName,
            artist_name: t.artistName,
            album_image: t.albumImage,
            audio: t.audioUrl
        }));

        if (formattedTracks.length > 0) {
            renderSearchList(formattedTracks, 'library-tracks-list');
        } else {
            document.getElementById('library-tracks-list').innerHTML = '<p>Your library is empty. Start liking some tracks!</p>';
        }
    } catch (error) {
        console.error("Error fetching library:", error);
        document.getElementById('library-tracks-list').innerHTML = '<p>Error loading library.</p>';
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