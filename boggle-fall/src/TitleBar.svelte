<script lang="ts">
  import { fade, fly } from 'svelte/transition';  
  import Score from './Score.svelte';
  import { words } from './stores';
  export let score : number;
  let info = false;
  
  let wordCount = 0;
  // little bits...
  let b1,b2,b4,b8,b16;
  $: count = $words.length;
  $: {
    b1 = (count & 1) !== 0;
    b2 = (count & 2) !== 0;
    b4 = (count & 4) !== 0;
    b8 = (count & 8) !== 0;
    b16 = (count & 16) !== 0;
  }

</script>  
<div class="bar">
  <button on:click={()=>info=!info}>?</button>
  <h1>Thirty-One Words</h1>
  <div class="horiz">
    <div class="bit" class:active={b16}></div>
    <div class="bit" class:active={b8}></div>
    <div class="bit" class:active={b4}></div>
    <div class="bit" class:active={b2}></div>
    <div class="bit" class:active={b1}></div>
    <Score {score}></Score>
  </div>
</div>
{#if info}
  <div class="info" in:fly={{x:-300}} out:fade>
    <h2>How many points
      <br>can you rack up
      <br>in just thirty-one words?
    </h2>
    <p>Swipe to make words by connecting adjacent letters.</p>
    <p>Longer words and
    rarer letters get you more points.</p>
    <p>After you use letters, they fall into your word
      list and new letters fall into their place.
    </p>
    <button on:click={()=>info=false}>Got it!</button>
  </div>
{/if}

<style>
  .bar {
    height: 32px;    
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: var(--theme-color,#0c8405);
    color: var(--theme-bg,white);
    position: fixed;
    top: 0;
    width: 100%;
  }
  h1 {
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: auto;
    margin-inline-end: auto;
    font-size: 28px;
    font-weight: 300;
    font-variation-settings: 'XHGT' 60;
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
    margin-top: 3em;
    text-align: left;
    margin-left: auto;
    margin-right: auto;
    max-width: 15em;
  }
  h2 {
    text-align: center;
    line-height: 1.1;
  }

  .info button {    
    background-color: blue;
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
</style>

