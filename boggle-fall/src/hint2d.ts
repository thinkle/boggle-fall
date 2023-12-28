import type { TreeNode } from "./trees";
import { hintMode, type Letter } from "./stores";
import { get } from "svelte/store";

const W = 1200;
const H = 1200;
const UP = -90;
const WIGGLE = 60; // random wiggle of initial branches...
const BRANCH_SPREAD = 60; // degrees
const INACTIVE_COLOR = "#44774023";
const ACTIVE_COLOR = "#007730";
const INACTIVE_FLOWER = "#ff88aa20";
const ACTIVE_FLOWER = "#ff4488";

function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  selected: boolean = false
) {
  // basically, draw a "daisy" like flower as a series of loops centering around x,y with size...
  ctx.beginPath();
  if (selected) {
    ctx.fillStyle = ACTIVE_FLOWER;
  } else {
    ctx.fillStyle = INACTIVE_FLOWER;
  }
  // Fix me...
  const petalCount = 8; // Number of petals
  const petalLength = size; // Length of each petal
  const petalWidth = size / 4; // Width of each petal

  // Draw petals
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * 2 * Math.PI; // Angle of the petal
    const petalX = x + Math.cos(angle) * petalLength;
    const petalY = y + Math.sin(angle) * petalLength;

    ctx.beginPath();
    ctx.ellipse(petalX, petalY, petalLength, petalWidth, angle, 0, 2 * Math.PI);
    if (selected) {
      ctx.fillStyle = ACTIVE_FLOWER;
    } else {
      ctx.fillStyle = INACTIVE_FLOWER;
    }
    ctx.fill();
  }
  // Finish by drawing the center of the flower...
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
  if (selected) {
    ctx.fillStyle = "brown";
  } else {
    ctx.fillStyle = INACTIVE_FLOWER;
  }
  ctx.fill();
}

/* Draw a line from x,y in direction angle in degrees. Return end point. */
function drawLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleInDegrees: number,
  distance = 100
): [number, number] {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  let ex = x + distance * Math.cos(angleInRadians);
  let ey = y + distance * Math.sin(angleInRadians);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  return [ex, ey];
}

export function buildBaseScene(
  ctx: CanvasRenderingContext2D,
  stems: TreeNode[],
  selectedLetters: Letter[]
) {
  ctx.lineWidth = 5;
  for (let i = 0; i < stems.length; i++) {
    let stem = stems[i];
    let offset = 100 / stems.length;
    buildBranch(
      ctx,
      selectedLetters,
      stem,
      W / 2 - 50 + offset * i,
      H - 100,
      UP - WIGGLE / 2 + Math.random() * WIGGLE,
      0,
      stem.letter === selectedLetters[0]
    );
  }
}

function buildBranch(
  ctx: CanvasRenderingContext2D,
  selectedLetters: Letter[],
  stem: TreeNode,
  x: number,
  y: number,
  angle: number,
  depth: number,
  maybeSelected: boolean
) {
  let selected = maybeSelected;
  let $hintMode = get(hintMode);
  if (maybeSelected) {
    if ($hintMode == "none") {
      selected = false;
    }
    // If there are more letters selected than our depth...
    if ($hintMode == "complete") {
      if (selectedLetters.length > depth) {
        // If we are definitely selected
        // (i.e. up to our depth is selected and only that, then good!)
        selected = true;
      } else {
        selected = false;
      }
    } else if ($hintMode == "stems") {
      selected = maybeSelected;
    }
  }

  if (selected) {
    ctx.strokeStyle = ACTIVE_COLOR;
  } else {
    ctx.strokeStyle = INACTIVE_COLOR;
  }
  let length = 20;
  let ex: number;
  let ey: number;
  if (stem.sx && stem.sy && stem.ex && stem.ey) {
    ctx.beginPath();
    ctx.moveTo(stem.sx, stem.sy);
    ctx.lineTo(stem.ex, stem.ey);
    ctx.stroke();
    ex = stem.ex;
    ey = stem.ey;
  } else {
    stem.sx = x;
    stem.sy = y;
    [ex, ey] = drawLine(ctx, x, y, angle);
    stem.ex = ex;
    stem.ey = ey;
  }
  if (stem.children.length > 0) {
    for (let i = 0; i < stem.children.length; i++) {
      let child = stem.children[i];
      let angleDelta: number;
      if (stem.children.length > 1) {
        let anglePerBranch = BRANCH_SPREAD / stem.children.length;
        angleDelta = -BRANCH_SPREAD / 2 + anglePerBranch * i;
      } else {
        angleDelta = Math.random() * 10 - 5;
      }
      buildBranch(
        ctx,
        selectedLetters,
        child,
        ex,
        ey,
        angle + angleDelta,
        depth + 1,
        selected &&
          (!selectedLetters[depth + 1] ||
            child.letter === selectedLetters[depth + 1])
      );
    }
  }
  if (stem.isCompleteWord && stem.score) {
    let flowerSelected = false;
    if ($hintMode == "complete") {
      // So in complete mode, we need to have selected ALL the
      // letters -- so e.g. if we're at depth 2 (starting at 0)
      // it will be 3 letters selected...
      flowerSelected = selected && selectedLetters.length == depth + 1;
    } else if ($hintMode == "stems") {
      flowerSelected = selected && selectedLetters.length <= depth + 1;
    }
    drawFlower(ctx, ex, ey, stem.score, flowerSelected);
  }
}

export function updateSceneForSelection(
  ctx: CanvasRenderingContext2D,
  stems: TreeNode[],
  selectedLetters: Letter[]
) {
  ctx.clearRect(0, 0, W, H);
  buildBaseScene(ctx, stems, selectedLetters);
}
