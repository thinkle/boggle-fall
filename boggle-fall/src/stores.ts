let lastIndex = 1;
const rowSize = 5;
const gridLength = rowSize ** 2;

type Letter = {
  id : number,
  letter : string,
  selected?: boolean
}
import {letterbank} from './letterbank'
import { derived, get, writable } from "svelte/store";
import type {Writable} from 'svelte/store';
export {letterbank};

export let words : Writable<Letter[][]> = writable([]);
/* 
let starterWords = [
  "go",
  "be",
  "is",
  "am", // 4
  "are",
  "were",
  "sure",
  "mad", // 8
  "go",
  "be",
  "is",
  "am", // 12
  "are",
  "were",
  "sure",
  "mad", // 16
  "are",
  "were",
  "sure",
  "mad", // 20
  "are",
  "were",
  "sure",
  "mad", // 24
  "are",
  "were",
  "sure",
  "mad", // 28
  "you",
  "we",
  "us"
];

let wordObjs = [];
for (let w of starterWords) {
  let word = Array.from(w).map(
    (l)=>{
      let next = {letter:l,id:lastIndex,selected:false}
      lastIndex++;
      return next;
    }
  );
  wordObjs.push(word);
}
words.set(wordObjs); */

export let letters : Writable<Letter[]> = writable([{ id: 0, letter: "A" }]);

export function toLetters (letters : Letter[]) {
  return letters.map((v)=>v.letter).join('');
}

export function replaceLetter (letter : Letter) {
  letters.update(
    ($letters) => {      
      let idx = $letters.indexOf(letter);
      let row = Math.floor(idx/rowSize);      
      if (row == 0) {
        // If we're in the first row, just replace with new letter
        $letters[idx] = makeNewLetter();
      } else {
        // Otherwise, the letters above "fall" until we are
        // replacing the first row...
        let prevIdx = idx - rowSize;        
        while (prevIdx >= 0) {          
          $letters[idx] = $letters[prevIdx];
          idx = prevIdx;
          prevIdx = idx - rowSize;
        }
        $letters[idx] = makeNewLetter();
      }

      return $letters;
    }
  )
}

export function areTouching (a : Letter,b : Letter) {
  let $letters = get(letters)
  let idxA = $letters.indexOf(a);
  let idxB = $letters.indexOf(b);
  let rowA = Math.floor(idxA / rowSize);
  let columnA = idxA % rowSize;
  let rowB = Math.floor(idxB / rowSize);
  let columnB = idxB % rowSize;
  if (Math.abs(columnA - columnB) < 2) {
    if (Math.abs(rowA - rowB) < 2) {
      return true;
    }
  }
}

letters.set(generateInitialLetters());

function makeNewLetter () {
  lastIndex++
  return {
    letter: getRandomLetter(),
    id: lastIndex,
  };
}

export function resetLetters () {
  let newLetters = generateInitialLetters();
  letters.set(newLetters);
}

function generateInitialLetters() {
  let letters = [];
  for (let i = 0; i < gridLength; i++) {
    letters.push(makeNewLetter());
    lastIndex++;
  }
  return letters;
}





function getRandomLetter() {  
  let index = Math.floor(Math.random() * letterbank.length);
  return letterbank[index];
}

export let selected : Writable<Letter[]> = writable([]);

type GameHistory = {
  words : string[];
  score : number;
  date : Date;
}

export let gameHistory : Writable<GameHistory[]> = writable([]);

let existingHistory = localStorage.getItem('history');
if (existingHistory) {
  let history = JSON.parse(existingHistory);
  gameHistory.set(history);
}

gameHistory.subscribe(
  ($history)=>{
    localStorage.setItem('history',JSON.stringify($history))
  }
);

export let bestGame = derived([gameHistory],([$gameHistory])=>{
  let highest: GameHistory | null = null;
  for (let h of $gameHistory) {
    if (!highest || h.score > highest.score) {
      highest = h;
    }
  }
  return highest
})

export let score = writable(0);