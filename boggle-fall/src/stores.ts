let lastIndex = 1;
const rowSize = 5;
const gridLength = rowSize ** 2;

type Letter = {
  id : number,
  letter : string,
  selected?: boolean
}
import {letterbank} from './letterbank'
import { get, writable } from "svelte/store";
import type {Writable} from 'svelte/store';
export {letterbank};

export let words : Writable<Letter[][]> = writable([]);

export let letters : Writable<Letter[]> = writable([{ id: 0, letter: "A" }]);

export function toString (letters : Letter[]) {
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