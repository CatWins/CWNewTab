import { CustomErrorEvent } from "./events/CustomErrorEvent.js";

export class EventEmitter extends EventTarget {
  static _instance: EventEmitter = undefined;
  static get(): EventEmitter {
    if (this._instance == undefined) {
      this._instance = new EventEmitter();
    }
    return this._instance;
  }

  static dispatchEvent(event: Event): boolean {
    return this.get().dispatchEvent(event);
  }

  static addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    this.get().addEventListener(type, listener, options);
  }

  static removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
    this.get().removeEventListener(type, listener, options);
  }

  static dispatchErrorEvent(error: Error): boolean {
    return this.dispatchEvent(new CustomErrorEvent(error));
  }
}
