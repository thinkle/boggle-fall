<script lang="ts">
  export let interactive = false;
  export let word : string;
  import { getMultiplier, isWord, scoreWord } from './words';   
  let multiplier : number = 1;
  let score = 0;
  $: score = scoreWord(word);

  let multiplierString : string;
  $: multiplier = getMultiplier(word);
  $: multiplierString = getMultiplierString(multiplier);

  function getMultiplierString (multiplier : number) {
    if (multiplier == 0.5) {
      return '½';
    } else if (multiplier < 2) {
      let additional = multiplier - 1;
      let percent = additional * 100;
      return `+${percent}%`
    } else {
      return `×${multiplier}`
    }
  }
</script>
{#if word}
{#if interactive}
<div class="word" class:is-word={isWord(word)}>
  {word}
</div>
{/if}
<div class="word-score">
  {score}
  {#if multiplier != 1}
    <span class="multiplier">
      {multiplierString}
    </span>
  {/if}
</div>
{/if}


<style>
  .word {
    color: grey;
  }
  .word.is-word {
    color: black;
    font-weight: bold;
    text-decoration: underline;
    text-decoration-color: green;
  }
  .multiplier {
    position: absolute;
    left: 2em;
    top: -0.5em;
    font-size: x-small;
    animation-delay: 500ms;
    animation: pop-in 1s;
  }
  .word-score {
    position: relative;
    display: grid;
    place-content: center;
    font-weight: bold;
    border-radius: 50%;
    border: 1px solid pink;
    width: 18px;
    height: 18px;
  }
  @keyframes pop-in {
    0% {
      transform: scale(0)translate(-100px,-50px);
    }
    80% {
      transform: scale(1.1)translate(2px,2px)
    }
    100% {
      transform: scale(1)translate(0,0);
    }
  }
</style>

