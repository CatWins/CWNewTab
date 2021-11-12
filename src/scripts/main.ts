var browser: any = chrome || browser;
import {Desktop as desktop} from "./classes/DesktopSingle.js";
import { EventEmitter } from "./classes/EventEmitter.js";
import { CustomErrorEvent } from "./classes/events/CustomErrorEvent.js";
import { WindowError } from "./classes/windows/WindowError.js";
import { EventType } from "./enums/EventType.js";

EventEmitter.addEventListener(EventType.CUSTOM_ERROR_EVENT, (e: CustomErrorEvent) => {
  let w = new WindowError((Math.random() * 10e16).toString(), e.error.name, window.innerWidth / 2, window.innerHeight / 2, {"error": e.error});
  w.create().then(() => w.setPosition(w.x - w.element.offsetWidth / 2, w.y - w.element.offsetHeight / 2));
});

await desktop.create();

document.addEventListener("click", (e) => {e.preventDefault();})
