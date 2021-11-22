import { IconPath } from "../../enums/IconPath";
import { desktop } from "../DesktopSingle.js";
import { WindowGeneric } from "./WindowGeneric.js";

let defaultArgs = {"error": undefined as Error, "message": "Something went wrong!"};

export class WindowError extends WindowGeneric {
  static PREFIX = "_werror_";

  constructor(id: string, name: string, x: number, y: number, args: {error?: Error, message?: string} = defaultArgs) {
    super(id, name, x, y);
    let message = (args.error != undefined) ? (args.error.stack || args.error.message) : (args.message || defaultArgs.message);
    console.log(message);
    message = message
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt")
      .replaceAll(">", "&gt")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")
      .replaceAll("\n", "<br>");
    this.html = 
      '<div id="' + this.id + '" class="window window-error">' +
        '<div class="window-head">' +
          '<span>' + this.name + '</span>' +
          '<div class="button button-close"></div>' +
        '</div>' +
        '<div class="window-content">' +
          '<div class="clearfix">' +
            '<img src="' + IconPath.ERROR + '">' +
            '<div class="message">' + message + '</div>' +
          '</div>' +
          '<div class="button button-auto button-ok">OK</div>' +
        '</div>' +
      '</div>';
  }

  get id(): string {return WindowError.PREFIX + this._id;}

  async create(): Promise<void> {
    await super.create();
    let buttonOk = this.element.getElementsByClassName("button-ok")[0];
    buttonOk.addEventListener("click", (e: MouseEvent) => {
      e.stopPropagation();
      this.close();
    });
  }

  open(): void {}

  close(): void {
    desktop.unregisterWindow(this);
    this.element.remove();
  }
}
