<script lang="ts">
  import { onMount } from "svelte";

  export let parent : HTMLDivElement;
  export let selectedElements : HTMLDivElement[]
  let canvas : HTMLCanvasElement;
  let ctx : CanvasRenderingContext2D;
  
  onMount(
    ()=>{
      ctx = canvas.getContext('2d');
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        canvas.style.width = parent.clientWidth + 'px';
        canvas.style.height = parent.clientHeight + 'px';
      }     
    }
  );

  $: if (parent && canvas) {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    canvas.style.width = parent.clientWidth + 'px';
    canvas.style.height = parent.clientHeight + 'px';   
  }

  function drawConnections (elements : HTMLDivElement[]) {
    if (ctx) {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.beginPath();
      let started;
      for (let e of elements) {        
        let x = e.offsetLeft + e.clientWidth/2;
        let y = e.offsetTop + e.clientHeight/2;
        if (!started) {
          ctx.moveTo(x,y);
          started = true;          
        } else {
          ctx.lineTo(x,y);          
        }
        
      }
      ctx.stroke();
    }
  }

  $: drawConnections(selectedElements)

</script>

<canvas bind:this={canvas}></canvas>

<style>
 
  canvas {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>

