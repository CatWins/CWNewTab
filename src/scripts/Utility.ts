export function getContainerElementFromEventPath(event: any): HTMLDivElement {
  return event.path.find((e: HTMLElement) => e.classList && (e.classList.contains("window") || e.id == "desktop"));
}

export function getIconElementFromEventPath(event: any): HTMLDivElement {
  return event.path.find((e: HTMLElement) => e.classList && e.classList.contains("icon"));
}

export function getRandomId(): string {
  return (Math.random() * 10e16).toString();
}
