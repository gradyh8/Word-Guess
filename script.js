// === Word List ===
// === Word List ===
const words = [
  "apple","grape","peach","lemon","mango","melon","cherry","zebra","tiger",
  "eagle","shark","whale","snake","camel","horse","chair","table","plant",
  "bread","toast","dream","light","night","angel","ghost","magic","storm",
  "cloud","green","black","white","amber","coral","beach","coast","river",
  "music","sound","score","money","price","trade","heart","truth","faith",
  "peace","laugh","smile","grace","honor","trust","clear","smart","brand",
  "brave","candy","dance","flash","happy","house","knife","label","laser",
  "lemon","lunch","model","night","order","paint","party","piano","pilot",
  "plate","price","quiet","radio","range","right","scale","shade","share",
  "shine","shock","short","sight","skill","sleep","smoke","snake","solar",
  "solid","sound","south","space","sport","stand","start","steel","stern","stone",
  "storm","story","sugar","sweet","table","teach","thank","thing","three",
  "tiger","today","touch","tower","track","trade","train","treat","trend",
  "trust","truth","under","unity","value","video","voice","watch","water",
  "white","whole","woman","world","write","wreck"
];

// === Variables ===
let word = "";
let currentGuess = "";
let row = 0;
const maxRows = 6;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const newGameBtn = document.getElementById("newGame");
const shareBtn = document.getElementById("share");

// === Build Board ===
function createBoard() {
  board.innerHTML = "";
  for (let r = 0; r < maxRows; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    for (let c = 0; c < 5; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      rowDiv.appendChild(cell);
    }
    board.appendChild(rowDiv);
  }
}

// === Build Keyboard ===
function createKeyboard() {
  keyboard.innerHTML = "";
  const layout = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
  ];

  const keySpacing = ["0px", "20px", "40px"]; // left padding for row 2 & 3

  layout.forEach((line, idx) => {
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    rowDiv.style.justifyContent = "center";
    rowDiv.style.marginBottom = "5px";
    rowDiv.style.paddingLeft = keySpacing[idx];

    // Add Enter to start of row 3
    if (idx === 2) rowDiv.appendChild(createKey("Enter"));

    for (let letter of line) {
      rowDiv.appendChild(createKey(letter));
    }

    // Add Backspace to end of row 3
    if (idx === 2) rowDiv.appendChild(createKey("⌫"));

    keyboard.appendChild(rowDiv);
  });
}

function createKey(label) {
  const key = document.createElement("div");
  key.classList.add("key");
  key.textContent = label;
  key.addEventListener("click", () => {
    if (label === "Enter") handleEnter();
    else if (label === "⌫") handleBackspace();
    else handleKey(label.toLowerCase());
  });
  return key;
}

// === Start Game ===
function startGame() {
  word = words[Math.floor(Math.random() * words.length)];
  currentGuess = "";
  row = 0;
  message.textContent = "";
  createBoard();
  createKeyboard();
  console.log("Word:", word); // debug
}

// === Input Handling ===
function handleKey(letter) {
  if (message.textContent.includes("won") || message.textContent.includes("lose")) return;

  message.textContent = ""; // clear previous messages

  if (currentGuess.length < 5) {
    currentGuess += letter;
    updateBoard();
  }
}

function handleEnter() {
  if (currentGuess.length !== 5) return;

  if (!words.includes(currentGuess)) {
    message.textContent = "Not a valid word!";
    return;
  }

  checkGuess();
}

function handleBackspace() {
  currentGuess = currentGuess.slice(0, -1);
  updateBoard();
  message.textContent = ""; // clear previous messages
}

// === Update Board ===
function updateBoard() {
  const currentRow = board.children[row];
  const cells = currentRow.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.textContent = currentGuess[i] || "";
  });
}

// === Update keyboard key color ===
function updateKeyColor(letter, status) {
  const keys = keyboard.querySelectorAll(".key");
  keys.forEach(key => {
    if (key.textContent.toLowerCase() === letter) {
      // Only upgrade color: correct > present > absent
      if (status === "correct") key.classList.add("correct");
      else if (status === "present" && !key.classList.contains("correct")) key.classList.add("present");
      else if (status === "absent" && !key.classList.contains("correct") && !key.classList.contains("present")) key.classList.add("absent");
    }
  });
}

// === Check Guess ===
function checkGuess() {
  const currentRow = board.children[row];
  const cells = currentRow.querySelectorAll(".cell");
  const guess = currentGuess;

  // Count letters in the word
  const letterCounts = {};
  for (let l of word) letterCounts[l] = (letterCounts[l] || 0) + 1;

  const keyUpdates = {}; // store status for each letter

  // First pass: correct letters (green)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === word[i]) {
      cells[i].style.background = "var(--correct)";
      letterCounts[guess[i]]--;
      keyUpdates[guess[i]] = "correct"; // mark key as correct
    }
  }

  // Second pass: present (yellow) or absent (gray)
  for (let i = 0; i < 5; i++) {
    if (cells[i].style.background === "var(--correct)") continue;

    if (word.includes(guess[i]) && letterCounts[guess[i]] > 0) {
      cells[i].style.background = "var(--present)";
      letterCounts[guess[i]]--;
      // Only set yellow if the key isn't already green
      if (!keyUpdates[guess[i]]) keyUpdates[guess[i]] = "present";
    } else {
      cells[i].style.background = "var(--absent)";
      // Only set gray if the key isn't green or yellow yet
      if (!keyUpdates[guess[i]]) keyUpdates[guess[i]] = "absent";
    }
  }

  // Update keyboard
  Object.keys(keyUpdates).forEach(letter => {
    updateKeyColor(letter, keyUpdates[letter]);
  });

  if (guess === word) message.textContent = "You won! 🎉";
  else if (row === maxRows - 1) message.textContent = `You lose! The word was ${word.toUpperCase()}`;
  else {
    row++;
    currentGuess = "";
  }
}


// === Listeners ===
document.addEventListener("keydown", (e) => {
  if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toLowerCase());
  else if (e.key === "Enter") handleEnter();
  else if (e.key === "Backspace") handleBackspace();
});

newGameBtn.addEventListener("click", startGame);

shareBtn.addEventListener("click", () => {
  navigator.clipboard.writeText("Playing my Word Guess game!").then(() => {
    message.textContent = "Copied to clipboard!";
  });
});

// === Start Game ===
startGame();





