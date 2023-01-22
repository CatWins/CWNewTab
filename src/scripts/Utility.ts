export function getContainerElementFromEventPath(event: any): HTMLDivElement {
  function getContainerElement(e: HTMLElement): HTMLDivElement {
    if (e.classList && (e.classList.contains("window") || e.id == "desktop")) return e as HTMLDivElement;
    if (e.parentElement) return getContainerElement(e.parentElement);
    return null;
  }
  return getContainerElement(event.target);
}

export function getIconElementFromEventPath(event: any): HTMLDivElement {
  function getIconElement(e: HTMLElement): HTMLDivElement {
    if (e.classList && e.classList.contains("icon")) return e as HTMLDivElement;
    if (e.parentElement) return getIconElement(e.parentElement);
    return null;
  }
  return getIconElement(event.target);
}

export function getRandomId(): string {
  return (Math.random() * 10e16).toString();
}

export function rgbToHex(rgbString: string) {
  let [r, g, b] = rgbString.trim().slice(4, -1).split(",").map((e) => parseInt(e));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function openDataUri(url: string): void {
    let html = 
      '<html>' +
      '<style>' +
        'html, body {' +
          'padding: 0;' +
          'margin: 0;' +
        '}' +
        'iframe {' +
          'width: 100%;' +
          'height: 100%;' +
          'border: 0;' +
        '}' +
      '</style>' +
      '<body>' +
      '<iframe src="' + url + '"></iframe>' +
      '</body></html>';
    let a = window.open();
    a.document.write(html);
}
