<script lang='ts'>
  import { onDestroy } from 'svelte';
  import {startTime, timerDone} from './stores';

  let minutes = 2;
  let seconds = 0;
  let interval : any;

  function getTimes () {
    if (!$startTime) {
      minutes = 2;
      seconds = 0;
      return;
    }
    let now = new Date().getTime();
    let elapsed = now - $startTime;
    let elapsedSeconds = Math.floor(elapsed / 1000);
    let remainingSeconds = 20 - elapsedSeconds;
    if (remainingSeconds < 0) {
      minutes = 0;
      seconds = 0;
      $timerDone = true;
    } else {
      minutes = Math.floor(remainingSeconds / 60);
      seconds = remainingSeconds % 60;
    }
  }

  $: if ($startTime) {
    getTimes();
    interval = setInterval(getTimes,300)
  }

  onDestroy(
    ()=>{
      if (interval) {
        clearInterval(interval);
      }
    }
  )

  function zeroPad (n : number) {
    let s = n.toString();
    if (s.length==1) {
      return '0'+s;
    } else {
      return s;
    }

  }


</script>
<div>
  {minutes}:{zeroPad(seconds)}
</div>
