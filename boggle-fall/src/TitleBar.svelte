<script lang="ts">
  export let score : number;
</script>  
<div class="bar">
  <h1>Word-Fall</h1>
  <div class="score">{score}</div>
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
  }
  .score {
    padding: 4px;
    font-weight: bold;
    font-size: 24px;
  }

</style>

