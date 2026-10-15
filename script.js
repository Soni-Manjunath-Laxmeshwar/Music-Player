// script.js
const audio = new Audio();
audio.crossOrigin = "anonymous"; // Important for Web Audio API if fetching from external sources

// DOM Elements
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const muteBtn = document.getElementById('mute-btn');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const trackTitleEl = document.getElementById('track-title');
const trackArtistEl = document.getElementById('track-artist');
const coverArtEl = document.getElementById('cover-art');
const playlistListEl = document.getElementById('playlist-list');
const lyricsContainerEl = document.getElementById('lyrics-container');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

// State
let isPlaying = false;
let currentTrackIndex = 0;
let audioContext;
let analyser;
let source;
let currentLyricIndex = -1;
let activeLyrics = [];

// Sample Playlist Data (Expects files to be in an 'audio' folder)
const playlist = [
    {
        lyricKey: "song1",
        title: "Gana Chaturaya",
        artist: "Shankar Mahadevan",
        src: "audio/song1.mp3",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnqFFtv-8x5nvA-P5eyXFI5ydWVbAzr9FusCupuMHt5w&s=10",
        lyrics: [
            { time: 0, text: "Gaana chaturaya, gaana pranaya, gaanantaratmane" },
            { time: 7, text: "Gaanotsukhaya, gaanamattaya, gaanotsuka-manase" },
            { time: 14, text: "Guru-pujitaya, guru-daivataya, guru-kulastayine" },
            { time: 21, text: "Guru vikramaya, guyyha pravaraya, gurave guna-gurave" },
            { time: 28, text: "Guru-daitya kalakcchetre, guru-dharma sadaradhyaya" },
            { time: 35, text: "Guru-putra paritratre, guru-pakhanda khandakaya" },
            { time: 42, text: "Gita-saraya, gita-tattvaya, gita-gotraya dhimahi" },
            { time: 49, text: "Gudha-gulfaya, gandha-mattaya, gojaya-pradaya dhimahi" }
        ]
    },
    {
        lyricKey: "song2",
        title: "When I get older",
        artist: "K'naan",
        src: "audio/song2.mp3",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwYEBpP4CKWvIusra3mCKzDy8gV5xc_NIE4w7MEasZsQ&s=10",
        lyrics: [
            { time: 0, text: "When i get older,I will be stronger,they'll call me freedom" },
            { time: 5, text: "Just like a Waving Flag." },
            { time: 10, text: "When I get older, I will be stronger,They'll call me freedom, just like a Waving Flag," },
            { time: 15, text: "And then it goes back, and then it goes back,And then it goes back" },
            { time: 21, text: "Born to a throne, stronger than Rome,but Violent prone, poor people zone,But it's my home," },
            { time: 27, text: "All I have known,Where I got grown, streets we would roam.But out of the darkness," },
            { time: 33, text: "I came the farthest,Among the hardest survival." },
            { time: 38, text: "Learn from these streets, it can be bleak,Except no defeat, surrender retreat," },
            { time: 44, text: "So we struggling, fighting to eat and We wondering when we'll be free,So we patiently wait" },
            { time: 50, text: "For that fateful day,It's not far away, so for now we say" },
            { time: 55, text: "When I get older, when I get older I will be stronger,they'll call me freedom" },
            { time: 59, text: "Just like a Waving Flag." }
        ]
    },
    {
        lyricKey: "song3",
        title: "Finding Her",
        artist: "Tanishka Bahl",
        src: "audio/song3.mp3",
        cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcST1wDlRQG_XcCSVxrzhuda2rO7Y6Uwvs1TKfRPWQqofQ&s=10",
        lyrics: [
            { time: 0, text: "Hmm mm mm " },
            { time: 12, text: "Jaana tu aata nahi,Sapno se jaata nahi,Mil jaaye kya hee baat thi" },
            { time: 27, text: "Kaamil ho jaati wahi, Ha main tere sawaalo ka manzar hoon, Jo tu maange jawabo mein rehti hoon" },
            { time: 42, text: "Main bhi sochu wo pal saare mil jaaye, Teri hoke na teri hee rehti hoon Main bhi chahoon yahi pe tu ruk jaana, Kitna chaha tha mujhko ye keh jaana, " },
            { time: 58, text: "Teri mujhse doori main hone nahi deti, Har lamha main khud se ye kehti hoont Tu aata nahi, Sapno se jaata nahi" },
            { time: 75, text: "Mil jaaye kya hee baat thi, Kaamil ho jaati wahi Jo bhi ho raaz tera, Mujhko batata nahi" },
            { time: 92, text: "Mil jaaye kya hee baat thi, Kaamil ho jaati wahi " },
            { time: 110, text: "Sambhaal ke rakha wo phool mera tu, Meri shayari mein zaroor raha tu " },
            { time: 128, text: "Jo aankho mein pyaari si duniya basaayi, Wo duniya bhi tha tu wo lamha bhi tha tu Ha lagte hain mujhko wo kisse sataane, Deta na dil mera tujhko bhulaane Adhoore se vaade adhoori si raatein" },
            { time: 146, text: "Ab hisse mein daakhil mere bas wo yaadein Rehna tha ban ke humdum tera, Aise jaana hee tha phir tu kyun thehra Ab na maane mera dil kyun na tere qaabil" },
            { time: 164, text: "Thi ik aarzu ki main kehti rahi par Tu aata nahi, Sapno se jaata nahi, Mil jaaye kya hee baat thi" },
            { time: 181, text: "Kaamil ho jaati wahi Jo bhi ho raaz tera, Mujhko batata nahi " },
            { time: 195, text: "Mil jaaye kya hee baat thi, Kaamil ho jaati wahi " }
        ]
    }
];

