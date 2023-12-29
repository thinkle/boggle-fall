<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  import { TreeNode } from "./trees";
  import { selected, type Letter } from "./stores";
  import { buildBaseScene, updateSceneForSelection } from "./hint2d";

  export let selectedLetters: Letter[] = [];
  export let stems: TreeNode[] = [];

  let canvasContainer: HTMLDivElement; // Reference to the div where the canvas will be added
  let canvas: HTMLCanvasElement;

  function buildScene(stems: TreeNode[]) {
    if (canvas) {
      canvas.width = 1200;
      canvas.height = 1200;
      let ctx = canvas.getContext("2d");
      if (ctx) {
        buildBaseScene(ctx, stems, selectedLetters);
      }
    }
  }
  function updateSelection(selectedLetters: Letter[]) {
    if (canvas) {
      let ctx = canvas.getContext("2d");
      if (ctx) {
        updateSceneForSelection(ctx, stems, selectedLetters);
      }
    }
  }
  $: console.log("Got stems", stems);

  $: if (canvas) buildScene(stems); // [stems[0], stems[1], stems[2]]);
  $: updateSelection(selectedLetters);
</script>

<div bind:this={canvasContainer} class="canvas-container">
  <canvas bind:this={canvas}></canvas>
</div>

<style>  
  .canvas-container canvas {
    --size: min(calc(100vw - 64px), 500px);
    width: var(--size);
    height: var(--size);
    position: fixed;
    bottom: 0; /*calc(-0.05 * var(--size));*/
    left: 0; /*calc(-0.3333 * var(--size));*/
    /* transform: rotate(45deg);
    transform-origin: bottom;
     */background-color: transparent;
    display: grid;
    place-content: end center;
    pointer-events: none;
    z-index: -1;
    filter: drop-shadow(-4px 8px 8px rgba(212, 212, 212, 0.5))
  }
</style>
