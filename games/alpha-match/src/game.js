const LEVELS = [
  { id: 0, name: "Easy", rows: 2, cols: 2, letters: ["A", "B"], icon: "A" },
  { id: 1, name: "Normal", rows: 2, cols: 4, letters: ["A", "B", "C", "D"], icon: "C" },
  { id: 2, name: "Challenge", rows: 3, cols: 4, letters: ["A", "B", "C", "D", "E", "F"], icon: "F" }
];

const STORAGE_KEY = "alphaMatchSaveV1";

const defaults = {
  highestUnlocked: 0,
  sound: true,
  voice: true,
  music: false,
  gamesCompleted: 0
};

let save = loadSave();
let currentLevel = LEVELS[0];
let firstCard = null;
let secondCard = null;
let boardLocked = false;
let moves = 0;
let matchedPairs = 0;
let lastSpokenLetter = "";
let musicTimer = null;
let audioContext = null;

const screens = [...document.querySelectorAll(".screen")];
const menuScreen = document.querySelector("#menuScreen");
const levelScreen = document.querySelector("#levelScreen");
const gameScreen = document.querySelector("#gameScreen");
const winScreen = document.querySelector("#winScreen");
const levelGrid = document.querySelector("#levelGrid");
const gameBoard = document.querySelector("#gameBoard");
const homeButton = document.querySelector("#homeButton");
const settingsDialog = document.querySelector("#settingsDialog");
const howToDialog = document.querySelector("#howToDialog");
const toast = document.querySelector("#toast");

const soundToggle = document.querySelector("#soundToggle");
const voiceToggle = document.querySelector("#voiceToggle");
const musicToggle = document.querySelector("#musicToggle");

document.querySelector("#playButton").addEventListener("click", openLevelSelect);
document.querySelector("#settingsButton").addEventListener("click", openSettings);
document.querySelector("#closeSettingsButton").addEventListener("click", () => settingsDialog.close());
document.querySelector("#howToButton").addEventListener("click", () => howToDialog.showModal());
document.querySelector("#closeHowToButton").addEventListener("click", () => howToDialog.close());
document.querySelector("#restartButton").addEventListener("click", () => startGame(currentLevel.id));
document.querySelector("#repeatButton").addEventListener("click", repeatLastLetter);
document.querySelector("#playAgainButton").addEventListener("click", () => startGame(currentLevel.id));
document.querySelector("#nextButton").addEventListener("click", goToNextLevel);
homeButton.addEventListener("click", openLevelSelect);

soundToggle.addEventListener("change", () => updateSetting("sound", soundToggle.checked));
voiceToggle.addEventListener("change", () => updateSetting("voice", voiceToggle.checked));
musicToggle.addEventListener("change", () => updateSetting("music", musicToggle.checked));

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (settingsDialog.open) settingsDialog.close();
    if (howToDialog.open) howToDialog.close();
  }
});

boot();

function boot() {
  syncSettings();
  renderLevels();
  showScreen(menuScreen);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      showToast("Offline mode could not be enabled.");
    });
  }
}

function loadSave() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...(stored || {}) };
  } catch {
    return { ...defaults };
  }
}

function persistSave() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

function syncSettings() {
  soundToggle.checked = save.sound;
  voiceToggle.checked = save.voice;
  musicToggle.checked = save.music;
  applyMusicSetting();
}

function updateSetting(key, value) {
  save[key] = value;
  persistSave();
  applyMusicSetting();
}

function openSettings() {
  syncSettings();
  settingsDialog.showModal();
}

function openLevelSelect() {
  renderLevels();
  showScreen(levelScreen);
}

function showScreen(target) {
  screens.forEach((screen) => screen.classList.toggle("active", screen === target));
  const showHome = target !== menuScreen;
  homeButton.classList.toggle("hidden", !showHome);
}

function renderLevels() {
  levelGrid.innerHTML = "";
  LEVELS.forEach((level) => {
    const unlocked = level.id <= save.highestUnlocked;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "level-card";
    button.disabled = !unlocked;
    button.innerHTML = `
      <span class="level-icon" aria-hidden="true"><img class="level-sprite" src="./assets/sprites/${unlocked ? level.icon : "lock"}.png" alt=""></span>
      <strong>${level.name}</strong>
      <small>${level.rows} × ${level.cols} board · ${level.letters.length} pairs</small>
    `;
    button.addEventListener("click", () => startGame(level.id));
    levelGrid.appendChild(button);
  });
}

function startGame(levelId) {
  currentLevel = LEVELS[levelId];
  firstCard = null;
  secondCard = null;
  boardLocked = false;
  moves = 0;
  matchedPairs = 0;
  lastSpokenLetter = "";

  document.querySelector("#gameModeLabel").textContent = currentLevel.name;
  document.querySelector("#movesValue").textContent = "0";
  document.querySelector("#pairsValue").textContent = "0";
  document.querySelector("#pairsTotal").textContent = String(currentLevel.letters.length);

  buildBoard();
  showScreen(gameScreen);
  playTone(440, 0.08, "sine", 0.03);
}

