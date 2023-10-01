<script lang="ts">
  import Feedback from "./Feedback.svelte";
  import type {Letter} from './stores';
  import "./assets/fonts.css";
  import EffectCanvas from "./EffectCanvas.svelte";
  import LetterBlock from "./lib/LetterBlock.svelte";
  import { send, receive } from "./transition";
  import {
    letters,
    score,
    selected,
    areTouching,
    words,
    replaceLetter,
    toLetters,
    startTime,
    bestCurrentScore,
  } from "./stores";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { derived } from "svelte/store";
  import { isWord, scoreWord } from "./words";
  import { getPageOffset } from "./util";

  let grid: HTMLDivElement;

  
  /* Select code for mouse/touch */
  function selectLetter(
    letter: { id: number; letter: string; selected?: boolean },
    noOff = false,
    noCut = false
  ) {
    /* Return true if selection changes,
  false if it is unchanged...
  */
    let last = $selected.at(-1);
    // If we are the last item, remove us...
    if (last == letter) {
      // Remove last item...
      if (!noOff) {
        $selected.pop();
        $selected = $selected;
        return true;
      }
    } else if ($selected.indexOf(letter) == -1) {
      // Otherwise, if we aren't already in the list...
      if (!last || areTouching(letter, last)) {
        $selected = [...$selected, letter];
        return true;
      }
    } else if (!noCut) {
      let idx = $selected.indexOf(letter);
      $selected = $selected.slice(0, idx + 1);
      return true;
    }
  }

  let lastScoreGap = -1;
  let lastScore = 0;
  let lastWord = "";

  function finishWord() {
    let word = $selected;
    let wordString = toLetters(word);
    if (word.length > 1 && isWord(wordString)) {
      let points = scoreWord(wordString);
      lastScore = points;
      $score += points;
      lastScoreGap = $bestCurrentScore - points;
      lastWord = wordString;
      $words = [...$words, word];
      if (!$startTime) {
        $startTime = new Date().getTime();
      }
      for (let i = 0; i < $selected.length; i++) {
        replaceLetter($selected[i]);
      }
    } else {
      $selected.forEach((l) => (l.selected = false));
    }
    keyboardPatterns = [];
    keyboardSelected = [];
    patternIndex = 0;
    $selected = [];
  }

  let letterElements: {
    [key: number]: HTMLDivElement;
  } = {};

  let selectedElements = derived([selected], ([$selected]) =>
    $selected.map((letter) => letterElements[letter.id])
  );
  let secondaryPatterns : HTMLDivElement[][] = [];
  $: secondaryPatterns = keyboardPatterns.map(
    (pattern)=>pattern.map((letter)=>letterElements[letter.id])
  );


  function getTouchedLetter(e) {
    for (let t of e.touches) {
      let hovered = document.elementsFromPoint(t.pageX, t.pageY);
      for (let h of hovered) {
        for (let id in letterElements) {
          let el = letterElements[id];
          if (h == el) {
            let hoveredLetter = $letters.find((l) => l.id == id);
            // Ignore touch at the edge of hovered letter...
            let w = el.clientWidth;
            let h = el.clientHeight;
            let { x, y } = getPageOffset(el);
            let touchX = t.pageX;
            let touchY = t.pageY;

            // Check if we are in the center half of the letter...
            if (touchX > x + 0.25 * w && touchX < x + 0.75 * w) {
              return hoveredLetter;
            }
          }
        }
      }
    }
  }

  let lastTouched;
  let initialTouchTarget;

  function onTouchMove(e) {
    e.preventDefault();
    let letter = getTouchedLetter(e);
    if (!letter) {
      return;
    }
    clickMode = false;
    if (letter == initialTouchTarget) {
      return;
    } else if (letter == lastTouched) {
      return;
    } else {
      selectLetter(letter, true, false);
      lastTouched = letter;
    }
  }
  let changeIndex = 0;

  function onTouchEnd(e) {
    e.preventDefault();
    finishWord();
  }

  function onTouchStart(e) {
    let letter = getTouchedLetter(e);
    initialTouchTarget = letter;
    lastTouched = initialTouchTarget;
    if (letter) {
      selectLetter(letter);
    }
  }

  /* Click-related code */
  let clickMode = false;

  function maybeFinishWord() {
    if ($selected && !clickMode) {
      finishWord();
    }
  }

  function clickSelectLetter(letter) {
    clickMode = true;
    selectLetter(letter);
  }

  let keyboardPatterns : Letter[][] = [];  
  let keyboardSelected : Letter[] = [];
  let patternIndex = 0;
  function addLetterToPattern (pattern : Letter[], letter : Letter) {
    let lastLetter = pattern.at(-1);
    if (!lastLetter) {
      throw new Error("addLetterToPattern with empty pattern???")      
    }
    // Already in our word? Stop!
    if (pattern.indexOf(letter) > -1) {
      return
    }
    // Not touching, not a thing
    if (!areTouching(lastLetter,letter)) {
      return
    }
    // Wait -- we *are* a thing and we *are* touching!
    return [...pattern,letter]    
  }

  function handleKeyboardInput (e : KeyboardEvent) {
    console.log('KBD:',e.key);
    /* Typing can match any number of patterns... */
    if (e.key=='Backspace') {
      console.log('Erase!')
      for (let p of keyboardPatterns) {
        p.pop();        
      }
      if (keyboardPatterns.length && keyboardPatterns[0].length==0) {
        // If we are empty, empty our pattern list.
        console.log('Reset!');
        keyboardPatterns = [];        
      }
    }
    if (e.key == 'Return' || e.key=='Enter') {
      finishWord();
    }
    if (e.key == 'Tab' || e.key=='ArrowRight') {
      if (keyboardPatterns.length > 1) {
        patternIndex++
        e.preventDefault();
      }
    }
    if (e.key == 'ArrowLeft') {
      patternIndex--
    }
    if (e.key.match(/^[A-Za-z]$/)) {
      let letterString = e.key.toLowerCase();
      console.log('Letter!',letterString);
      // Get all letter blocks that match...
      let matchingLetters = $letters.filter((ltr)=>ltr.letter==letterString);
      if (matchingLetters.length==0) {
        console.log('No letter',letterString);
        return
      }
      if (keyboardPatterns.length == 0) {
        // When we start, we find all matching letters
        // in our grid and each letter starts a potential
        // pattern
        console.log('Starting fresh!');
        for (let ltr of matchingLetters) {
          keyboardPatterns.push([ltr])
        }
      } else {
        // Otherwise, we are trying to add our matchingLetters
        // to our patterns.
        let newPatterns = [];
        for (let pattern of keyboardPatterns) {
          for (let letter of matchingLetters) {
            let resultingPattern = addLetterToPattern(pattern,letter);
            if (resultingPattern) {
              newPatterns.push(resultingPattern);
            }
          }
        }
        keyboardPatterns = newPatterns;        
      }
    }
    // Loop through all the letters we have selected
    // and push them    
    keyboardSelected = [];
    for (let pattern of keyboardPatterns) {
      for (let l of pattern) {
        if (!keyboardSelected.includes(l)) {
          keyboardSelected.push(l);
        }
      }
    }
    // Make svelte see the change!
    keyboardSelected = keyboardSelected;
    $selected = keyboardPatterns[patternIndex % keyboardPatterns.length] || [];

  }

