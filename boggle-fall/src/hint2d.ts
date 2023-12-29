import type { TreeNode } from "./trees";
import { hintMode, type Letter } from "./stores";
import { get } from "svelte/store";

const W = 1200;
const H = 1200;
const UP = -50;
const PAD = 20;
const WIGGLE = 60; // random wiggle of initial branches...
const BRANCH_SPREAD = 60; // degrees
const INACTIVE_COLOR = "#9db49c"; // Lighter shade of green

const ACTIVE_COLOR = "#007730"; // Same active green
const INACTIVE_FLOWER_STROKE = "#ffc4d1"; // Lighter shade of pink
const INACTIVE_FLOWER = "#ffd4e1"; // Lighter shade of pink
const ACTIVE_FLOWER_STROKE = "#ff3377"; // Same active green
const ACTIVE_FLOWER = "#ff4488"; // Same active pink
const INACTIVE_FLOWER_CENTER = "#d2b48c"; // Lighter shade of pink
const FLOWER_CENTER = "#ffcc00"; // Same active pink

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
      ctx.strokeStyle = ACTIVE_FLOWER_STROKE;
    } else {
      ctx.fillStyle = INACTIVE_FLOWER;
      ctx.strokeStyle = INACTIVE_FLOWER_STROKE;
    }
    ctx.fill();
    ctx.stroke();
  }
  // Finish by drawing the center of the flower...
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
  if (selected) {
    ctx.fillStyle = FLOWER_CENTER;
  } else {
    ctx.fillStyle = INACTIVE_FLOWER_CENTER;
  }
  ctx.fill();
}

// Define a type for the cache value
type CurveCache = {
  cx1: number;
  cy1: number;
  cx2: number;
  cy2: number;
};

// Create a cache object
const curveCache: Record<string, CurveCache> = {};

type DrawnNode = {
  x: number;
  y: number;
  size: number;
};
const drawnNodes: DrawnNode[] = [];
function isInBounds(x, y) {
  return x > 0 && x < W && y > 0 && y < H;
}

function findNonOverlappingPosition(
  drawnNodes: DrawnNode[],
  startX: number,
  startY: number,
  flowerSize: number,
  threshold: number
) {
  let angle = 0;
  let radius = 0;
  let step = 0.5; // How much we increase the radius with each step of the spiral
  let bestX = startX;
  let bestY = startY;
  let bestOverlap = Number.MAX_VALUE;

  while (radius < threshold) {
    // Calculate the candidate position
    let candidateX = startX + radius * Math.cos(angle);
    let candidateY = startY + radius * Math.sin(angle);
    // Calculate the total overlap at the candidate position
    let totalOverlap = drawnNodes.reduce((overlap, node) => {
      const dx = candidateX - node.x;
      const dy = candidateY - node.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const nodeOverlap = Math.max(0, node.size + flowerSize - distance);
      return overlap + nodeOverlap;
    }, 0);

    // If this position has less overlap than the best one so far, remember it
    if (totalOverlap < bestOverlap && isInBounds(candidateX, candidateY)) {
      bestOverlap = totalOverlap;
      bestX = candidateX;
      bestY = candidateY;
    }

    // If there's no overlap, we've found our position
    if (totalOverlap === 0 && isInBounds(candidateX, candidateY)) {
      break;
    }

    // Move along the spiral
    angle += 0.1; // How quickly we rotate around the center
    radius += (step / (2 * Math.PI)) * angle; // Increase the spiral radius
  }

  return { x: bestX, y: bestY, overlap: bestOverlap };
}

