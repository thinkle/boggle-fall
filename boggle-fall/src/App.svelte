<script lang="ts">
  import './assets/fonts.css'
  import TitleBar from './TitleBar.svelte';

  import WordList from './WordList.svelte';
  import WordScore from './WordScore.svelte';
  import EffectCanvas from './EffectCanvas.svelte';    
  import LetterBlock from './lib/LetterBlock.svelte'
  import {send,receive} from './transition';
  import {letters, selected, areTouching, words, replaceLetter, toString } from './stores';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { derived } from 'svelte/store';
  import { isWord, scoreWord } from './words';
  
  let grid : HTMLDivElement;

  function selectLetter (letter : {id:number,letter:string,selected?:boolean}, noOff=false, noCut=false) {            
    //console.log('Select',letter,'(already have:',$selected,')')
    let last = $selected.at(-1);
    // If we are the last item, remove us...
    if (last==letter) {
      // Remove last item...
      if (!noOff) {
        //console.log("selectLetter=>REMOVE LAST");
        $selected.pop();
        $selected = $selected;   
      }
    } else if ($selected.indexOf(letter)==-1) {
      // Otherwise, if we aren't already in the list...
      if (!last || areTouching(letter,last)) {
        //console.log('Select letter ADD=>',letter)
        $selected = [...$selected, letter];      
      }
    } else if (!noCut) {      
      let idx = $selected.indexOf(letter);
      //console.log('SELECT LETTER CUT OFF AT',idx,letter)
      $selected = $selected.slice(0,idx+1)
    }
    return true;
  }  

  function resetSelected () {
    console.log('RESET!',$selected)
    let word = $selected;
    let wordString = toString(word)
    if (word.length > 1 && isWord(wordString)) {  
      score += scoreWord(wordString);
      $words = [...$words,word];
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

  let score = 0;

  function getTouchedLetter (e) {    
    for (let t of e.touches) {            
      let hovered = document.elementsFromPoint(t.pageX,t.pageY);
      for (let h of hovered) {
        for (let id in letterElements) {
          let el = letterElements[id];
          if (h==el) {            
            let hoveredLetter = $letters.find((l)=>l.id==id);            
            return hoveredLetter
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
      console.log(
        'New touch - already selected is',
        $selected.map((l)=>l.letter),
        '+',letter.letter,
        'initialTouchTarget=',initialTouchTarget.letter,
        'lastTouched=',lastTouched.letter
      )
      selectLetter(letter,true,false);
      lastTouched = letter;
      console.log(
        'Result: ',toString($selected)
      );
    }      
  }
  let changeIndex = 0;
  selected.subscribe(
    ($selected)=>{
      console.log('Change',changeIndex,'=>',
      toString($selected));
      changeIndex++
    }
  )

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
<div class="wrap" 
>  
  <TitleBar {score}/>
  <div class="center" on:click|stopPropagation>
    
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
    <div class="score-box">
      <WordScore interactive={true} word={toString($selected)}/>
      
    </div>
  </div>
  <WordList></WordList>
</div>

<style>
  :root {
    font-family:'Bild Variable Web',sans-serif;
  }
  .score-box {
    min-width: 80px;
    height: 1.5em;
    display: flex;
    justify-content: start;
  }  
  .center {
    margin-top: 36px;
  }
  @media screen and (width > 1000px) {
    :root {
      --block-width: calc(min(64px,12vw));
      --block-height: var(--block-width);
    }
  .center {    
    display: flex;
    justify-content: center;
    gap: 8px;
    align-items: center;
  }

  .wrap {
    width: 100vw;
    height: 100vh;
    position: fixed;
    overflow: hidden;
    top: 0;
    left: 0;
    display: grid;
    place-content: center;  
    
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
    .score-box {
      justify-content: center;
    }
    :root {
      --block-width : 13vw;
      --block-height: 13vw;
      
    }
    .wrap {
      width: 100vw;
      height: 100vh;
      position: fixed;
      overflow: hidden;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
  }

</style>
