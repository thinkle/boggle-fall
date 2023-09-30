<script lang="ts">
  import { letterValues } from "../words";
  export let letter : string;
  export let selected : boolean
  let score : number = 0;
  $: score = letterValues[letter];  

</script>

<div class="letter-block" 
  class:value1={score === 1}
  class:value2={score === 2}
  class:value3={score === 3}
  class:value4={score === 4}
  class:value5={score === 5}
  class:value6={score === 6}
  class:value7={score === 7}
  class:value8={score === 8}
  class:value9={score === 9}
  class:value10={score === 10}
  class:selected>
  {letter.toLocaleUpperCase()}
  <div class="letter-score">
    {score}
  </div>
</div>  

<style>
  .letter-score {
    position: absolute;
    bottom: 4px;
    right: 4px;
    font-size: x-small;
    font-weight: 300;
  }
  .selected {
    filter: brightness(1.1)drop-shadow(2px 4px 6px black);
  }
  div.letter-block {
    position: relative;
    user-select: none;
    box-sizing: border-box;
    width: var(--block-width,32px);
    height: var(--block-height,32px);    
    border-radius: var(--block-radius,8px);
    display: grid;
    place-content: center;
    font-size: var(--block-font-size,24px);
    font-weight: 500;   
    border-style: solid;
    border-width: 1px; 
  }

  /* CSS Code */

  .value1 {
  color: var(--v1-fg);
  background-color: var(--v1-bg);
  border-color: var(--v1-border);
}

.value2 {
  color: var(--v2-fg);
  background-color: var(--v2-bg);
  border-color: var(--v2-border);
}

.value3 {
  color: var(--v3-fg);
  background-color: var(--v3-bg);
  border-color: var(--v3-border);
}

.value4 {
  color: var(--v4-fg);
  background-color: var(--v4-bg);
  border-color: var(--v4-border);
}

.value5 {
  color: var(--v5-fg);
  background-color: var(--v5-bg);
  border-color: var(--v5-border);
}

.value6 {
  color: var(--v6-fg);
  background-color: var(--v6-bg);
  border-color: var(--v6-border);
}

.value7 {
  color: var(--v7-fg);
  background-color: var(--v7-bg);
  border-color: var(--v7-border);
}

.value8 {
  color: var(--v8-fg);
  background-color: var(--v8-bg);
  border-color: var(--v8-border);
}

.value9 {
  color: var(--v9-fg);
  background-color: var(--v9-bg);
  border-color: var(--v9-border);
}

.value10 {
  color: var(--v10-fg);
  background-color: var(--v10-bg);
  border-color: var(--v10-border);
}

</style>
