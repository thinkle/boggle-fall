import wordList from "./wordsEn.txt?raw";
import { letterbank } from "./stores";
let words = wordList.split("\n").map((line) => line.replace(/\s/g, ""));

export function isWord(word: string) {
  if (words.find((w) => w == word)) {
    return true;
  } else {
    return false;
  }
}

export let letterValues: { [key: string]: number } = {};
let letterCount = 0;
let frequencies: { [key: string]: number } = {};
for (let word of wordList.split("\n")) {
  for (let letter of word.replace(/[^A-Za-z]/g, "")) {
    letterCount++;
    if (!frequencies[letter]) {
      frequencies[letter] = 1;
    } else {
      frequencies[letter] += 1;
    }
  }
}
let rarest = 10000;
let rarestLetter = "";
let mostCommon = 0;
let mostCommonLetter = "";
for (let l in frequencies) {
  let occurs = frequencies[l];
  if (occurs < rarest) {
    rarest = occurs;
    rarestLetter = l;
  }
  if (occurs > mostCommon) {
    mostCommon = occurs;
    mostCommonLetter = l;
  }
}
console.log("Rarest letter is", rarestLetter, rarest);
console.log("Most common is", mostCommonLetter, mostCommon);
console.log("Frequencies are", frequencies);

let letters = Object.keys(frequencies);

// Our frequencies range from .15% to 10%...
for (let l of letters) {
  let pct = (100 * frequencies[l]) / letterCount;
  let score: number;
  if (pct > 6) {
    score = 1;
  } else if (pct > 4) {
    score = 2;
  } else if (pct > 2.5) {
    score = 3;
  } else if (pct > 1.5) {
    score = 4;
  } else if (pct > 1) {
    score = 5;
  } else if (pct > 0.8) {
    score = 6;
  } else if (pct > 0.6) {
    score = 7;
  } else if (pct > 0.25) {
    score = 8;
  } else if (pct > 0.16) {
    score = 9;
  } else {
    score = 10;
  }
  console.log(l, pct.toFixed(3), "%", "=>", score);
  letterValues[l] = score;
}

//letters.sort((a,b)=>frequencies[a]-frequencies[b]);
/* 
for (let idx=0; idx<letters.length; idx++) {
  let score = 1;
  // Rank our 26 letters and distribute them as follows...
  if (idx < 2) { // 2 10-pointers
    score = 10;  
  } else if (idx < 3) {
    score = 9;
  } 
  else if (idx < 5) {
    score = 8;
  } else if (idx < 9) {
    score = 6
  } else if (idx < 11) {
    score = 5
  } else if (idx < 14) {
    score = 4
  } else if (idx < 18) {
    score = 3
  } else if (idx < 20) {
    score = 2
  } else {
    score = 1
  }
  console.log(letters[idx],'=>',score, '(',100*frequencies[letters[idx]]/letterCount,')')
  letterValues[letters[idx]] = score;
} */

export function scoreWord(word: string) {
  let value = 0;
  for (let ltr of word) {
    value += letterValues[ltr] || 0;
  }
  let lengthMultiplier = getMultiplier(word);
  return Math.ceil(value * lengthMultiplier);
}

export function getMultiplier(word: string) {
  let lengthMultiplier = 1;
  if (word.length === 1 || word.length === 2) {
    lengthMultiplier = 0.5; // Punish 1 and 2-letter words
  } else if (word.length === 3) {
    lengthMultiplier = 1; // Normal multiplier for 3-letter words
  } else if (word.length === 4) {
    lengthMultiplier = 1.25; // Slight bonus for 4-letter words (25%)
  } else if (word.length === 5) {
    lengthMultiplier = 1.5; // Good multiplier for 5-letter words
  } else {
    // Bigger bonuses for words longer than 5
    lengthMultiplier = 1.5 + (word.length - 5) * 0.5;
  }
  if (lengthMultiplier > 2) {
    // No fractions bigger...
    lengthMultiplier = Math.ceil(lengthMultiplier);
  }
  return lengthMultiplier;
}

let word = "h";
for (let i = 1; i < 25; i++) {
  word += "i";
  console.log("Word of length", i, "multiplier=", getMultiplier(word));
}

let deadEnds = new Set();

export function findMatchingWords(stem: string, wordlist = null) {
  let ww = wordlist || words;
  if (deadEnds.has(stem)) {
    return null;
  } else {
    let matches = ww.filter((w) => w.substring(0, stem.length) == stem);
    if (matches.length == 0) {
      deadEnds.add(stem);
      return null;
    } else {
      return matches;
    }
  }
}
