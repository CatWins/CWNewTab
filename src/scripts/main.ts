var browser: any = chrome || browser;
import { desktop } from "./classes/DesktopSingle.js";
import { EventEmitter } from "./classes/EventEmitter.js";
import { CustomErrorEvent } from "./classes/events/CustomErrorEvent.js";
import { WindowError } from "./classes/windows/WindowError.js";
import { EventType } from "./enums/EventType.js";
import { getRandomId } from "./Utility.js";

EventEmitter.addEventListener(EventType.CUSTOM_ERROR_EVENT, (e: CustomErrorEvent) => {
  let w = new WindowError(getRandomId(), e.error.name, 0, 0, {"error": e.error});
  w.create().then(() => w.center());
});

await desktop.create();

document.addEventListener("click", (e) => {e.preventDefault();})
