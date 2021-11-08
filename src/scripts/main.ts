var browser: any = chrome || browser;
import {Desktop as desktop} from "./classes/DesktopSingle.js";

await desktop.create();

document.addEventListener("click", (e) => {e.preventDefault();})
