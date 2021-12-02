import { Target } from "../enums/Target.js";
import { PositionDB } from "./db/PositionDB.js";

export type MovableObjectCreateOptions = {
  savePosition?: boolean
}

export class MovableObject {
  static mouseX: number;
  static mouseY: number;
  static mouseDownX: number;
  static mouseDownY: number;
  static is_dragged: boolean = false;
  static clickedOffsetX: number;
  static clickedOffsetY: number;
  static PREFIX: string = "_GENERIC_PREFIX_";

  _id: string;
  name: string;
  x: number;
  y: number;
  element: HTMLDivElement;
  type: Target;
  draggable: HTMLElement;

  constructor(id: string, name: string, x: number, y: number) {
    this._id = id; this.name = name; this.x = x; this.y = y;
  }

  async create({savePosition = true}: MovableObjectCreateOptions = {}) {
    if (savePosition) await PositionDB.load(this, {"x": this.x, "y": this.y});
  }

  get id(): string {return MovableObject.PREFIX + this._id;}
  set id(id: string) {
    this._id = id;
    if (this.element) this.element.id = this.id;
  }

  get nodeId(): string {return this._id;}
  set nodeId(id: string) {this.id = id;}

  setPosition(x: number, y: number): void {
    this.x = x; this.y = y;
    PositionDB.save(this);
    this.element.style.left = x + "px";
    this.element.style.top = y + "px";
  }
  updatePosition(x: number, y: number): void {this.x = x; this.y = y;}

  show(): void {this.element.style.display = null;}
  hide(): void {this.element.style.display = "none";}

  makeDraggable(): void {
    const is_icon = (this.type == Target.ICON);
    this.draggable.addEventListener("mousedown", (e: MouseEvent): void => {
      e.preventDefault();
      if (e.button != 0) return
      if (is_icon) {
        (this.element.children[0] as HTMLLinkElement).focus();
      }
      MovableObject.mouseX = e.clientX;
      MovableObject.mouseY = e.clientY;
      MovableObject.mouseDownX = e.clientX;
      MovableObject.mouseDownY = e.clientY;
      document.addEventListener("mousemove", dragMove);
      document.addEventListener("mouseup", dragStop);
    });

    let dragMove = (e: MouseEvent) => {this.dragMove(e);}
    let dragStop = (e: MouseEvent) => {
      this.dragStop(e);
      document.removeEventListener("mousemove", dragMove);
      document.removeEventListener("mouseup", dragStop);
    }
  }

  dragMove(e: MouseEvent): void {
    if (e.clientX > 0 && e.clientX < window.innerWidth) {
      this.element.style.left = (this.element.offsetLeft + e.clientX - MovableObject.mouseX).toString() + "px";
    }
    if (e.clientY > 0 && e.clientY < window.innerHeight) {
      this.element.style.top = (this.element.offsetTop + e.clientY - MovableObject.mouseY).toString() + "px";
    }
    MovableObject.mouseX = e.clientX;
    MovableObject.mouseY = e.clientY;
  }

  dragStop(e: MouseEvent): void {
    MovableObject.is_dragged = false;
    this.updatePosition(this.element.offsetLeft, this.element.offsetTop);
    PositionDB.save(this);
  }
}
