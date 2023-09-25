<script lang="ts">
  import Score from './Score.svelte';
  export let score : number;
</script>  
<div class="bar">
  <h1>Word-Fall</h1>
  <Score {score}></Score>
</div>

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

</style>

