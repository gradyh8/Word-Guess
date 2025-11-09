// === Word List ===
// (250 common 5-letter words for now — lightweight but good variety)
const words = [
  "apple","grape","peach","lemon","mango","melon","cherry","berry","zebra","tiger","eagle","shark",
  "whale","snake","camel","horse","chair","table","plant","bread","toast","dream","light","night",
  "angel","ghost","magic","storm","cloud","green","black","white","amber","coral","beach","coast",
  "mount","river","ocean","space","earth","flame","spark","cabin","trail","music","sound","notes",
  "drums","gamer","fight","skate","chess","score","track","court","money","price","coins","trade",
  "heart","truth","faith","peace","laugh","smile","grace","honor","trust","clear","smart","blaze",
  "brand","brave","bring","broad","bloom","brush","candy","creek","dance","dream","flame","flash",
  "glove","grain","grind","grape","great","grown","habit","happy","harsh","house","index","jelly",
  "knife","known","label","laser","lemon","liver","lunch","magic","major","march","match","medal",
  "metal","minor","model","music","night","noble","north","ocean","order","paint","paper","party",
  "pearl","piano","pilot","plain","plant","plate","press","price","proud","quiet","radio","range",
  "ready","right","river","round","royal","scale","score","shade","shake","shape","share","sharp",
  "sheep","shelf","shine","shirt","shock","shoot","short","sight","skill","skirt","sleep","smart",
  "smile","smoke","snake","solar","solid","sound","south","space","spare","speak","speed","spice",
  "spine","spoke","sport","stage","stand","start","steel","stick","stone","store","storm","story",
  "strip","style","sugar","sweet","swing","table","taste","teach","thank","their","theme","there",
  "thing","think","three","throw","tiger","tight","title","today","token","touch","tough","tower",
  "track","trade","train","treat","trend","trust","truth","under","unity","urban","usual","value",
  "video","voice","watch","water","where","white","whole","woman","world","worry","worth","write"
];

curl -s https://raw.githubusercontent.com/tabatkins/wordle-list/main/words | grep ...

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
startGame();
