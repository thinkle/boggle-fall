<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import Score from "./Score.svelte";
  
  import {
    words,
    mode,
    THIRTY1,
    FIFTEEN,
    TWO,
    INFINITE,
    SEVEN,
    hintModes,
    hintMode,
  } from "./stores";
  import Countdown from "./Countdown.svelte";
  import Hints from "./Hints.svelte";
  import {shorten} from './util';
  export let score: number;
  let info = false;
  let modes = [THIRTY1, FIFTEEN, SEVEN, TWO, INFINITE];

  let wordCount = 0;
  // little bits...
  let b1: boolean, b2: boolean, b4: boolean, b8: boolean, b16: boolean;
  $: count = $words.length;
  $: {
    b1 = (count & 1) !== 0;
    b2 = (count & 2) !== 0;
    b4 = (count & 4) !== 0;
    b8 = (count & 8) !== 0;
    b16 = (count & 16) !== 0;
  }
  let innerWidth = 0;

  function maybeShorten (word: string, innerWidth: number) {
    console.log('Shorten?',word,innerWidth)
    if (innerWidth < 600) {
      return shorten(word, 8);
    } else {
      return word;
    }
  }
</script>

<div
  class="bar"
  bind:clientWidth={innerWidth}
  on:mouseup|stopPropagation
  on:click|stopPropagation
  on:keydown|stopPropagation
>
  <button on:click={() => (info = !info)}>?</button>
  <select bind:value={$mode}>
    {#each modes as m}
      <option value={m}>{maybeShorten(m,innerWidth)}</option>
    {/each}
  </select>  
  <div class="horiz">    
    <select bind:value={$hintMode}>
      {#each hintModes as m}
        <option value={m.value}>{maybeShorten(m.label,innerWidth)}</option>
      {/each}
    </select>
    <Hints />
    {#if $mode == THIRTY1}
      <div class="bit" class:active={b16}></div>
    {/if}
    {#if $mode == THIRTY1 || $mode == FIFTEEN}
      <div class="bit" class:active={b8}></div>
    {/if}
    {#if $mode == THIRTY1 || $mode == FIFTEEN || $mode == SEVEN}
      <div class="bit" class:active={b4}></div>
      <div class="bit" class:active={b2}></div>
      <div class="bit" class:active={b1}></div>
    {/if}
    {#if $mode == "Two Minutes!"}
      <Countdown />
    {/if}
    <Score {score}></Score>
  </div>
</div>
{#if info}
  <div class="info" in:fly={{ x: -300 }} out:fade>
    <h2>
      How many points
      <br />can you rack up
      <br />in just
      {#if $mode == "Thirty-One Words"}
        thirty-one words?
      {:else if $mode == "Fifteen Words"}
        fifteen words?
      {:else if $mode == "Two Minutes!"}
        two minutes?
      {:else}
        {$mode} ???
      {/if}
    </h2>
    <p>Swipe to make words by connecting adjacent letters.</p>
    <p>Longer words and rarer letters get you more points.</p>
    <p>
      After you use letters, they fall into your word list and new letters fall
      into their place.
    </p>
    <h2>Hints</h2>
    <p>
      The bouquet of flowers is a map of all the words available on the board.
      The bigger the flower, the higher scoring the word. The longer the stem,
      the longer the word.</p>
    <p>In regular hint mode, you'll see your word highlighted in the bouquet.</p>
    <p>In easy hint mode, you'll see all the words you can make with the letters
      you've selected highlighted in the bouquet.</p>
    <button on:click={() => (info = false)}>Got it!</button>
  </div>
{/if}

<style>
  .bar {
    height: 32px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: var(--theme-color, #0c8405);
    color: var(--theme-bg, white);
    width: 100%;
  }
  h1 {
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: auto;
    margin-inline-end: auto;
    font-size: 28px;
    font-weight: 300;
    font-variation-settings: "XHGT" 60;
  }

  button {
    background: transparent;
    border: none;
    color: inherit;
    display: grid;
    place-content: center;
    height: 28px;
    width: 28px;
  }

  .info {
    text-align: left;
    margin-left: auto;
    margin-right: auto;
    background-color: white;
    top: 32px;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    position: absolute;
    z-index: 99;
    padding: 2em;
  }
  .info p {
    max-width: 15em;
    margin: auto;
    line-height: 1.4;
    margin-bottom: 1em;
  }
  h2 {
    text-align: center;
    line-height: 1.1;
  }

  .info button {
    background-color: var(--theme-color, #0c8405);
    color: white;
    padding: 8px;
    width: auto;
    margin: auto;
  }
  button:hover {
    border: 2px solid white;
  }

  .bit {
    border: 2px solid white;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    display: inline-block;
    transition: background-color 300ms;
  }

  .bit.active {
    background-color: white;
  }

  .horiz {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  select {
    border: none;
    background-color: inherit;
    color: inherit;
    line-height: 1.2;
    text-align: center;
    font-size: 1.2rem;
    font-weight: bold;
  }
 
</style>
