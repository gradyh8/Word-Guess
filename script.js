// Minimal Word Guess (5-letter) — single file
const WORDS = [
  "apple","party","grace","flute","crane","brave","light","stone","water","train",
  "blush","pride","swing","chart","plane","shout","brain","stern","sound","frame","audio","lymph","plair","plant"
]; // keep a longer list in real game

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const boardEl = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const messageEl = document.getElementById('message');
const newGameBtn = document.getElementById('newGame');
const shareBtn = document.getElementById('share');

let solution = null;
let guesses = []; // array of guess strings
let currentGuess = "";

function dateToIndex(date = new Date()){
  // deterministic index from date (YYYY-MM-DD)
  const d = date.toISOString().slice(0,10);
  let hash = 0;
  for(let i=0;i<d.length;i++) hash = (hash*31 + d.charCodeAt(i)) >>> 0;
  return hash % WORDS.length;
}

function pickDailySolution(){
  const idx = dateToIndex(new Date());
  return WORDS[idx].toLowerCase();
}

function createBoard(){
  boardEl.innerHTML = "";
  for(let r=0;r<MAX_GUESSES;r++){
    const row = document.createElement('div'); row.className='row';
    for(let c=0;c<WORD_LENGTH;c++){
      const cell = document.createElement('div'); cell.className='cell';
      cell.dataset.r = r; cell.dataset.c = c;
      row.appendChild(cell);
    }
    boardEl.appendChild(row);
  }
}

function createKeyboard(){
  keyboardEl.innerHTML = "";
  const rows = ["qwertyuiop","asdfghjkl","zxcvbnm"];
  rows.forEach(r=>{
    const rowEl = document.createElement('div'); rowEl.style.display='flex'; rowEl.style.gap='8px';
    for(const ch of r){
      const k = document.createElement('div'); k.className='key'; k.textContent=ch;
      k.addEventListener('click',()=>handleKey(ch));
      rowEl.appendChild(k);
    }
    keyboardEl.appendChild(rowEl);
  });
  // enter and backspace
  const controlRow = document.createElement('div'); controlRow.style.marginTop='8px';
  const enter = document.createElement('div'); enter.className='key'; enter.style.minWidth='64px';
  enter.textContent='Enter'; enter.addEventListener('click',()=>handleKey('Enter'));
  const back = document.createElement('div'); back.className='key'; back.textContent='⌫';
  back.style.minWidth='64px'; back.addEventListener('click',()=>handleKey('Backspace'));
  controlRow.appendChild(enter); controlRow.appendChild(back);
  keyboardEl.appendChild(controlRow);
}

function render(){
  // fill board
  for(let r=0;r<MAX_GUESSES;r++){
    for(let c=0;c<WORD_LENGTH;c++){
      const cell = boardEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
      cell.textContent = '';
      cell.style.background = '';
    }
    const guess = guesses[r] || (r === guesses.length ? currentGuess : "");
    for(let i=0;i<guess.length;i++){
      const cell = boardEl.querySelector(`.cell[data-r="${r}"][data-c="${i}"]`);
      cell.textContent = guess[i].toUpperCase();
    }
    // color evaluated rows
    if(r < guesses.length){
      const guess = guesses[r];
      const result = evaluateGuess(guess, solution); // array of 'correct','present','absent'
      for(let i=0;i<WORD_LENGTH;i++){
        const cell = boardEl.querySelector(`.cell[data-r="${r}"][data-c="${i}"]`);
        if(result[i]==='correct') cell.style.background = getComputedStyle(document.documentElement).getPropertyValue('--correct');
        else if(result[i]==='present') cell.style.background = getComputedStyle(document.documentElement).getPropertyValue('--present');
        else cell.style.background = getComputedStyle(document.documentElement).getPropertyValue('--absent');
      }
    }
  }
  updateKeyboardColors();
}

