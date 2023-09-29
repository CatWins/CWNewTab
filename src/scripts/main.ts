var browser: any = chrome || browser;
import { desktop } from "./classes/DesktopSingle.js";
import { EventEmitter } from "./classes/EventEmitter.js";
import { CustomErrorEvent } from "./classes/events/CustomErrorEvent.js";
import { WindowError } from "./classes/windows/WindowError.js";
import { EventType } from "./enums/EventType.js";

async function main(): Promise<void> {
  let error_count: number = 0;
  const error_count_max: number = 10;

  function errorEventListener(e: CustomErrorEvent): void {
    let w = new WindowError(e.error.name, 0, 0, {"error": e.error});
    w.create().then(() => w.center());
    error_count++;
    if (error_count == error_count_max) {
      EventEmitter.dispatchErrorEvent(new Error("Errors wouldn't create any more windows, but you can check them in console still"));
      EventEmitter.removeEventListener(EventType.CUSTOM_ERROR_EVENT, errorEventListener);
    }
  }

  EventEmitter.addEventListener(EventType.CUSTOM_ERROR_EVENT, errorEventListener);

  await desktop.create();

  document.addEventListener("click", (e) => {
    if (!["input", "label"].includes((e.target as Element).tagName.toLowerCase())) e.preventDefault();
  });
}

main();
