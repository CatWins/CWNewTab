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

const SYSTEM_FOLDERS_IDS = ["bookmarks"];
const windows = {};
const type = Target.DESKTOP;
const id = "desktop";
const nodeId: string = undefined;
const order = [id];
const element = document.getElementById(id) as HTMLDivElement;
const content = element;
const node: BookmarkTreeNode = undefined;
const _contents = {};
const contextMenu = ContextMenu.init();
const _grid: Grid = undefined;

const offsetX = 0;
const offsetY = 0;
const zIndex = 0;

export const Desktop = {
  SYSTEM_FOLDERS_IDS,
  windows,
  type,
  id,
  nodeId,
  order,
  element,
  content,
  node,
  _contents,
  contextMenu,
  _grid,

  offsetX,
  offsetY,
  zIndex,

  get grid(): Grid {return this._grid;},
  set grid(grid: Grid) {
    GridTypeDB.save(this);
    this._grid = grid;
  },

  async create(): Promise<void> {
    //Creating Grid
    let gridCellReference = Icon.getReference();
    gridCellReference.show();
    let gridCellWidth = Math.floor(gridCellReference.element.offsetWidth);
    let gridCellHeight = Math.floor(gridCellReference.element.offsetHeight);
    gridCellReference.hide();
    this._grid = new GridFree(this, this.element.offsetWidth, this.element.offsetHeight, gridCellWidth, gridCellHeight);
    //Filling contents
    this.node = await Bookmarks.getRootNode();
    let contents = await Bookmarks.getFolderContents(this.node);
    for (let icon of contents) {
      this.addIcon(icon);
      icon.create(this);
      this.grid.addCell(icon);
    }
    GridTypeDB.load(this);

    this.element.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      let containerElement = getContainerElementFromEventPath(e);
      let iconElement = getIconElementFromEventPath(e);
      let container = this.getContainer(containerElement.id);
      if (iconElement == undefined) {
        ContextMenu.open(e.clientX, e.clientY, container);
      } else {
        let icon = container.getIcon(iconElement.id);
        ContextMenu.open(e.clientX, e.clientY, icon);
      }
    });

    this.element.addEventListener("click", (e: MouseEvent) => {
      if (e.button == 0) {
        ContextMenu.close();
      }
    });

    this.element.addEventListener("mousedown", () => this.focus());
  },

  getIcon(id: string): Icon {
    return this._contents[id];
  },

  addIcon(icon: Icon): void {
    this._contents[icon.id] = icon;
  },

  removeIcon(icon: Icon): void {
    this._contents[icon.id] = undefined;
  },

  getContainerFocused(): IFocusable {
    if (this.isFocused()) return this;
    return this.windows[this.order[this.order.length - 1]];
  },

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
          this.registerConteiner(container);
        }
        this.setContainerFocused(container);
      }
    }
  },

  isContainerFocused(id: string): boolean {
    return (this.order[this.order.length - 1] == id);
  },

  isFocused(): boolean {
    return this.isContainerFocused(this.id);
  },

  focus(): void {
    if (this.isFocused()) return;
    this.getContainerFocused().unfocus();
    this.order.push(this.id);
  },

  unfocus(): void {
    if (this.isFocused() && this.order.length > 0) this.order.pop();
  },

  registerContainer(container: IFocusable): void {
    if (this.windows[container.id] == undefined) {
      if (this.order.length > 0) this.getContainerFocused().unfocus();
      this.windows[container.id] = container;
      this.order.push(container.id);
      container.zIndex = this.order.length - 1;
    }
  },

  getContainer(id: string): Container {
    if (id == this.id) return this;
    return this.windows[id];
  }

}