function evaluateGuess(guess, sol){
  // returns array same length as guess with 'correct'|'present'|'absent'
  guess = guess.split(''); sol = sol.split('');
  const res = Array(WORD_LENGTH).fill('absent');
  const solLetters = {};
  for(let i=0;i<WORD_LENGTH;i++) solLetters[sol[i]] = (solLetters[sol[i]]||0)+1;
  // first pass: correct
  for(let i=0;i<WORD_LENGTH;i++){
    if(guess[i]===sol[i]){
      res[i]='correct'; solLetters[guess[i]]--;
    }
  }
  // second pass: present
  for(let i=0;i<WORD_LENGTH;i++){
    if(res[i]==='correct') continue;
    const ch = guess[i];
    if(solLetters[ch] > 0){
      res[i]='present'; solLetters[ch]--;
    }
  }
  return res;
}

function updateKeyboardColors(){
  // naive: mark keys based on best state from guesses
  const keyMap = {};
  guesses.forEach(g=>{
    const r = evaluateGuess(g,solution);
    for(let i=0;i<g.length;i++){
      const k = g[i];
      const prev = keyMap[k];
      const state = r[i];
      // priority: correct > present > absent
      if(prev==='correct') continue;
      if(prev==='present' && state==='absent') continue;
      keyMap[k] = state;
    }
  });
  // color keys
  document.querySelectorAll('.key').forEach(kEl=>{
    const ch = kEl.textContent.toLowerCase();
    kEl.style.background = '';
    if(keyMap[ch]==='correct') kEl.style.background = getComputedStyle(document.documentElement).getPropertyValue('--correct');
    else if(keyMap[ch]==='present') kEl.style.background = getComputedStyle(document.documentElement).getPropertyValue('--present');
    else if(keyMap[ch]==='absent') kEl.style.background = getComputedStyle(document.documentElement).getPropertyValue('--absent');
  });
}

function setMessage(txt, timeout=2500){
  messageEl.textContent = txt;
  if(timeout) setTimeout(()=>{ if(messageEl.textContent===txt) messageEl.textContent=''; }, timeout);
}

function handleKey(key){
  if(key==='Enter') return submitGuess();
  if(key==='Backspace' || key==='⌫'){
    currentGuess = currentGuess.slice(0,-1);
    render(); return;
  }
  if(/^[a-z]$/.test(key)){
    if(currentGuess.length < WORD_LENGTH){
      currentGuess += key;
      render();
    }
  }
}

function submitGuess(){
  if(currentGuess.length !== WORD_LENGTH){ setMessage("Not enough letters"); return; }
  // basic validity: check it's in word list (optional)
  if(!WORDS.includes(currentGuess)){
    setMessage("Not in word list");
    return;
  }
  guesses.push(currentGuess);
  render();
  const last = guesses[guesses.length-1];
  if(last === solution){
    setMessage(`You win! (${guesses.length}/${MAX_GUESSES})`, 5000);
    saveStats(true);
    // reveal nothing else — could lock play until next day
  } else if(guesses.length >= MAX_GUESSES){
    setMessage(`Out of tries. The word was ${solution.toUpperCase()}`, 7000);
    saveStats(false);
  } else {
    currentGuess = "";
  }
}

function onKeyDown(e){
  const k = e.key;
  if(k==='Enter') handleKey('Enter');
  else if(k==='Backspace') handleKey('Backspace');
  else if(/^[a-zA-Z]$/.test(k)) handleKey(k.toLowerCase());
}

function newGame(){
  solution = pickDailySolution();
  guesses = [];
  currentGuess = "";
  createBoard(); render();
  setMessage('');
  saveState();
}

function saveState(){
  const key = 'wordguess_state';
  localStorage.setItem(key, JSON.stringify({date: (new Date()).toISOString().slice(0,10), guesses}));
}

function loadState(){
  const key = 'wordguess_state';
  try{
    const raw = JSON.parse(localStorage.getItem(key));
    if(raw && raw.date === (new Date()).toISOString().slice(0,10) && raw.guesses){
      solution = pickDailySolution();
      guesses = raw.guesses;
      currentGuess = "";
      createBoard();
      render();
      return true;
    }
  }catch(e){}
  return false;
}

function saveStats(win){
  const k = 'wordguess_stats';
  const s = JSON.parse(localStorage.getItem(k) || '{}');
  s.played = (s.played||0) + 1;
  if(win) s.wins = (s.wins||0) + 1;
  s.lastPlayed = (new Date()).toISOString().slice(0,10);
  localStorage.setItem(k, JSON.stringify(s));
}

