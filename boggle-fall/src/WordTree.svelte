<script lang="ts">

  import Leaf from './Leaf.svelte';
  export let min : number;
  export let max : number;
  export let scores;
  export let bestScore;
  import { words, score, toLetters } from "./stores";
  let halfway = Math.ceil((max+min)/2);
  $: halfway = Math.ceil((max+min)/2);
</script>

<div class="tree">  
  <Leaf {bestScore} {scores} n={halfway}/>
  <div> <!-- left -->
    {#if halfway - min > 1}      
      <svelte:self {min} max={halfway-1} {scores} {bestScore}/>
    {:else}      
      <Leaf {bestScore} {scores}  n={min}/>
    {/if}
  </div>
  <div> <!-- right -->
    {#if max - halfway > 1 }      
      <svelte:self min={halfway+1} {max} {scores} {bestScore}/>
    {:else}      
      <Leaf {bestScore} {scores}  n={max}/>
    {/if}
  </div>
</div>



<style>
  .tree {
    /*display: grid;
    grid-template-areas:
      "parent parent"
      "child1 child2";      
      */
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
  .tree :global(*:nth-child(1)) {
    grid-area: parent;
    justify-self: center;
    flex-basis: 80%;
  }

  .tree :global(*:nth-child(2) *) {
    justify-self: end;    
  }
  .tree :global(*:nth-child(3) *) {
    justify-self: start;    
  }

  .tree :global(*:nth-child(2)) {
    grid-area: child1;  
    flex-basis: 40%;  
  }
  .tree :global(*:nth-child(3)) {
    grid-area: child2;    
    flex-basis: 40%;
  }
</style>

