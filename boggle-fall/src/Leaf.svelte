<script lang="ts">
  export let n : number;
  export let scores : {[key:string]:number};
  export let bestScore : number;
  let word : string;
  $: word = toLetters($words[n-1]);
  import { words, toLetters } from "./stores";
  let jauntyAngle = `${Math.random() * 10 - 5}deg`

</script>

<div style:--angle={jauntyAngle}  
  class:good={scores[word]>15}
  class:great={scores[word]>30}
  class:best={scores[word]==bestScore}
>
  {word.toLocaleUpperCase()}
  {#if scores[word]==bestScore || scores[word]>15}
  <div class="score-badge">
    {scores[word]}
  </div>
  {/if}
</div>

<style>
  
 div {  
  white-space: nowrap;
  padding: 8px;
  border: 1px solid var(--score-color);
  border-radius: 8px;
  align-self: center;
  justify-self: center;
  transform: rotate(var(--angle));
  position: relative;  
 }
 .good {
  --score-color: green;
 }
 .great {
  --score-color: orange;
 }

  .best {
    --score-color: orange;
    background-color: var(--gold,#ffcf8a);
  }
  .score-badge {
    position: absolute;
    transform: rotate(-17deg);
    top: -18px;
    right: -18px;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 16px;
    font-weight: bold;
    display: grid;
    place-content: center;
    background-color: var(--score-color);

  }
</style>

