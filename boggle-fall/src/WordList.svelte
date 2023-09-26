<script lang="ts">  
  import WordScore from './WordScore.svelte';  
  import LetterBlock from './lib/LetterBlock.svelte'
  import {send,receive} from './transition';
  import {words, toLetters } from './stores';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';      
</script>

<div class="words">
    <hr>
    <ol>
      {#each $words as word, n}
        <li in:fly={{y:-50}}>{n+1}. 
          {#each word as letter (letter.id)}
            <div 
               animate:flip
               in:receive={{key:letter.id,duration:1000}} 
               out:send={{key:letter.id,duration:1000}}>
              <LetterBlock letter={letter.letter} selected={n==$words.length-1}></LetterBlock>
            </div>
          {/each}
          <WordScore word={toLetters(word)}></WordScore>
        </li>
      {/each}
    </ol>
  </div>

<style>
  div.words {
    --block-width: calc(0.7*var(--block-width));
    --block-height: var(--block-width);
    min-height: 200px;
    max-height: calc(100vh - var(--block-height)*6);
    overflow: scroll;
    max-width: calc(100vw - var(--block-width));    
  }
  
  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    max-width: calc(100vw - 16px);    
    flex-direction: row;
    gap: 2px;
    justify-content: start;
  }
  ol {
    display: flex;
    flex-direction: column-reverse;
    gap: 8px;
    padding: 0;
  }

</style>

