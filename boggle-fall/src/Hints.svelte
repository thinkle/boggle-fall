<script lang="ts">
  import { areTouching, gameOver, letters } from "./stores";
  import type {Letter} from './stores';
  import { isWord, findMatchingWords } from "./words";
  let words : string[] = [];

  function findWordsStartingWith (ltrs : Letter[], wordlist=null) {
    let result : string[] = [];
    let lastLetter = ltrs.at(-1);    
    if (!lastLetter) {      
      return [];
    }
    let wordStem = ltrs.map((l)=>l.letter).join('');        
    let lastIndex = $letters.indexOf(lastLetter);
    let lastRow = Math.floor(lastIndex / 5);
    let lastCol = lastIndex % 5;
    let possibleWords = findMatchingWords(wordStem,wordlist);    
    if (!possibleWords) {      
      return []
    }  
    if (possibleWords.includes(wordStem)) {
      result.push(wordStem);
    }
    // Imagine starting at letter 7...
    // `0 1 2 3 4
    //  5 6 7 8 9
    //  A B C D E
    //  F G H I J
    //  K L M N O`
    for (let offset of [  
      -6, // 7-1
      -5, // 7-2
      -4, // 7-3
      -1, // 7-6
      1, // 7-8
      4, // 7-B
      5, // 7-C
      6]) { // 7-D
        let idx = lastIndex + offset;
        let row = Math.floor(idx / 5);
        let col = idx % 5;
        // Make sure we're within one row and one col...
        // (if for example, we are in position 4, at the
        // edge, then some of our offsets, such as +6,
        // will be two rows away)
        if ((Math.abs(lastCol - col) <= 1) && (Math.abs(lastRow - row) <= 1)) {
          let neighbor = $letters[idx];
          // Make sure we haven't already used this letter...
          if (ltrs.indexOf(neighbor) == -1) {            
            result = [...result,...findWordsStartingWith([...ltrs,neighbor],possibleWords)]
          }
        }                
    }              
    return result;
  }

  function findWords ($letters : Letter[]) {
    words = []
    for (let ltr of $letters) {      
      words = [...words,...findWordsStartingWith([ltr])];      
    }
  }

  $: findWords($letters);

  let bigWords : string[];
  $: bigWords = words.filter((w)=>w.length>5);

  $: if (words.length==0) {
    $gameOver = true;
  }

  let allDone = false;
  let reallyDone = false;
  $: console.log(bigWords)
  let hint = ''
  function getHint () {
    let idx = Math.floor(Math.random()*words.length);
    hint = words[idx]
  }

  function doDoneReally () {
    allDone = false;
    $gameOver = true;
  }
</script>

<div>  
  
  {#if words.length==0} 
    <div class="pop-up">
      No more words!
    </div>
  {:else if allDone}
    <div class="pop-up">
      <h2>Done?</h2>
      <div>There are {words.length} words on this grid!</div>
      {#if bigWords.length}
        <div>And {bigWords.length} of them are 6 letters or longer!</div>
      {/if}
      {#if hint}
        For example, "{hint}"
        <button on:click={()=>hint=''}>&times;</button>
      {:else}
        <button on:click={getHint}>Show me a hint</button>
      {/if}
      <div>
        <button on:click={doDoneReally}>Still done</button>
        <button on:click={()=>{allDone=false}}>Nevermind</button>
      </div>
    </div>
  {:else}
    <button on:click={()=>allDone=true} class="small">
      ✓
    </button>
  {/if}  
</div>

<style>
  .pop-up {
    position: fixed;
    left: 50%;
    top: 50%;
    margin-top: -200px;
    margin-left: -200px;
    width: 400px;
    height: 400px;    
    background-color: #111a;
    overflow: auto;
    z-index: 999;   
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center; 
  }
  .small {
    font-size: small;
    background-color: inherit;
    border: 2px solid white;
    color: white;    
    display: grid;
    place-content: center;
    margin: 4px;
    padding: 4px;
    height: 18px;
    width: 18px;
    border-radius: 50%;
  }
  ul {
    max-height: 50px;
    overflow-y: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  li {
    list-style: none;
    margin: 4px;
  }
  
</style>