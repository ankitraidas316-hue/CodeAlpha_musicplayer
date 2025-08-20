// ---- Playlist: replace src/cover paths with your files ----
const tracks = [
  {
    title: "Daydream",
    artist: "Low Tide",
    src: "audio/daydream.mp3",
    cover: "covers/daydream.jpg",
    duration: 0, // will be filled after metadata loads
  },
  {
    title: "Night Drive",
    artist: "Neon City",
    src: "audio/night-drive.mp3",
    cover: "covers/night-drive.jpg",
    duration: 0,
  },
  {
    title: "Sunset Walk",
    artist: "Golden Hour",
    src: "audio/sunset-walk.mp3",
    cover: "covers/sunset-walk.jpg",
    duration: 0,
  },
];

// ---- Helpers ----
const $ = (q) => document.querySelector(q);
const formatTime = (sec) => {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// ---- Elements ----
const audio = $("#audio");
const titleEl = $("#title");
const artistEl = $("#artist");
const coverEl = $("#cover");
const currentTimeEl = $("#currentTime");
const durationEl = $("#duration");
const seekBar = $("#seekBar");
const volume = $("#volume");
const playPauseBtn = $("#playPauseBtn");
const playIcon = $("#playIcon");
const pauseIcon = $("#pauseIcon");
const prevBtn = $("#prevBtn");
const nextBtn = $("#nextBtn");
const playlistEl = $("#playlist");

// ---- State ----
let index = 0;
let isSeeking = false;

// ---- Initialize ----
function loadTrack(i) {
  index = (i + tracks.length) % tracks.length;
  const t = tracks[index];
  audio.src = t.src;
  titleEl.textContent = t.title;
  artistEl.textContent = t.artist;
  coverEl.src = t.cover || "";
  coverEl.alt = `${t.title} – ${t.artist} cover`;

  // Reset UI
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = t.duration ? formatTime(t.duration) : "0:00";
  seekBar.value = 0;

  // Auto-load duration when metadata is ready
  audio.addEventListener(
    "loadedmetadata",
    () => {
      const d = audio.duration;
      durationEl.textContent = formatTime(d);
      tracks[index].duration = d; // cache
      // Update playlist item time if not set
      const li = playlistEl.querySelector(`li[data-idx="${index}"] .item-time`);
      if (li) li.textContent = formatTime(d);
    },
    { once: true }
  );
}

function togglePlay() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function updatePlayIcon() {
  const playing = !audio.paused && !audio.ended;
  playIcon.style.display = playing ? "none" : "";
  pauseIcon.style.display = playing ? "" : "none";
  playPauseBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
}

function nextTrack() {
  loadTrack(index + 1);
  audio.play();
  highlightActive();
}

function prevTrack() {
  loadTrack(index - 1);
  audio.play();
  highlightActive();
}

function highlightActive() {
  playlistEl.querySelectorAll("li").forEach((li) => {
    li.classList.toggle("active", Number(li.dataset.idx) === index);
    li.style.background = Number(li.dataset.idx) === index ? "#1d2430" : "";
  });
}

// ---- Timeline (seek) ----
seekBar.addEventListener("input", () => {
  isSeeking = true;
  const pct = Number(seekBar.value) / 100;
  const newTime = audio.duration * pct;
  currentTimeEl.textContent = formatTime(newTime);
});

seekBar.addEventListener("change", () => {
  const pct = Number(seekBar.value) / 100;
  audio.currentTime = audio.duration * pct;
  isSeeking = false;
});

audio.addEventListener("timeupdate", () => {
  if (!isSeeking) {
    const pct = (audio.currentTime / (audio.duration || 1)) * 100;
    seekBar.value = pct;
  }
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("ended", nextTrack);
audio.addEventListener("play", updatePlayIcon);
audio.addEventListener("pause", updatePlayIcon);

// ---- Volume ----
volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
});

// ---- Buttons ----
playPauseBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);

// ---- Build playlist UI ----
function buildPlaylist() {
  playlistEl.innerHTML = "";
  tracks.forEach((t, i) => {
    const li = document.createElement("li");
    li.dataset.idx = i;

    const meta = document.createElement("div");
    meta.className = "item-meta";

    const tt = document.createElement("span");
    tt.className = "item-title";
    tt.textContent = t.title;

    const ar = document.createElement("span");
    ar.className = "item-artist";
    ar.textContent = t.artist;

    meta.appendChild(tt);
    meta.appendChild(ar);

    const tm = document.createElement("span");
    tm.className = "item-time";
    tm.textContent = t.duration ? formatTime(t.duration) : "0:00";

    li.appendChild(meta);
    li.appendChild(tm);

    li.addEventListener("click", () => {
      loadTrack(i);
      audio.play();
      highlightActive();
    });

    playlistEl.appendChild(li);
  });
}

// ---- Keyboard shortcuts (optional) ----
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  } else if (e.code === "ArrowRight") {
    nextTrack();
  } else if (e.code === "ArrowLeft") {
    prevTrack();
  }
});

// ---- Kickoff ----
buildPlaylist();
loadTrack(index);
audio.volume = Number(volume.value);
highlightActive();
