<script lang="ts">  
  export let lastScoreGap: number;
  export let score : number;
  export let word : string;
  let percentage = score/(score+lastScoreGap);
  $: percentage = score/(score+lastScoreGap);
</script>

{#key lastScoreGap}
  <div class="halo" style:--percentage={percentage}>
    {#if lastScoreGap == 0}
      <div class="congrats">Best Word!</div>
    {:else if percentage > 0.85}
      <div>Not bad!</div>
    {:else if score > 31 && percentage > 0.51}
      <div>Nice one!</div>
    {:else if score > 15 && percentage > 0.34}
      <div>Alright!</div>
    {/if}
  </div>
{/key}

<style>
  .halo {
    
    width: 75px;
    font-size: 10px;
    z-index: 90;
    -pointer-events: none;
    animation: pop-in 2s;
    filter: drop-shadow(3px 3px var(--highlight, var(--shadow)));
    font-size: 1.2rem;
    text-align: center;
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  @keyframes pop-in {
    0% {      
      translate: 5px -100px -100px;
      scale: 0.5;
      opacity: 0;
      animation-timing-function: ease-in;
    }
    25% {      
      translate: 10px 10px 20px;
      opacity: 1;
      scale: 1.1;
      animation-timing-function: ease-in-out;
    }    
    35% {      
      translate: 0 0 0;
      scale: 1;
      opacity: 1;
      animation-timing-function: ease-in-out;
    }
    90% {
      opacity: 1;
    }
  }

  .halo div {
    border-bottom: 3px solid var(--off-black);
    margin-bottom: 6px;
  }
  .halo div::after {
    content: ' ';
    width: calc(var(--percentage)*100%);
    border-bottom: 3px solid var(--v8-bg);
    display: block;
    position: relative;
    top: 6px;    
  }
</style>
