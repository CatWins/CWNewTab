import { GridType } from "../enums/GridType.js";
import { Target } from "../enums/Target.js";
import { Container } from "../types/Container.js";
import { Position } from "../types/Position.js";
import { Desktop as desktop } from "./DesktopSingle.js";
import { Grid } from "./Grid.js";
import { Icon } from "./Icon.js";

export class MovableObject {
  static mouseX: number;
  static mouseY: number;
  static mouseDownX: number;
  static mouseDownY: number;
  static is_dragged: boolean = false;
  static clickedOffsetX: number;
  static clickedOffsetY: number;
//  static time = Date();
  static PREFIX: string = "_GENERIC_PREFIX_";

  _id: string;
  name: string;
  x: number;
  y: number;
  element: HTMLDivElement;
  type: Target;
  draggable: HTMLElement;
  container: Container;

  constructor(id: string, name: string, x: number, y: number) {
    this._id = id; this.name = name; this.x = x; this.y = y;
    this.loadPosition();
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
    this.savePosition();
    this.element.style.left = x + "px";
    this.element.style.top = y + "px";
  }
  updatePosition(x: number, y: number): void {this.x = x; this.y = y;}
  savePosition(): void {window.localStorage.setItem(this.id + "_position", '{"x":' + this.x + ', "y":' + this.y + '}')}
  loadPosition(): void {
    let position = JSON.parse(window.localStorage.getItem(this.id + "_position")) as Position;
    if (position) {
      this.x = position.x;
      this.y = position.y;
    }
  }

  makeDraggable(): void {
    const is_window = (this.type == Target.WINDOW);
    const is_icon = (this.type == Target.ICON);
    let dragMoveBinded = dragMove.bind(this);
    let dragStopBinded = dragStop.bind(this);
    this.draggable.addEventListener("mousedown", (e: MouseEvent): void => {
      e.preventDefault();
      if (e.button != 0) return
      if (is_icon) {
        (this.element.children[0] as HTMLLinkElement).focus();
        this.element.style.zIndex = 10 .toString();
      }
      MovableObject.mouseX = e.clientX;
      MovableObject.mouseY = e.clientY;
      MovableObject.mouseDownX = e.clientX;
      MovableObject.mouseDownY = e.clientY;
      document.addEventListener("mousemove", dragMoveBinded);
      document.addEventListener("mouseup", dragStopBinded);
    });

    function dragMove(this: MovableObject, e: MouseEvent): void {
//      let time_now = new Date();
//      if (time_now - MovableObject.time < 16.6) return;
//      MovableObject.time = time_now;
      if (MovableObject.is_dragged || is_window) {
        if (e.clientX > 0 && e.clientX < window.innerWidth) {
          this.element.style.left = (this.element.offsetLeft + e.clientX - MovableObject.mouseX).toString() + "px";
        }
        if (e.clientY > 0 && e.clientY < window.innerHeight) {
          this.element.style.top = (this.element.offsetTop + e.clientY - MovableObject.mouseY).toString() + "px";
        }
        if (is_icon) {
          let xLocal = e.clientX - this.container.offsetX;
          let yLocal = e.clientY - this.container.offsetY;
          this.container.grid.updateHint(xLocal, yLocal);
        }
      } else {
        if (is_icon && Math.abs(e.clientX - MovableObject.mouseDownX) + Math.abs(e.clientY - MovableObject.mouseDownY) > 4) {
          MovableObject.is_dragged = true;
          MovableObject.clickedOffsetX = e.clientX - this.container.offsetX - this.element.offsetLeft;
          MovableObject.clickedOffsetY = e.clientY - this.container.offsetY - this.element.offsetTop;
          let xLocal = e.clientX - this.container.offsetX;
          let yLocal = e.clientY - this.container.offsetY;
          this.container.grid.showHint(xLocal, yLocal);
        }
      }
      MovableObject.mouseX = e.clientX;
      MovableObject.mouseY = e.clientY;
    }

    function dragStop(this: MovableObject, e: MouseEvent) {
      if (is_icon && MovableObject.is_dragged) {
        //Detecting new container
        this.element.style.pointerEvents = "none";
        let destElement = document.elementFromPoint(e.clientX, e.clientY);
        while (!destElement.classList.contains("window") && destElement.id != "desktop" && destElement != null) {
          destElement = destElement.parentElement;
        }
        if (destElement.id != this.container.id) {
          
          //Move to a new container
          this.container.grid.removeCell(this.x, this.y);
          let destContainer = desktop.getContainer(destElement.id);
          (this as Icon).setContainer(destContainer);

          //Setting coordinates in new container
          let xLocal = e.clientX - this.container.offsetX;
          let yLocal = e.clientY - this.container.offsetY;
          
          if (this.container.grid.type == GridType.FREE) {
            
            //FREE GridType
            let x = xLocal - MovableObject.clickedOffsetX;
            let y = yLocal - MovableObject.clickedOffsetY;
            this.setPosition(x, y);
            this.container.grid.addCell(this as Icon);
            Grid.hideHint();
          } else {

            //STRICT or SNAP GridType
            this.container.grid.addCellByCoords(this as Icon, xLocal, yLocal);
            Grid.hideHint();
          }

          this.container.content.appendChild(this.element);
        } else {

          //Move inside the same grid
          this.container.grid.moveCell(this as Icon, this.element.offsetLeft + MovableObject.clickedOffsetX, this.element.offsetTop + MovableObject.clickedOffsetY);
          Grid.hideHint();
        }

        this.element.style.pointerEvents = null;
        this.element.style.zIndex = null;
      }
      MovableObject.is_dragged = false;
      document.removeEventListener("mousemove", dragMoveBinded);
      document.removeEventListener("mouseup", dragStopBinded);
      this.updatePosition(this.element.offsetLeft, this.element.offsetTop);
      this.savePosition();
    }
  }
}
