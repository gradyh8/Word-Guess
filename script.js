// === Word List ===
const words = [
  "apple", "grape", "peach", "lemon", "mango", "melon", "cherry", "berry",
  "zebra", "tiger", "eagle", "shark", "whale", "snake", "camel", "horse",
  "chair", "table", "plant", "bread", "toast", "dream", "light", "night"
];

let word = "";
let currentGuess = "";
let row = 0;
const maxRows = 6;

const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");
const newGameBtn = document.getElementById("newGame");
const shareBtn = document.getElementById("share");

// === Initialize Board ===
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

// === Build On-screen Keyboard ===
const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
function createKeyboard() {
  keyboard.innerHTML = "";
  rows.forEach(letters => {
    for (let letter of letters) {
      const key = document.createElement("div");
      key.classList.add("key");
      key.textContent = letter;
      key.addEventListener("click", () => handleKey(letter.toLowerCase()));
      keyboard.appendChild(key);
    }
  });
  // Add Enter + Backspace
  const enter = document.createElement("div");
  enter.textContent = "Enter";
  enter.classList.add("key");
  enter.addEventListener("click", handleEnter);
  keyboard.appendChild(enter);

  const back = document.createElement("div");
  back.textContent = "⌫";
  back.classList.add("key");
  back.addEventListener("click", handleBackspace);
  keyboard.appendChild(back);
}

// === Start New Game ===
function startGame() {
  word = words[Math.floor(Math.random() * words.length)];
  currentGuess = "";
  row = 0;
  message.textContent = "";
  createBoard();
  createKeyboard();
  console.log("Word is:", word); // for testing
}

// === Input Handlers ===
function handleKey(letter) {
  if (message.textContent.includes("won") || message.textContent.includes("lose")) return;
  if (currentGuess.length < 5) {
    currentGuess += letter;
    updateBoard();
  }
}

function handleEnter() {
  if (currentGuess.length === 5) checkGuess();
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
    cells[i].classList.remove("correct", "present", "absent");

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

// === Keyboard + Buttons ===
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

// === Start Game on Load ===
startGame();
