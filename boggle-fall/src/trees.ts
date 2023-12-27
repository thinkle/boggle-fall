import type { Letter } from "./stores";

export class TreeNode {
  letter: Letter;
  parent: TreeNode | null;
  children: TreeNode[];
  isCompleteWord: boolean;
  score?: number;
  sx?: number;
  sy?: number;
  ex?: number;
  ey?: number;

  constructor(letter: Letter, parent: TreeNode | null = null) {
    this.letter = letter;
    this.children = [];
    this.isCompleteWord = false;
    this.parent = parent;
  }

  addChild(node: TreeNode) {
    this.children.push(node);
  }
  maxDepth() {
    let max = 0;
    for (let child of this.children) {
      max = Math.max(max, child.maxDepth());
    }
    return max + 1;
  }
}
