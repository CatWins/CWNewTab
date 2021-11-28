export function getContainerElementFromEventPath(event: any): HTMLDivElement {
  return event.path.find((e: HTMLElement) => e.classList && (e.classList.contains("window") || e.id == "desktop"));
}

export function getIconElementFromEventPath(event: any): HTMLDivElement {
  return event.path.find((e: HTMLElement) => e.classList && e.classList.contains("icon"));
}

export function getRandomId(): string {
  return (Math.random() * 10e16).toString();
}

export function rgbToHex(rgbString: string) {
  let [r, g, b] = rgbString.trim().slice(4, -1).split(",").map((e) => parseInt(e));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
