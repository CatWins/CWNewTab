import { Bookmarks } from "./Bookmarks.js";
import { ContextMenu } from "./ContextMenu.js";
import { getContainerElementFromEventPath, getIconElementFromEventPath } from "../Utility.js";
import { Target } from "../enums/Target.js";
import { Icon } from "./Icon.js";
import { Container } from "../types/Container";
import { BookmarkTreeNode } from "../types/chrome.js";
import { Grid } from "./Grid.js";
import { GridFree } from "./GridFree.js";
import { GridTypeDB } from "./db/GridTypeDB.js";
import { IFocusable } from "../interfaces/IFocusable.js";
import { WindowGeneric } from "./windows/WindowGeneric.js";
import { ContainerMixin } from "./mixins/Container.js";
import { DisplayPropertiesDB } from "./db/DisplayPropertiesDB.js";
import { LockedStateDB } from "./db/LockedStateDB.js";
import { ContainersPreloadDB } from "./db/ContainersPreloadDB.js";
import { WindowContainer } from "./windows/WindowContainer.js";

export class Desktop extends ContainerMixin(class{}){
  static SYSTEM_FOLDERS_IDS: string[] = ["bookmarks"];
  static _instance: Desktop = undefined;
  
  windows: {[key: string]: WindowGeneric};
  type: Target;
  id: string;
  order: string[];
  element: HTMLDivElement;
  content: HTMLDivElement;
  node: BookmarkTreeNode = undefined;
  _contents: {[key: string]: Icon};
  contextMenu: ContextMenu;
  _grid: Grid = undefined;
  isLocked: boolean;

  offsetX: number;
  offsetY: number;
  zIndex: number;

  get grid(): Grid {return this._grid;}
  set grid(grid: Grid) {
    this._grid = grid;
    GridTypeDB.save(this)
  }

  static get(): Desktop {
    if (this._instance == undefined) {
      this._instance = new Desktop("desktop");
    }
    return this._instance;
  }

  constructor(id: string) {
    super();
    this.windows = {};
    this.type = Target.DESKTOP;
    this.id = id;
    this.order = [this.id];
    this.element = document.getElementById(this.id) as HTMLDivElement;
    DisplayPropertiesDB.load(this);
    this.element.classList.add("desktop__default_color");
    this.content = this.element;
    this._contents = {};
    this.contextMenu = ContextMenu.init();
    this.offsetX = 0;
    this.offsetY = 0;
    this.zIndex = 0;
    this.isLocked = false;
  }

  async create(): Promise<void> {
    //Creating Grid
    let gridCellReference = Icon.getReference();
    gridCellReference.show();
    let gridCellWidth = Math.floor(gridCellReference.element.offsetWidth);
    let gridCellHeight = Math.floor(gridCellReference.element.offsetHeight);
    gridCellReference.hide();
    this._grid = new GridFree(this, this.element.offsetWidth, this.element.offsetHeight, gridCellWidth, gridCellHeight);
    //Filling contents
    this.node = await Bookmarks.getDesktopNode();
    let contents = await Bookmarks.getDesktopContents();
    for (let icon of contents) {
      this.addIcon(icon);
      await icon.create({}, this);
      this.grid.addCell(icon);
    }
    await GridTypeDB.load(this);

    this.element.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      let containerElement = getContainerElementFromEventPath(e);
      let iconElement = getIconElementFromEventPath(e);
      let container = this.getContainer(containerElement.id);
      if (iconElement == undefined) {
        ContextMenu.open(e.clientX, e.clientY, container);
      } else {
        let icon = (container as Container).getIcon(iconElement.id);
        ContextMenu.open(e.clientX, e.clientY, icon);
      }
    });

    this.element.addEventListener("click", (e: MouseEvent) => {
      if (e.button == 0) {
        ContextMenu.close();
      }
    });

    this.element.addEventListener("mousedown", () => this.focus());
    await LockedStateDB.load(this);
    await ContainersPreloadDB.load(this);
  }

  getContainerFocused(): IFocusable {
    if (this.isFocused()) return this;
    return this.windows[this.order[this.order.length - 1]];
  }

  setContainerFocused(container: IFocusable) {
    this.getContainerFocused().unfocus();
    if (container.id == this.order[container.zIndex]) {
      this.order.push(...this.order.splice(container.zIndex, 1));
      for (let i = container.zIndex; i < this.order.length; i++) {
        this.windows[this.order[i]].zIndex = i;
      }
    } else {
      console.log("Top order mismatch: ", container, this.order);
      if (container.id == this.order[this.order.length - 1]) {
        container.zIndex = this.order.length - 1;
      } else {
        if (this.order.includes(container.id)) {
          console.log("Order mismatch: ", container, this.order);
          container.zIndex = this.order.indexOf(container.id);
        } else {
          if (!this.windows[container.id]) throw "Window not registered properly";
          this.registerWindow(container as WindowGeneric); //casting types here because for now IFocusable is either Desktop or WindowGeneric and all this mismatch checks is about window, not desktop
        }
        this.setContainerFocused(container);
      }
    }
  }

  isContainerFocused(id: string): boolean {
    return (this.order[this.order.length - 1] == id);
  }

  isFocused(): boolean {
    return this.isContainerFocused(this.id);
  }

  focus(): void {
    if (this.isFocused()) return;
    this.getContainerFocused().unfocus();
    this.order.push(this.id);
  }

  unfocus(): void {
    if (this.isFocused() && this.order.length > 0) this.order.pop();
  }

  registerWindow(w: WindowGeneric): void {
    if (this.windows[w.id] == undefined) {
      if (this.order.length > 0) this.getContainerFocused().unfocus();
      this.windows[w.id] = w;
      this.order.push(w.id);
      w.zIndex = this.order.length - 1;
    }
  }

  unregisterWindow(w: WindowGeneric): void {
    this.setContainerFocused(w);
    this.order.pop();
    delete this.windows[w.id];
  }

  getContainer(id: string): WindowGeneric | Desktop {
    if (id == this.id) return this;
    return this.windows[id];
  }

  getContainerFromElement(element: Element): Desktop | WindowContainer {
    while (!element.classList.contains("window-container") && element.id != "desktop" && element != null) {
      element = element.parentElement;
    }
    return desktop.getContainer(element.id) as Desktop | WindowContainer; //casting types here because of how we get destElement ^^^ (it's html contains either class=window-container or id=desktop)
  }

  getContainerFromCoords(x: number, y: number): Desktop | WindowContainer {
    let element = document.elementFromPoint(x, y);
    return this.getContainerFromElement(element);
  }

  setBackgroundColor(color: string): void {
    this.element.style.backgroundColor = color;
  }

  resetBackgroundColor(): void {
    this.setBackgroundColor(null);
  }

  setBackgroundImage(imagePath: string): void {
    this.element.style.backgroundImage = (imagePath == null) ? null : "url(" + imagePath + ")";
  }

  resetBackgroundImage(): void {
    this.setBackgroundImage(null);
  }
}

export const desktop = Desktop.get();
