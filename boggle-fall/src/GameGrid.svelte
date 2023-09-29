<script lang="ts">
  import './assets/fonts.css'
  import EffectCanvas from './EffectCanvas.svelte';    
  import LetterBlock from './lib/LetterBlock.svelte'
  import {send,receive} from './transition';
  import {letters, score, selected, areTouching, words, replaceLetter, toLetters, startTime } from './stores';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { derived } from 'svelte/store';
  import { isWord, scoreWord } from './words';
  
  
  let grid : HTMLDivElement;

  function selectLetter (letter : {id:number,letter:string,selected?:boolean}, noOff=false, noCut=false) {                
    let last = $selected.at(-1);
    // If we are the last item, remove us...
    if (last==letter) {
      // Remove last item...
      if (!noOff) {        
        $selected.pop();
        $selected = $selected;   
      }
    } else if ($selected.indexOf(letter)==-1) {
      // Otherwise, if we aren't already in the list...
      if (!last || areTouching(letter,last)) {        
        $selected = [...$selected, letter];      
      }
    } else if (!noCut) {      
      let idx = $selected.indexOf(letter);      
      $selected = $selected.slice(0,idx+1)
    }
    return true;
  }  

  function resetSelected () {    
    let word = $selected;
    let wordString = toLetters(word)
    if (word.length > 1 && isWord(wordString)) {  
      $score += scoreWord(wordString);
      $words = [...$words,word];
      if (!$startTime) {
        $startTime = new Date().getTime();
      }
      for (let i=0; i<$selected.length; i++) {
        replaceLetter($selected[i]);
      }
    } else {
      $selected.forEach((l)=>l.selected=false)
    }
    $selected = [];
  }
  

  let letterElements : {
    [key : number] : HTMLDivElement
  }= {}
  
  let selectedElements = derived(
    [selected], ([$selected])=>$selected.map((letter)=>letterElements[letter.id])
  );

  function getPageOffset (el : HTMLElement) {
    let x = el.offsetLeft;
    let y = el.offsetTop;
    if (el.offsetParent) {
      let parentOffset = getPageOffset(el.offsetParent);
      x += parentOffset.x;
      y += parentOffset.y;
    }
    return {x,y}
  }

  function getTouchedLetter (e) {    
    for (let t of e.touches) {            
      let hovered = document.elementsFromPoint(t.pageX,t.pageY);
      for (let h of hovered) {
        for (let id in letterElements) {
          let el = letterElements[id];
          if (h==el) {            
            let hoveredLetter = $letters.find((l)=>l.id==id);
            // Ignore touch at the edge of hovered letter...
            let w = el.clientWidth;
            let h = el.clientHeight;
            let {x,y} = getPageOffset(el);
            let touchX = t.pageX;
            let touchY = t.pageY;

            // Check if we are in the center half of the letter...
            if ((touchX > (x + 0.25*w)) &&
                (touchX < (x + 0.75*w))) {
              return hoveredLetter
            }            
          }
        }
      }      
    }
  }
  
  let lastTouched;
  let initialTouchTarget;

  function onTouchMove (e) {   
    e.preventDefault(); 
    let letter = getTouchedLetter(e);
    if (!letter) {      
      return
    }
    if (letter == initialTouchTarget) {      
      return;
    } else if (letter == lastTouched) {
      return;
    } else {
      
      selectLetter(letter,true,false);
      lastTouched = letter;      
    }      
  }
  let changeIndex = 0;

  function onTouchEnd (e) {  
    e.preventDefault();   
    resetSelected()
  }

  function onTouchStart (e) {    
    let letter = getTouchedLetter(e);
    initialTouchTarget = letter;
    lastTouched = initialTouchTarget;
    if (letter) {
      selectLetter(letter);
    }
  }
  

</script>

<main bind:this={grid}
      on:click={resetSelected}
      on:touchstart={onTouchStart}
      on:touchend={onTouchEnd}
      on:touchmove={onTouchMove}
      on:mouseup={resetSelected}      
    >
      <EffectCanvas parent={grid} selectedElements={$selectedElements}/>
      {#each $letters as letter (letter.id)}
        <div animate:flip
          style="position:relative;z-index:2;"
          bind:this={letterElements[letter.id]}
          in:fly|local={{y:-100,duration:1000}}
          out:send={{key:letter.id,duration:1000}}      
          style:position="relative"             
          on:click={()=>selectLetter(letter,true)}           
          on:mousemove={(e)=>{            
            if (e.buttons) {              
              selectLetter(letter,true)
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
            selected={$selected.indexOf(letter)>-1} letter={letter.letter} />
        </div>
      {/each}
    </main>   

<style>
  :root {
    font-family:'Bild Variable Web',sans-serif;
  }
  
  @media screen and (width > 1000px) {
    :root {
      --block-width: calc(min(64px,12vw));
      --block-height: var(--block-width);
    }
  
}  
  main {
    margin: auto;
    user-select: none;    
    display: grid;
    gap: 8px;
    grid-template-columns: auto auto auto auto auto;
    position: relative;
  }
   

  /* Mobile */
  @media screen and (width < 800px) {
    
    :root {
      --block-width : 13vw;
      --block-height: 13vw;
      
    }
    
  }

</style>

