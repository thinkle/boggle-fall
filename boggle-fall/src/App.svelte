<script lang="ts">
  
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
<div class="wrap" on:click={resetSelected}
  on:touchstart={onTouchStart}
  on:touchend={onTouchEnd}
  on:touchmove={onTouchMove}
>
  
  <div class="center" on:click|stopPropagation>
    <div class="total-box">
      Score: {score}
    </div>
    <main bind:this={grid}
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
  <div style="max-height:600px">
    Words:
    <ol>
      {#each $words as word, n}
        <li in:fly={{y:-50}}>{n+1}. 
          {#each word as letter (letter.id)}
            <div 
               animate:flip
               in:receive={{key:letter.id,duration:1000}} 
               out:send={{key:letter.id,duration:1000}}>
              <LetterBlock letter={letter.letter} selected={n==$words.length-1}></LetterBlock>
            </div>
          {/each}
          <WordScore word={toString(word)}></WordScore>
        </li>
      {/each}
    </ol>
  </div>
</div>

<style>
  .score-box {
    width: 80px;
  }
  .total-box {
    width: 80px;
  }
  @media screen and (width > 1000px) {
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
  .target {
    width: 16px;
    height: 16px;    
    position: absolute;
    left: 8px;
    top: 8px;
  }
  
  main {
    margin: auto;
    user-select: none;
    
    display: grid;
    gap: 8px;
    grid-template-columns: auto auto auto auto auto;
    position: relative;
  }
  li {
    display: flex;
    flex-direction: row;
    gap: 2px;
  }
  ol {
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
  .word-score {
    display: grid;
    place-content: center;
    font-weight: bold;
    border-radius: 50%;
    border: 1px solid pink;
    width: 18px;
    height: 18px;
  }

  @media screen and (width < 800px) {
    :root {
      --block-width : 15vw;
      --block-height: 15vw;
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
