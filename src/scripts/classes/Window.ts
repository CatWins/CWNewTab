import { Desktop as desktop } from "./DesktopSingle.js";
import { MovableObject } from "./MovableObject.js";
import { Bookmarks } from "./Bookmarks.js";
import { Favicon } from "../enums/Favicon.js";
import { Grid } from "./Grid.js";
import { Icon } from "./Icon.js";
import { Target } from "../enums/Target.js";
import type { BookmarkTreeNode } from "../types/chrome";
import { GridFree } from "./GridFree.js";
import { GridType } from "../enums/GridType.js";
import { DimensionsDB } from "./db/DimensionsDB.js";
import { GridTypeDB } from "./db/GridTypeDB.js";

export class Window extends MovableObject {
  static PREFIX = "_w_";
  static resizeObserver = new ResizeObserver(resizeObserverCallback);
  
//  type: Target;
//  element: HTMLDivElement;
  head: HTMLDivElement;
  content: HTMLDivElement;
  filler: HTMLDivElement;
//  draggable: HTMLElement;
  _grid: Grid;
  node: BookmarkTreeNode;
  _zIndex: number;
  width: number;
  height: number;
  _contents: {[key: string]: Icon};

  constructor(id: string, name: string, x: number, y: number, args: {node?: any} = {"node": undefined}) {
    super(id, name, x, y);
    this.type = Target.WINDOW;
    this.element = undefined;
    this.head = undefined;
    this.content = undefined;
    this.filler = undefined;
    this.draggable = undefined;
    this._grid = undefined;
    this.node = args.node;
    this._zIndex = 0;
    this.width = undefined;
    this.height = undefined;
    this._contents = {};
  }

  get id(): string {return Window.PREFIX + this._id;}
  get offsetX(): number {return this.element.offsetLeft + this.element.clientLeft + this.content.offsetLeft + this.content.clientLeft - this.content.scrollLeft;}
  get offsetY(): number {return this.element.offsetTop + this.element.clientTop + this.content.offsetTop + this.content.clientTop - this.content.scrollTop;}
  get zIndex(): number {return this._zIndex;}
  set zIndex(n: number) {
    this._zIndex = n;
    this.element.style.zIndex = this._zIndex.toString();
  }
  get grid(): Grid {return this._grid;}
  set grid(grid: Grid) {
    this._grid = grid;
    GridTypeDB.save(this);
  }

  async create() {
    let contents: Icon[] = [];
    if (desktop.SYSTEM_FOLDERS_IDS.includes(this.id)) {
      console.log("Windows with custom functionality not supported");
    } else {
      if (this.node != undefined) {
        contents = await Bookmarks.getFolderContents(this.node.children);
      } else {
        console.log("Custom windows not implemented");
        console.log(desktop.SYSTEM_FOLDERS_IDS, this.id);
        return;
      }
    }

    desktop.content.insertAdjacentHTML('beforeend',
      '<div id="' + this.id + '" class="window">' +
        '<div class="window-head">' +
          '<img src=' + Favicon.FOLDER + '>' +
          '<span>' + this.name + '</span>' +
          '<div class="button button-close"></div>' +
        '</div>' +
        '<div class="window-content">' +
          '<div class="window-filler"></div>' +
        '</div>' +
      '</div>'
    );
    this.element = document.getElementById(this.id) as HTMLDivElement;
    this.head = this.element.getElementsByClassName("window-head")[0] as HTMLDivElement;
    this.draggable = this.head;
    this.content = this.element.getElementsByClassName("window-content")[0] as HTMLDivElement;
    this.filler = this.content.getElementsByClassName("window-filler")[0] as HTMLDivElement;
    this.width = this.content.offsetWidth;
    this.height = this.content.offsetHeight;
    DimensionsDB.load(this);
    this.element.style.width = this.width + "px";
    this.element.style.height = this.height + "px";
    this.element.style.left = this.x + "px";
    this.element.style.top = this.y + "px";
    let gridCellReference = Icon.getReference();
    gridCellReference.show();
    let gridCellWidth = Math.floor(gridCellReference.element.offsetWidth);
    let gridCellHeight = Math.floor(gridCellReference.element.offsetHeight);
    gridCellReference.hide();
    this._grid = new GridFree(this, this.width, this.height, gridCellWidth, gridCellHeight);
    for (let icon of contents) {
      this.addIcon(icon);
      icon.create(this);
      this.grid.addCell(icon);
    }
    GridTypeDB.load(this);
    this.makeDraggable();
    let buttonClose = this.element.getElementsByClassName("button-close")[0];
    buttonClose.addEventListener("mousedown", (e) => {e.stopPropagation();});
    buttonClose.addEventListener("click", (e) => {this.close(); e.stopPropagation();});
    this.filler.style.width = this.content.scrollWidth + "px";
    this.filler.style.height = this.content.scrollHeight + "px";
    Window.resizeObserver.observe(this.element);
    desktop.registerConteiner(this);
    this.focus();

    this.element.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.focus();
    });

    this.content.addEventListener("scroll", (_: Event) => {
      this.resizeContent();
    });
  }

  getIcon(id: string): Icon {
    return this._contents[id];
  }

  addIcon(icon: Icon): void {
    this._contents[icon.id] = icon;
  }

  removeIcon(icon: Icon): void {
    this._contents[icon.id] = undefined;
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

  resizeContent(): void {
    if (this.content.scrollWidth != this.content.clientWidth) {
      let width = this.content.clientWidth + this.content.scrollLeft;
      if (width > this.content.scrollWidth) width = this.content.scrollWidth;
      this.filler.style.width = width + "px";
    }
    if (this.content.scrollHeight != this.content.clientHeight) {
      let height = this.content.clientHeight + this.content.scrollTop;
      if (height > this.content.scrollHeight) height = this.content.scrollHeight;
      this.filler.style.height = height + "px";
    }
  }

  resize(width: number, height: number): void {
    if (width == 0 || height == 0) return;
    this.width = this.element.clientWidth;
    this.height = this.element.clientHeight;
    DimensionsDB.save(this);
    if (this.grid.type == GridType.STRICT) {
      this.grid.redefine(this.content.clientWidth, this.content.clientHeight);
      this.filler.style.width = null;
      this.filler.style.height = null;
    } else {
      this.grid.redefine(this.content.scrollWidth, this.content.scrollHeight);
      this.resizeContent();
    }
  }
}

function resizeObserverCallback(entries: ResizeObserverEntry[]): void {
  for (let e of entries) {
    let container = desktop.getContainer(e.target.id);
    if (container != undefined && container.type == Target.WINDOW) {
      let w = container as Window;
      w.resize(e.borderBoxSize[0].blockSize, e.borderBoxSize[0].inlineSize);
    }
  }
}
