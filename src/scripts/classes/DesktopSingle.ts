import { Bookmarks } from "./Bookmarks.js";
import { ContextMenu } from "./ContextMenu.js";
import { getContainerElementFromEventPath, getIconElementFromEventPath } from "../Utility.js";
import { Target } from "../enums/Target.js";
import { Icon } from "./Icon.js";
import { Container } from "../types/Container";
import { BookmarkTreeNode } from "../types/chrome.js";
import { Grid } from "./Grid.js";
import { GridFree } from "./GridFree.js";

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
const grid: Grid = undefined;

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
  grid,

  offsetX,
  offsetY,
  zIndex,

  async create(): Promise<void> {
    //Creating Grid
    let gridCellReference = Icon.getReference();
    gridCellReference.show();
    let gridCellWidth = Math.floor(gridCellReference.element.offsetWidth);
    let gridCellHeight = Math.floor(gridCellReference.element.offsetHeight);
    gridCellReference.hide();
    this.grid = new GridFree(this, this.element.offsetWidth, this.element.offsetHeight, gridCellWidth, gridCellHeight);
    //Filling contents
    this.node = await Bookmarks.getRootNode();
    let contents = await Bookmarks.getFolderContents(this.node);
    for (let icon of contents) {
      this.addIcon(icon);
      icon.create(this);
      this.grid.addCell(icon);
    }

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

  getContainerFocused(): Container {
    if (this.isFocused()) return this;
    return this.windows[this.order[this.order.length - 1]];
  },

  setContainerFocused(container: Container) {
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

  registerConteiner(container: Container): void {
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
