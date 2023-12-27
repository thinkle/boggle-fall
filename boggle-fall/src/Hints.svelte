<script lang="ts">
  import { areTouching, bestCurrentScore, gameOver, letters } from "./stores";
  import type { Letter } from "./stores";
  import { selected, letterTrees } from "./stores";
  import { isWord, findMatchingWords, scoreWord } from "./words";
  import { TreeNode } from "./trees";
  import HintTree from "./HintTree2D.svelte";
  let words: string[] = [];

  $letterTrees = new Map<Letter, TreeNode>();

  function findWordsStartingWith(ltrs: Letter[], wordlist = null) {
    let result: string[] = [];
    let lastLetter = ltrs.at(-1);
    if (!lastLetter) {
      return [];
    }
    let wordStem = ltrs.map((l) => l.letter).join("");
    let lastIndex = $letters.indexOf(lastLetter);
    let lastRow = Math.floor(lastIndex / 5);
    let lastCol = lastIndex % 5;
    let possibleWords = findMatchingWords(wordStem, wordlist);
    if (!possibleWords) {
      return [];
    }
    if (possibleWords.includes(wordStem)) {
      // Make sure this word is on our tree!
      // First letter...
      let previousNode: TreeNode | undefined = $letterTrees.get(ltrs[0]);
      if (previousNode === undefined) {
        previousNode = new TreeNode(ltrs[0]);
        $letterTrees.set(ltrs[0], previousNode);
      }
      for (let i = 1; i < ltrs.length; i++) {
        let nextLetter = ltrs[i];
        let nextNode: TreeNode | undefined = previousNode.children.find(
          (n) => n.letter == nextLetter
        );
        if (!nextNode) {
          nextNode = new TreeNode(nextLetter, previousNode);
          previousNode.addChild(nextNode);
        }
        previousNode = nextNode;
      }
      // Mark this node as a complete word
      previousNode.isCompleteWord = true;
      previousNode.score = scoreWord(wordStem);
      result.push(wordStem);
    }
    // Imagine starting at letter 7...
    // `0 1 2 3 4
    //  5 6 7 8 9
    //  A B C D E
    //  F G H I J
    //  K L M N O`
    for (let offset of [
      -6, // 7-1
      -5, // 7-2
      -4, // 7-3
      -1, // 7-6
      1, // 7-8
      4, // 7-B
      5, // 7-C
      6,
    ]) {
      // 7-D
      let idx = lastIndex + offset;
      let row = Math.floor(idx / 5);
      let col = idx % 5;
      // Make sure we're within one row and one col...
      // (if for example, we are in position 4, at the
      // edge, then some of our offsets, such as +6,
      // will be two rows away)
      if (Math.abs(lastCol - col) <= 1 && Math.abs(lastRow - row) <= 1) {
        let neighbor = $letters[idx];
        // Make sure we haven't already used this letter...
        if (ltrs.indexOf(neighbor) == -1) {
          result = [
            ...result,
            ...findWordsStartingWith([...ltrs, neighbor], possibleWords),
          ];
        }
      }
    }
    return result;
  }

  function findWords($letters: Letter[]) {
    words = [];
    // empty out letterTrees map
    $letterTrees.clear();
    $letterTrees = $letterTrees;
    for (let ltr of $letters) {
      words = [...words, ...findWordsStartingWith([ltr])];
    }
    // Unique
    words = words.filter((v, i) => words.indexOf(v) == i);
    let scores = words.map(scoreWord);
    highest = Math.max(...scores);
    $bestCurrentScore = highest;
    let nodes = [];
    for (let [letter, node] of $letterTrees) {
      nodes.push(node);
    }

    console.log(
      "!!!Best word is worth",
      highest,
      "=>",
      words[scores.indexOf(highest)]
    );
    hint = "";
  }

  $: findWords($letters);

  let bigWords: string[];
  $: bigWords = words.filter((w) => w.length > 5);

  $: if (words.length == 0) {
    $gameOver = true;
  }

  let allDone = false;
  let reallyDone = false;
  let highest: number;
  let hint = "";

  function getHint() {
    let scores = words.map(scoreWord);
    highest = Math.max(...scores);
    let highestWord = words[scores.indexOf(highest)];
    let idx = Math.floor(Math.random() * words.length);
    hint = words[idx];
  }

  function doDoneReally() {
    allDone = false;

    $gameOver = true;
  }
  $: {
    console.log("Words:", words);
    console.log("Big words:", bigWords);
  }
</script>

<div>
  {#if words.length == 0}
    <div class="pop-up">No more words!</div>
  {:else if allDone}
    <div class="pop-up">
      <button class="close" on:click={() => (allDone = false)}>&times;</button>
      <h2>Done Playing?</h2>
      <div>There are {words.length} words on this grid!</div>
      {#if bigWords.length}
        <div>And {bigWords.length} of them are 6 letters or longer!</div>
      {/if}
      {#if hint}
        <div on:click={() => (hint = "")}>
          One word is {hint.length} letters long, starts with a "{hint[0]}," and
          is worth {scoreWord(hint)} points.
        </div>
        <div>
          The highest-scoring word on the board is worth
          <b>{highest}</b> points.
        </div>
      {:else}
        <button on:click={getHint}>Show me a hint</button>
      {/if}
      <div style="display:flex;gap:32px">
        <button on:click={doDoneReally}>End Game</button>
        <button
          on:click={() => {
            allDone = false;
          }}>Keep Playing</button
        >
      </div>
    </div>
  {:else}
    <button on:click={() => (allDone = true)} class="small"> ✓ </button>
  {/if}
</div>

<style>
  .close {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 1em;
    height: 1em;
    display: grid;
    place-content: center;
    border-radius: 50%;
  }
  .pop-up > div {
    width: 100%;
  }
  .pop-up {
    --width: calc(min(400px, 90vw));
    font-size: large;
    position: fixed;
    left: 50%;
    top: 50%;
    box-sizing: border-box;
    margin-top: calc(var(--width) / -2);
    margin-left: calc(var(--width) / -2);
    padding: 42px;
    width: var(--width);
    min-height: var(--width);
    gap: 8px;
    background-color: green;
    overflow: auto;
    z-index: 999;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
  .small {
    font-size: small;
    background-color: inherit;
    border: 2px solid white;
    color: white;
    display: grid;
    place-content: center;
    margin: 4px;
    padding: 4px;
    height: 18px;
    width: 18px;
    border-radius: 50%;
  }
  ul {
    max-height: 50px;
    overflow-y: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  li {
    list-style: none;
    margin: 4px;
  }
</style>
