export function getPageOffset(el: HTMLElement) {
  let x = el.offsetLeft;
  let y = el.offsetTop;
  if (el.offsetParent) {
    let parentOffset = getPageOffset(el.offsetParent);
    x += parentOffset.x;
    y += parentOffset.y;
  }
  return { x, y };
}
