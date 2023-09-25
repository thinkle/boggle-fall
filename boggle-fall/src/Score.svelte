<script lang="ts">
  import { fly } from "svelte/transition";
  export let score : number;
 
  
</script>

<div class="score">
  {#key score}
    <div class="echo">
      {score}
    </div>
    <div class="number" in:fly={{y:-70}} out:fly={{y:100}}>
      {score}
    </div>
  {/key}
</div>

<style>
  .echo {
    opacity: 0;
  }
  .number {
    position: absolute;
    top: 4px;
  }
  
  .score {
    padding: 4px;
    font-weight: bold;
    font-size: 24px;
    position: relative;
  }

</style>