function drawRandomCubicCurve(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleInDegrees: number | null = null,
  ex: number | null = null,
  ey: number | null = null,
  repelFromNeighbors = false,
  flowerSize = 0,
  distance = 100,
  // We set two control points perpindular to our line in opposite directions.
  // This is the range of the distance of those control points from the line as
  bendPointFractionRange = [0.2, 0.8],
  // This is the range of the DISTANCE of the control points from the line
  // given in actual pixels (not a percentage).
  amplitudeRange = [0, 20]
): [number, number] {
  let angleInRadians: number;
  if (angleInDegrees) {
    angleInRadians = (angleInDegrees * Math.PI) / 180;
    ex = x + distance * Math.cos(angleInRadians);
    ey = y + distance * Math.sin(angleInRadians);
    if (!isInBounds(ex, ey)) {
      if (ex < 0) {
        ex = 0;
      } else if (ex > W) {
        ex = W;
      } else if (ey < 0) {
        ey = 0;
      } else if (ey > H) {
        ey = H;
      }
    }
    // Repulsion logic
    if (repelFromNeighbors && flowerSize > 0) {
      // Adjust the end position to avoid overlap...
      let overlapAdjustmentX = 0;
      let overlapAdjustmentY = 0;
      // Collect set of overlapping nodes...
      let overlappingNodes = drawnNodes.filter((n) => {
        const dx = ex - n.x;
        const dy = ey - n.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < n.size + flowerSize;
      });
      // If there are overlapping nodes, consider candidate positions within
      // THRESHHOLD pixels of the original position.
      const threshold = distance / 8;
      // Perform the spiral search for a non-overlapping position
      const { x: newEx, y: newEy } = findNonOverlappingPosition(
        drawnNodes,
        ex,
        ey,
        flowerSize,
        threshold
      );

      // Use the new position if it's better
      if (newEx !== ex || newEy !== ey) {
        ex = newEx;
        ey = newEy;
      }
      drawnNodes.push({ x: ex, y: ey, size: flowerSize });
    }
  } else if (ex === null || ey === null) {
    throw new Error("Must provide angle or ex/ey");
  } else {
    // calculate angleInRadians from x,y and ex,ey
    angleInRadians = Math.atan2(ey - y, ex - x);
  }
  const cacheKey = `${x},${y},${ex},${ey}`;
  // Randomize control points
  if (!curveCache[cacheKey]) {
    const bendPointFraction =
      bendPointFractionRange[0] +
      Math.random() * (bendPointFractionRange[1] - bendPointFractionRange[0]);
    const amplitude =
      amplitudeRange[0] +
      Math.random() * (amplitudeRange[1] - amplitudeRange[0]);

    // Calculate bend point on the line
    const bendX = x + bendPointFraction * (ex - x);
    const bendY = y + bendPointFraction * (ey - y);

    // Calculate perpendicular angle
    const perpAngle = angleInRadians + Math.PI / 2;

    // Create and store curve data in the cache
    curveCache[cacheKey] = {
      cx1: bendX + amplitude * Math.cos(perpAngle),
      cy1: bendY + amplitude * Math.sin(perpAngle),
      cx2: bendX - amplitude * Math.cos(perpAngle),
      cy2: bendY - amplitude * Math.sin(perpAngle),
    };
  }
  const { cx1, cy1, cx2, cy2 } = curveCache[cacheKey];

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ex, ey);
  ctx.stroke();

  return [ex, ey];
}

function sortStemsBySelection(
  stems: TreeNode[],
  selectedLetters: Letter[]
): TreeNode[] {
  // Recursive function to sort the tree
  function sortTreeBySelection(
    nodes: TreeNode[],
    selectedLetters: Letter[],
    depth: number
  ): TreeNode[] {
    if (depth >= selectedLetters.length || nodes.length === 0) {
      return nodes;
    }

    // Sort nodes at the current level based on the current depth letter
    nodes.sort((a, b) => {
      const isASelected = a.letter === selectedLetters[depth];
      const isBSelected = b.letter === selectedLetters[depth];
      return isASelected === isBSelected ? 0 : isASelected ? 1 : -1;
    });

    // Now sort the children of each node
    nodes.forEach((node) => {
      node.children = sortTreeBySelection(
        node.children,
        selectedLetters,
        depth + 1
      );
    });

    return nodes;
  }

  // Start the sorting process from the root level
  return sortTreeBySelection(stems, selectedLetters, 0);
}

export function buildBaseScene(
  ctx: CanvasRenderingContext2D,
  stems: TreeNode[],
  selectedLetters: Letter[]
) {
  // Sort stems by whether or not they are selected...
  sortStemsBySelection(stems, selectedLetters);
  for (let i = 0; i < stems.length; i++) {
    let stem = stems[i];
    let offset = 50 / stems.length;
    buildBranch(
      ctx,
      selectedLetters,
      stem,
      PAD + offset * i,
      H,
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
  let hasFlower = stem.isCompleteWord && stem.score > 1;
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
  // Set width...
  ctx.lineWidth = Math.max(8 - depth / 2, 3);
  if (stem.sx && stem.sy && stem.ex && stem.ey) {
    [ex, ey] = drawRandomCubicCurve(
      ctx,
      stem.sx,
      stem.sy,
      null,
      stem.ex,
      stem.ey
    );
    /* ctx.beginPath();
    ctx.moveTo(stem.sx, stem.sy);
    ctx.lineTo(stem.ex, stem.ey);
    ctx.stroke();
    ex = stem.ex;
    ey = stem.ey; */
  } else {
    stem.sx = x;
    stem.sy = y;
    [ex, ey] = drawRandomCubicCurve(
      ctx,
      x,
      y,
      angle,
      null,
      null,
      hasFlower,
      stem.score
    );
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
  if (hasFlower) {
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