function parseTimestampedLyrics(text) {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map((line, index) => {
            const match = line.match(/^\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)$/);

            if (!match) {
                return { time: index * 5, text: line };
            }

            const minutes = Number(match[1]);
            const seconds = Number(match[2]);
            const milliseconds = Number((match[3] || '0').padEnd(3, '0'));

            return {
                time: minutes * 60 + seconds + milliseconds / 1000,
                text: match[4]
            };
        });
}

function getLyricsForTrack(track) {
    const customLyrics = window.customLyrics?.[track.lyricKey];

    if (Array.isArray(customLyrics) && customLyrics.length > 0) {
        return customLyrics;
    }

    if (typeof customLyrics === 'string' && customLyrics.trim()) {
        return parseTimestampedLyrics(customLyrics);
    }

    return track.lyrics || [];
}

// Initialize Audio Context for Visualizer
function initAudioContext() {
    if (!audioContext) {
        // Create context on first user interaction to comply with browser policies
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        // Connect audio element to analyser
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Visualizer settings
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Resize canvas to fit its container
        function resizeCanvas() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Animation loop
        function drawVisualizer() {
            requestAnimationFrame(drawVisualizer);
            
            // Gets frequency data continuously, naturally drops to 0 when paused
            analyser.getByteFrequencyData(dataArray);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 255 * canvas.height;

                // Opacity based on height, fixed accent color (Spotify green-ish)
                const alpha = (barHeight / canvas.height) + 0.1;
                canvasCtx.fillStyle = `rgba(29, 185, 84, ${alpha})`;
                
                // Draw bar from bottom
                canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1; // 1px spacing
            }
        }
        drawVisualizer();
    }
    
    if(audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Format time in M:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Load a track from the playlist
function loadTrack(index) {
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    
    audio.src = track.src;
    trackTitleEl.textContent = track.title;
    trackArtistEl.textContent = track.artist;
    coverArtEl.style.backgroundImage = `url('${track.cover}')`;
    activeLyrics = getLyricsForTrack(track);
    
    renderPlaylist();
    renderLyrics();
    
    // Reset state
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";
    currentLyricIndex = -1;
}

// Render Playlist UI
function renderPlaylist() {
    playlistListEl.innerHTML = '';
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
        li.innerHTML = `
            <div class="playlist-item-info">
                <span class="playlist-item-title">${track.title}</span>
                <span class="playlist-item-artist">${track.artist}</span>
            </div>
            ${index === currentTrackIndex ? '<i class="fas fa-volume-up" style="color: var(--accent-color);"></i>' : ''}
        `;
        li.addEventListener('click', () => {
            loadTrack(index);
            playAudio();
        });
        playlistListEl.appendChild(li);
    });
}

// Render Lyrics UI
function renderLyrics() {
    lyricsContainerEl.innerHTML = '';
    
    if (activeLyrics.length > 0) {
        activeLyrics.forEach((line, index) => {
            const p = document.createElement('p');
            p.className = 'lyric-line';
            p.textContent = line.text;
            p.dataset.time = line.time;
            
            // Click lyric to seek in audio
            p.addEventListener('click', () => {
                audio.currentTime = line.time;
                playAudio();
            });
            
            lyricsContainerEl.appendChild(p);
        });
    } else {
        lyricsContainerEl.innerHTML = '<p class="lyric-line">No lyrics available.</p>';
    }
}

// Playback Controls
function playAudio() {
    initAudioContext(); // Initialize visualizer on first user interaction
    audio.play()
        .then(() => {
            isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playBtn.classList.add('playing');
            coverArtEl.style.opacity = '0.1'; // Dim cover to reveal visualizer
        })
        .catch(err => {
            console.log("Playback prevented (might be missing local file or autoplay blocked):", err);
            isPlaying = false;
        });
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playBtn.classList.remove('playing');
    coverArtEl.style.opacity = '0.4'; // Bring cover back
}

function togglePlay() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playAudio();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playAudio();
}

// Progress and Sync
function updateProgress() {
    if (!audio.duration) return;
    
    const current = audio.currentTime;
    const duration = audio.duration;
    
    // Update Slider
    const progressPercent = (current / duration) * 100;
    progressBar.value = progressPercent;
    
    // Update Text
    currentTimeEl.textContent = formatTime(current);
    
    // Sync Lyrics
    updateLyricsSync(current);
}

function updateLyricsSync(currentTime) {
    if (!activeLyrics.length) return;

    const lines = document.querySelectorAll('.lyric-line');
    let newIndex = -1;

    // Find the lyric that matches the current time
    for (let i = 0; i < activeLyrics.length; i++) {
        if (currentTime >= activeLyrics[i].time) {
            newIndex = i;
        } else {
            break;
        }
    }

    // If active lyric changed
    if (newIndex !== currentLyricIndex && newIndex !== -1) {
        if (currentLyricIndex !== -1 && lines[currentLyricIndex]) {
            lines[currentLyricIndex].classList.remove('active');
        }
        if (lines[newIndex]) {
            lines[newIndex].classList.add('active');
            // Smooth auto-scroll to center the active lyric
            lines[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        currentLyricIndex = newIndex;
    }
}

// Events
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Seek by dragging progress bar
progressBar.addEventListener('input', (e) => {
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

// Volume
volumeBar.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    updateMuteIcon();
});

muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    updateMuteIcon();
});

function updateMuteIcon() {
    const icon = muteBtn.querySelector('i');
    if (audio.muted || audio.volume === 0) {
        icon.className = 'fas fa-volume-mute';
    } else if (audio.volume < 0.5) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-up';
    }
}

// Audio Element Events
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('ended', nextTrack);

// Tabs Switcher
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
});

// Initial Setup
loadTrack(currentTrackIndex);
