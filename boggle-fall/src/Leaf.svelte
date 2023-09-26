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
  --size : 22px;
  --pad: 8px;
  --badge: 16px;
  font-size: var(--size);
  white-space: nowrap;
  padding: var(--pad);
  border: 1px solid var(--score-color);
  border-radius: var(--pad);
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
    top: calc(-1*var(--badge));
    right: calc(-1*var(--badge));
    border-radius: 50%;
    width:  calc(1.125*var(--badge,16px));
    height: calc(1.125*var(--badge,16px));
    font-size: var(--badge,16px);
    font-weight: bold;
    display: grid;
    place-content: center;
    background-color: var(--score-color);    
  }

  @media screen and (width < 1000px) {
    div {
      --badge: 14px;
      --size: 18px;
      --pad: 4px;
    }
  }
  @media screen and (width < 600px) {
    div {
      --badge: 12px;
      --size: 16px;
      --pad: 3px;
    }
  }
</style>

