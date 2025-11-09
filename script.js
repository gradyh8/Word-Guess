// === Word List ===

let words = [];

async function loadWordList() {
  const res = await fetch('https://raw.githubusercontent.com/tabatkins/wordle-list/main/words');
  const text = await res.text();
  words = text.split('\n').map(w => w.trim().toLowerCase()).filter(w => w.length === 5);
  startGame(); // start once words are loaded
}

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

  layout.forEach((line, idx) => {
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    rowDiv.style.justifyContent = "center";
    rowDiv.style.marginBottom = "5px";

    // Add Enter before last row
    if (idx === 2) {
      const enterKey = createKey("Enter");
      rowDiv.appendChild(enterKey);
    }

    for (let letter of line) {
      const key = createKey(letter);
      rowDiv.appendChild(key);
    }
    const keySpacing = ["", " ", "  "]; // adds indentation for rows 2 and 3
layout.forEach((line, idx) => {
  const rowDiv = document.createElement("div");
  rowDiv.style.display = "flex";
  rowDiv.style.justifyContent = "center";
  rowDiv.style.marginBottom = "5px";

  // add spacing
  if (keySpacing[idx]) {
    const spacer = document.createElement("div");
    spacer.style.width = `${keySpacing[idx].length * 10}px`;
    rowDiv.appendChild(spacer);
  }

  if (idx === 2) rowDiv.appendChild(createKey("Enter"));

  for (let letter of line) {
    rowDiv.appendChild(createKey(letter));
  }

  if (idx === 2) rowDiv.appendChild(createKey("⌫"));

  keyboard.appendChild(rowDiv);
});

    // Add Backspace after last row
    if (idx === 2) {
      const backKey = createKey("⌫");
      rowDiv.appendChild(backKey);
    }

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
}

// === Update Board ===
function updateBoard() {
  const currentRow = board.children[row];
  const cells = currentRow.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.textContent = currentGuess[i] || "";
  });
}

// === Check Guess ===
function checkGuess() {
  const currentRow = board.children[row];
  const cells = currentRow.querySelectorAll(".cell");
  const guess = currentGuess;

  for (let i = 0; i < 5; i++) {
    cells[i].style.background = "var(--cell)";

    if (guess[i] === word[i]) {
      cells[i].style.background = "var(--correct)";
    } else if (word.includes(guess[i])) {
      cells[i].style.background = "var(--present)";
    } else {
      cells[i].style.background = "var(--absent)";
    }
  }

  if (guess === word) {
    message.textContent = "You won! 🎉";
  } else if (row === maxRows - 1) {
    message.textContent = `You lose! The word was ${word.toUpperCase()}`;
  } else {
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
loadWordList();

