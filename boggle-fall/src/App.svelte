<script lang="ts">
  import GameOver from "./GameOver.svelte";
  import GameGrid from "./GameGrid.svelte";
  import "./assets/fonts.css";
  import TitleBar from "./TitleBar.svelte";
  import WordList from "./WordList.svelte";
  import WordScore from "./WordScore.svelte";
  import EffectCanvas from "./EffectCanvas.svelte";
  import LetterBlock from "./lib/LetterBlock.svelte";
  import { send, receive } from "./transition";
  import {
    selected,
    letterTrees,
    words,
    score,
    toLetters,
    gameHistory,
    timerDone,
    mode,
    startTime,
    gameOver,
    hintMode,
    prng,
  } from "./stores";
  import HintTree2D from "./HintTree2D.svelte";

  function saveGame() {
    $gameOver = true;
    $gameHistory = [
      ...$gameHistory,
      {
        words: $words.map(toLetters),
        score: $score,
        date: new Date(),
        mode: $mode,
        seed: prng.getSeed(),
        seedMode: prng.mode,
      },
    ];
    $selected = [];
  }

  $: if (
    ($mode == "Thirty-One Words" && $words.length == 31) ||
    ($mode == "Fifteen Words" && $words.length == 15) ||
    ($mode == "Seven Words" && $words.length == 7)
  ) {
    saveGame();
    $gameOver = true;
  } else if ($mode == "Two Minutes!" && $timerDone) {
    saveGame();
    $gameOver = true;
  } else if ($gameOver) {
    saveGame();
  }
</script>

<div class="wrap">
  <TitleBar score={$score} />
  <div class="center" on:click|stopPropagation>
    {#if !$gameOver}
      <GameGrid autoFinishMode={$mode == "Two Minutes!"}></GameGrid>
      {#if $hintMode != "none"}
        <HintTree2D
          stems={Array.from($letterTrees.values())}
          selectedLetters={$selected}
        />
      {/if}
    {:else}
      <GameOver></GameOver>
    {/if}
    <div class="score-box">
      <WordScore interactive={true} word={toLetters($selected)} />
    </div>
  </div>
  <WordList></WordList>
</div>

<style>
  :root {
    font-family: "Bild Variable Web", sans-serif;
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

  main {
    margin: auto;
    user-select: none;
    display: grid;
    gap: 8px;
    grid-template-columns: auto auto auto auto auto;
    position: relative;
  }

  /* Mobile */

  .score-box {
    justify-content: center;
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
</style>