</script>

<svelte:window 
  on:mouseup={maybeFinishWord} 
  on:keydown={handleKeyboardInput}
  />

<div class="feedback-holder">
  {#if lastScoreGap >= 0}
    <Feedback word={lastWord} {lastScoreGap} score={lastScore} />
  {/if}
</div>
<main
  bind:this={grid}
  on:touchstart={onTouchStart}
  on:touchend={onTouchEnd}
  on:touchmove={onTouchMove}
  on:click={finishWord}
>
  <EffectCanvas parent={grid} selectedElements={$selectedElements} 
    secondaryPatterns={secondaryPatterns}
  />
  {#each $letters as letter (letter.id)}
    <div
      animate:flip
      tabindex="0"
      class="letter-container"
      bind:this={letterElements[letter.id]}
      in:fly|local={{ y: -100, duration: 1000 }}
      out:send={{ key: letter.id, duration: 1000 }}
      style:position="relative"
      on:click|stopPropagation={() => clickSelectLetter(letter)}
      on:mousemove={(e) => {
        if (e.buttons) {
          let changed = selectLetter(letter, true);
          if (changed) {
            clickMode = false;
          }
        }
      }}
    >
      <!-- <div class="target"            
            on:mouseenter={(e)=>{
              
            if (e.buttons) {
              console.log('Mouse enter target w button!')
              selectLetter(letter,false)
            }
          }}          
          >
          </div> -->
      <LetterBlock
        
        selected={$selected.includes(letter)
        || keyboardSelected.includes(letter)}
        letter={letter.letter}
      />
    </div>
  {/each}
</main>

<style>
  .halo {
    position: absolute;
    right: -50px;
    top: 10px;
    width: 75px;
    font-size: 10px;
    z-index: 90;
    pointer-events: none;
  }
  :root {
    font-family: "Bild Variable Web", sans-serif;
  }

  :root {
    --block-width: calc(min(64px, 12vw));
    --block-height: var(--block-width);
  }

  main {
    margin: auto;
    user-select: none;
    display: grid;
    gap: 8px;
    justify-content: center;
    align-items: center;
    grid-template-columns: repeat(5, calc(1.25 * var(--block-width)));
    grid-template-rows: repeat(5, calc(1.25 * var(--block-height)));
    position: relative;
  }

  .letter-container {
    position: relative;
    z-index: 2;
    justify-self: center;
    align-self: center;
  }
  .feedback-holder {
    height: 2em;
    display: flex;
    justify-content: center;
  }
</style>
