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

let shortenings: { [key: string]: string } = {
  Fifteen: "15",
  "Thirty-One": "31",
  Two: "2",
  Seven: "7",
  " Regular": "",
  "No Hints": "-",
  " Easy": "",
};
export function shorten(s: string) {
  for (let key in shortenings) {
    s = s.replace(key, shortenings[key]);
  }
  return s;
}