function buildBoard() {
  const deck = shuffle([...currentLevel.letters, ...currentLevel.letters]).map((letter, index) => ({
    id: `${letter}-${index}-${cryptoRandom()}`,
    letter
  }));

  gameBoard.innerHTML = "";
  gameBoard.style.setProperty("--columns", String(currentLevel.cols));

  deck.forEach((cardData) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-card";
    button.dataset.letter = cardData.letter;
    button.dataset.id = cardData.id;
    button.setAttribute("aria-label", "Hidden letter card");
    button.innerHTML = `
      <span class="card-face card-front" aria-hidden="true"><img class="card-sprite" src="./assets/sprites/card-back.png" alt=""></span>
      <span class="card-face card-back">
        <img class="card-sprite" src="./assets/sprites/${cardData.letter}.png" alt="Letter ${cardData.letter}">
        <span class="sparkles" aria-hidden="true"></span>
      </span>
    `;
    button.addEventListener("click", () => flipCard(button));
    gameBoard.appendChild(button);
  });
}

function flipCard(card) {
  if (
    boardLocked ||
    card === firstCard ||
    card.classList.contains("matched") ||
    card.classList.contains("flipped")
  ) {
    return;
  }

  card.classList.add("flipped");
  card.setAttribute("aria-label", `Letter ${card.dataset.letter}`);
  speakLetter(card.dataset.letter);
  playTone(610, 0.05, "sine", 0.025);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves += 1;
  document.querySelector("#movesValue").textContent = String(moves);
  checkPair();
}

function checkPair() {
  boardLocked = true;
  const isMatch = firstCard.dataset.letter === secondCard.dataset.letter;

  if (isMatch) {
    window.setTimeout(() => {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      firstCard.disabled = true;
      secondCard.disabled = true;
      matchedPairs += 1;
      document.querySelector("#pairsValue").textContent = String(matchedPairs);
      playMatchSound();
      resetTurn();

      if (matchedPairs === currentLevel.letters.length) {
        window.setTimeout(showWinScreen, 650);
      }
    }, 320);
  } else {
    window.setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      firstCard.setAttribute("aria-label", "Hidden letter card");
      secondCard.setAttribute("aria-label", "Hidden letter card");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  boardLocked = false;
}

function showWinScreen() {
  save.gamesCompleted += 1;
  if (currentLevel.id < LEVELS.length - 1) {
    save.highestUnlocked = Math.max(save.highestUnlocked, currentLevel.id + 1);
  }
  persistSave();

  document.querySelector("#winMoves").textContent = String(moves);
  document.querySelector("#winGames").textContent = String(save.gamesCompleted);
  document.querySelector("#winMessage").textContent =
    `You matched all ${currentLevel.letters.length} letter pairs.`;

  const nextButton = document.querySelector("#nextButton");
  const hasNext = currentLevel.id < LEVELS.length - 1;
  nextButton.hidden = !hasNext;
  nextButton.textContent = hasNext ? `Next: ${LEVELS[currentLevel.id + 1].name}` : "All Levels Complete";

  showScreen(winScreen);
  launchConfetti();
  playVictorySound();
}

function goToNextLevel() {
  const nextId = Math.min(currentLevel.id + 1, LEVELS.length - 1);
  startGame(nextId);
}

function repeatLastLetter() {
  if (!lastSpokenLetter) {
    showToast("Flip a card first.");
    return;
  }
  speakLetter(lastSpokenLetter, true);
}

function speakLetter(letter, force = false) {
  lastSpokenLetter = letter;
  if ((!save.voice && !force) || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(letter);
  utterance.rate = 0.72;
  utterance.pitch = 1.08;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function ensureAudio() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioContext = new AudioContext();
  }
  if (audioContext?.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(frequency, duration, type = "sine", volume = 0.04, delay = 0) {
  if (!save.sound) return;
  const ctx = ensureAudio();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delay;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function playMatchSound() {
  playTone(523.25, 0.12, "sine", 0.045);
  playTone(659.25, 0.14, "sine", 0.04, 0.1);
  playTone(783.99, 0.16, "sine", 0.035, 0.2);
}

function playVictorySound() {
  [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
    playTone(note, 0.22, "triangle", 0.04, index * 0.12);
  });
}

function applyMusicSetting() {
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }

  if (!save.music) return;

  const notes = [261.63, 329.63, 392.0, 329.63];
  let step = 0;
  musicTimer = window.setInterval(() => {
    if (!save.music) return;
    const originalSound = save.sound;
    save.sound = true;
    playTone(notes[step % notes.length], 0.6, "sine", 0.008);
    save.sound = originalSound;
    step += 1;
  }, 1800);
}

function launchConfetti() {
  const layer = document.querySelector("#confettiLayer");
  layer.innerHTML = "";
  const colors = ["#ffd95a", "#ff944d", "#77ca55", "#77c9ff", "#9f7aea"];

  for (let i = 0; i < 22; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDuration = `${2.8 + Math.random() * 2.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.55}s`;
    piece.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    layer.appendChild(piece);
  }

  window.setTimeout(() => {
    layer.innerHTML = "";
  }, 5200);
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function cryptoRandom() {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0].toString(16);
  }
  return Math.random().toString(16).slice(2);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}
