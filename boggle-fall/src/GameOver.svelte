<script lang="ts">
  import WordTree from './WordTree.svelte';

  import { words, score, toLetters, bestGame, resetLetters, mode, startTime, timerDone, gameOver } from "./stores";
  import { scoreWord } from './words';
  
  function resetGame () {
    $words = [];
    $score = 0;
    $startTime = 0;
    $timerDone = false; 
    $gameOver = false;
    resetLetters();
  }

  
  let scores : {[key:string]:number}= {}
  let bestScore : number;
  $: {
    let bestWord = '';
    bestScore = -1;
    for (let w of $words) {
      let word = toLetters(w);
      scores[word] = scoreWord(word)
      if (scores[word] > bestScore) {
        bestWord = word;
        bestScore = scores[word];
      }
    }
  }

</script>
<div>
<h1>You scored {$score}</h1>
{#if $bestGame}<h2>Your high score is {$bestGame.score}</h2>{/if}
<button on:click={resetGame}>Play again?</button>
  {#if $mode=='Thirty-One Words' && $words.length==31}
    <WordTree min={1} max={31} {scores} {bestScore}></WordTree>
  {/if}
</div>
<style>
  div {
    text-align: center;
  }
  .tree {
    display: grid;
    grid-template-areas:
      "parent parent"
      "child1 child2";
  }
  .tree *:nth-child(1) {
    grid-area: parent;
  }
  .tree *:nth-child(2) {
    grid-area: child1;
  }
  .tree *:nth-child(3) {
    grid-area: child2;
  }
</style>
