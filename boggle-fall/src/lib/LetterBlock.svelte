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
</div>  

<style>
  .selected {
    filter: brightness(1.1)drop-shadow(2px 4px 6px black);
  }
  div {
    user-select: none;
    box-sizing: border-box;
    width: var(--block-width,32px);
    height: var(--block-height,32px);
    border: var(--block-border,3px solid #333);
    border-radius: var(--block-radius,8px);
    display: grid;
    place-content: center;
    font-size: var(--block-font-size,24px);
    font-weight: 500;
  }

  /* CSS Code */
.value1 {
  background-color: #F2F2F2; /* Light gray */
  border-color: #D1D1D1;
  color: #333333;
}

.value2 {
  background-color: #999999; /* gray */
  border-color: #B0B0B0;
  color: #333333;
}

.value3 {
  background-color: #9fced9; /* Light blue */
  border-color: #174e97;
  color: #333333;
}

.value4 {
  background-color: #1986e5; /* Blue */
  border-color: #FFA500;
  color: #FFFFFF;
}

.value5 {
  background-color: #FFA500; /* Orange */
  border-color: #FF7F00;
  color: #333333;
}

.value6 {
  background-color: #FF7F00; /* Darker Orange */
  border-color: #FF6600;
  color: #333333;
}

.value7 {
  background-color: #FF6347; /* Tomato */
  border-color: #FF4500;
  color: #FFFFFF;
}

.value8 {
  background-color: #FF4500; /* Darker Red-Orange */
  border-color: #FF3300;
  color: #FFFFFF;
}

.value9 {
  background-color: #FF0000; /* Red */
  border-color: #CC0000;
  color: #FFFFFF;
}

.value10 {
  background-color: #FFD700; /* Gold */
  border-color: #FFA500;
  color: #FFFFFF;
  /* You can add additional styles here, such as shadow or animation for value 10 */
}

</style>
