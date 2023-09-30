import wordList from './wordsEn.txt?raw';
import { letterbank } from './stores';
let words = wordList.split('\n').map((line)=>line.replace(/\s/g,''));

export function isWord (word : string) {  
  if (words.find((w)=>w==word)) {
    return true;
  } else {
    return false;
  }
}

export let letterValues : {[key : string] : number} = {  
};

let frequencies : {[key: string] : number} = {}
for (let letter of letterbank) {
  if (!frequencies[letter]) {
    frequencies[letter] = 1;
  } else {
    frequencies[letter] += 1;
  }
}
let rarest = 10000;
let rarestLetter = ''
let mostCommon = 0;
let mostCommonLetter = ''
for (let l in frequencies) {
  let occurs = frequencies[l]
  if (occurs < rarest) {
    rarest = occurs;
    rarestLetter = l;
  }
  if (occurs > mostCommon) {
    mostCommon = occurs;
    mostCommonLetter = l;
  }
}
console.log('Rarest letter is',rarestLetter,rarest);
console.log('Most common is',mostCommonLetter,mostCommon);
console.log('Frequencies are',frequencies);

let letters = Object.keys(frequencies);
letters.sort((a,b)=>frequencies[a]-frequencies[b]);

for (let idx=0; idx<letters.length; idx++) {
  let score = 1;
  if (idx < 2) {
    score = 10;  
  } else if (idx < 5) {
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
  console.log(letters[idx],'=>',score)
  letterValues[letters[idx]] = score;
}


export function scoreWord (word : string) {
  let value = 0;
  for (let ltr of word) {
    value += letterValues[ltr]||0;
  }
  let lengthMultiplier = getMultiplier(word);
  return Math.ceil(value*lengthMultiplier);
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
    lengthMultiplier = Math.ceil(lengthMultiplier)
  }
  return lengthMultiplier;
}

let word = 'h'
for (let i=1; i<25; i++) {
  word += 'i';
  console.log('Word of length',i,'multiplier=',getMultiplier(word))
}

let deadEnds = new Set();

export function findMatchingWords (stem : string, wordlist=null) {
  let ww = wordlist || words;
  if (deadEnds.has(stem)) {
    return null;
  } else {
    let matches = ww.filter((w)=>w.substring(0,stem.length)==stem)
    if (matches.length==0) {
      deadEnds.add(stem);
      return null
    } else {
      return matches;
    }
  }
}