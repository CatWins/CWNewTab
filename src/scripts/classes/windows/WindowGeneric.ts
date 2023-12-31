import { Target } from "../../enums/Target";
import type { IFocusable } from "../../interfaces/IFocusable";
import { desktop } from "../DesktopSingle.js";
import { MovableObject, MovableObjectCreateOptions } from "../MovableObject.js";

export class WindowGeneric extends MovableObject implements IFocusable {
  static PREFIX = "_wgeneric_";
  
  head: HTMLDivElement;
  headTitle: HTMLSpanElement;
  buttonClose: HTMLDivElement;
  _zIndex: number;

  protected html: string;

  constructor(id: string, name: string, x: number, y: number) {
    super(id, name, x, y);
    this.type = Target.DEFAULT;
    this.element = undefined;
    this.head = undefined;
    this.headTitle = undefined;
    this.buttonClose = undefined;
    this.draggable = undefined;
    this._zIndex = 0;
  }

  get id(): string {return WindowGeneric.PREFIX + this._id;}
  get zIndex(): number {return this._zIndex;}
  set zIndex(n: number) {
    this._zIndex = n;
    this.element.style.zIndex = this._zIndex.toString();
  }

  async create(options: MovableObjectCreateOptions = {}) {
    await super.create(options);
    desktop.content.insertAdjacentHTML('beforeend', this.html);
    this.element = document.getElementById(this.id) as HTMLDivElement;
    this.head = this.element.getElementsByClassName("window-head")[0] as HTMLDivElement;
    this.headTitle = this.head.getElementsByTagName("span")[0] as HTMLSpanElement;
    this.draggable = this.head;
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    this.makeDraggable();
    this.buttonClose = this.element.getElementsByClassName("button-close")[0] as HTMLDivElement;
    if (this.buttonClose != undefined) {
      this.buttonClose.addEventListener("mousedown", (e) => {e.stopPropagation();});
      this.buttonClose.addEventListener("click", (e) => {this.close(); e.stopPropagation();});
    }
    desktop.registerWindow(this);
    this.focus();

    this.element.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.focus();
    });
  }

  center(): void {
    this.setPosition(window.innerWidth / 2 - this.element.offsetWidth / 2, window.innerHeight / 2 - this.element.offsetHeight / 2);
  }

  open(): void {
    this.element.hidden = false;
    this.focus();
  }

  close(): void {this.element.hidden = true;}

  isFocused() {return desktop.isContainerFocused(this.id);}

  focus(): void {
    desktop.setContainerFocused(this);
    this.head.classList.add("focused");
  }

  unfocus(): void {this.head.classList.remove("focused");}
}
