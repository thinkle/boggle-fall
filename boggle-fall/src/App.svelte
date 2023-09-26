<script lang="ts">
  import GameOver from './GameOver.svelte';

  import GameGrid from './GameGrid.svelte';

  import './assets/fonts.css'
  import TitleBar from './TitleBar.svelte';
  import WordList from './WordList.svelte';
  import WordScore from './WordScore.svelte';
  import EffectCanvas from './EffectCanvas.svelte';    
  import LetterBlock from './lib/LetterBlock.svelte'
  import {send,receive} from './transition';
  import { selected, words, score, toLetters, gameHistory } from './stores';
  
  let gameOver = false;
  $: if ($words.length == 31) {
    gameOver = true;
    $gameHistory = [
      ...$gameHistory,
      {
        words : $words.map(toLetters),
        score : $score,
        date : new Date()
      }
    ]
  } else {
    gameOver = false;
  }
  

</script>
<div class="wrap" 
>  
  <TitleBar score={$score}/>
  <div class="center" on:click|stopPropagation>    
    {#if !gameOver}
      <GameGrid></GameGrid> 
    {:else}
      <GameOver></GameOver>
    {/if}
    <div class="score-box">
      <WordScore interactive={true} word={toLetters($selected)}/>      
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