function shareResult(){
  if(guesses.length===0){ setMessage('No result to share'); return; }
  const lines = guesses.map(g => {
    const r = evaluateGuess(g,solution);
    return r.map(x=> x==='correct' ? '🟩' : x==='present' ? '🟨' : '⬛').join('');
  }).join('\n');
  const text = `Word Guess ${new Date().toISOString().slice(0,10)}\n${guesses.length}/${MAX_GUESSES}\n\n${lines}`;
  navigator.clipboard?.writeText(text).then(()=>setMessage('Result copied to clipboard',2000),()=>setMessage('Could not copy'));
}

window.addEventListener('keydown', onKeyDown);
newGameBtn.addEventListener('click', ()=>{ localStorage.removeItem('wordguess_state'); newGame(); });
shareBtn.addEventListener('click', shareResult);

(function init(){
  createBoard();
  createKeyboard();
  if(!loadState()){
    solution = pickDailySolution();
    render();
  }
})();


// === Word List ===
const words = [
  "apple", "grape", "peach", "lemon", "mango", "melon", "cherry", "berry",
  "zebra", "tiger", "eagle", "shark", "whale", "snake", "camel", "horse",
  "chair", "table", "plant", "bread", "toast", "dream", "light", "night"
];

// === Variables ===
let word = "";
let currentGuess = "";
let row = 0;
const maxRows = 6;
const board = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const message = document.getElementById("message");

// === Create Board ===
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < maxRows * 5; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    board.appendChild(tile);
  }
}

// === Create Keyboard ===
const keys = [
  ..."QWERTYUIOP".split(""),
  ..."ASDFGHJKL".split(""),
  ..."ZXCVBNM".split("")
];

function createKeyboard() {
  keyboard.innerHTML = "";
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  rows.forEach(rowLetters => {
    const rowDiv = document.createElement("div");
    rowLetters.split("").forEach(letter => {
      const key = document.createElement("button");
      key.textContent = letter;
      key.className = "key";
      key.addEventListener("click", () => handleInput(letter.toLowerCase()));
      rowDiv.appendChild(key);
    });
    keyboard.appendChild(rowDiv);
  });

  const enter = document.createElement("button");
  enter.textContent = "Enter";
  enter.className = "key wide";
  enter.addEventListener("click", handleEnter);
  keyboard.appendChild(enter);

  const back = document.createElement("button");
  back.textContent = "⌫";
  back.className = "key wide";
  back.addEventListener("click", handleBackspace);
  keyboard.appendChild(back);
}

// === Game Logic ===
function startGame() {
  word = words[Math.floor(Math.random() * words.length)];
  currentGuess = "";
  row = 0;
  message.textContent = "";
  createBoard();
  createKeyboard();
  console.log("Word is:", word); // debug only
}

function handleInput(letter) {
  if (currentGuess.length < 5 && row < maxRows) {
    currentGuess += letter;
    updateBoard();
  }
}

function handleEnter() {
  if (currentGuess.length === 5) {
    checkGuess();
  }
}

function handleBackspace() {
  currentGuess = currentGuess.slice(0, -1);
  updateBoard();
}

function updateBoard() {
  const start = row * 5;
  for (let i = 0; i < 5; i++) {
    const tile = board.children[start + i];
    tile.textContent = currentGuess[i] || "";
  }
}

function checkGuess() {
  const start = row * 5;
  const guess = currentGuess;

  for (let i = 0; i < 5; i++) {
    const tile = board.children[start + i];
    tile.classList.remove("correct", "present", "absent");

    if (guess[i] === word[i]) {
      tile.classList.add("correct");
    } else if (word.includes(guess[i])) {
      tile.classList.add("present");
    } else {
      tile.classList.add("absent");
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
  if (/^[a-zA-Z]$/.test(e.key)) handleInput(e.key.toLowerCase());
  else if (e.key === "Enter") handleEnter();
  else if (e.key === "Backspace") handleBackspace();
});

document.getElementById("newGame").addEventListener("click", startGame);

// Share Button Placeholder
document.getElementById("share").addEventListener("click", () => {
  navigator.clipboard.writeText("Check out my Word Guess game!").then(() => {
    message.textContent = "Link copied to clipboard!";
  });
});

// Start game when page loads
startGame();


