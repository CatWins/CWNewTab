import { Desktop, desktop } from "../DesktopSingle.js";
import { Bookmarks } from "../Bookmarks.js";
import { IconPath } from "../../enums/IconPath.js";
import { Grid } from "../Grid.js";
import { Icon } from "../Icon.js";
import { Target } from "../../enums/Target.js";
import type { BookmarkTreeNode } from "../../types/chrome";
import { GridFree } from "../GridFree.js";
import { GridType } from "../../enums/GridType.js";
import { DimensionsDB } from "../db/DimensionsDB.js";
import { GridTypeDB } from "../db/GridTypeDB.js";
import { WindowGeneric } from "./WindowGeneric.js";
import { ContainerMixin } from "../mixins/Container.js";
import { LockedStateDB } from "../db/LockedStateDB.js";

export class WindowContainer extends ContainerMixin(WindowGeneric) {
  static PREFIX = "_wcontainer_";
  static resizeObserver = new ResizeObserver(resizeObserverCallback);
  
  content: HTMLDivElement;
  node: BookmarkTreeNode;
  _contents: {[key: string]: Icon};
  filler: HTMLDivElement;
  _grid: Grid;
  width: number;
  height: number;
  isLocked: boolean;

  constructor(id: string, name: string, x: number, y: number, args: {node?: any} = {"node": undefined}) {
    super(id, name, x, y);
    this.type = Target.WINDOW;
    this.content = undefined;
    this.filler = undefined;
    this._grid = undefined;
    this.node = args.node;
    this.width = undefined;
    this.height = undefined;
    this._contents = {};
    this.isLocked = false;
    this.html = 
      '<div id="' + this.id + '" class="window window-container">' +
        '<div class="window-head">' +
          '<img src=' + IconPath.FOLDER + '>' +
          '<span>' + this.name + '</span>' +
          '<div class="button button-close"></div>' +
          '<div class="button button-lock"></div>' +
        '</div>' +
        '<div class="window-content">' +
          '<div class="window-filler"></div>' +
        '</div>' +
      '</div>';
  }

  //@ts-ignore due to compiler bug: https://github.com/microsoft/TypeScript/issues/44938
  get id(): string {return WindowContainer.PREFIX + this._id;}
  get offsetX(): number {return this.element.offsetLeft + this.element.clientLeft + this.content.offsetLeft + this.content.clientLeft - this.content.scrollLeft;}
  get offsetY(): number {return this.element.offsetTop + this.element.clientTop + this.content.offsetTop + this.content.clientTop - this.content.scrollTop;}
  get grid(): Grid {return this._grid;}
  set grid(grid: Grid) {
    this._grid = grid;
    GridTypeDB.save(this);
  }

  async create() {
    await super.create();
    let contents: Icon[] = [];
    if (Desktop.SYSTEM_FOLDERS_IDS.includes(this.id)) {
      console.log("Windows with custom functionality not supported");
    } else {
      if (this.node != undefined) {
        contents = await Bookmarks.getFolderContents(this.node.children);
      } else {
        console.log("Custom windows not implemented");
        console.log(Desktop.SYSTEM_FOLDERS_IDS, this.id);
        return;
      }
    }

    this.content = this.element.getElementsByClassName("window-content")[0] as HTMLDivElement;
    this.filler = this.content.getElementsByClassName("window-filler")[0] as HTMLDivElement;
    this.width = this.content.offsetWidth;
    this.height = this.content.offsetHeight;
    await DimensionsDB.load(this);
    this.element.style.width = this.width + "px";
    this.element.style.height = this.height + "px";
    let gridCellReference = Icon.getReference();
    gridCellReference.show();
    let gridCellWidth = Math.floor(gridCellReference.element.offsetWidth);
    let gridCellHeight = Math.floor(gridCellReference.element.offsetHeight);
    gridCellReference.hide();
    this._grid = new GridFree(this, this.width, this.height, gridCellWidth, gridCellHeight);
    for (let icon of contents) {
      this.addIcon(icon);
      await icon.create(this);
      this.grid.addCell(icon);
    }
    await GridTypeDB.load(this);
    this.filler.style.width = this.content.scrollWidth + "px";
    this.filler.style.height = this.content.scrollHeight + "px";
    WindowContainer.resizeObserver.observe(this.element);

    this.content.addEventListener("scroll", (_: Event) => {
      this.resizeContent();
    });

    let buttonLock = this.head.getElementsByClassName("button-lock")[0];
    let updateLock= () => {
      buttonLock.classList.toggle("button-pressed", this.isLocked);
      this.element.classList.toggle("locked", this.isLocked);
    }
    if (buttonLock != undefined) {
      buttonLock.addEventListener("mousedown", (e) => {e.stopPropagation();});
      buttonLock.addEventListener("click", (e) => {
        this.toggleLock();
        updateLock();
      });
    }
    await LockedStateDB.load(this);
    updateLock();
  }


  open(): void {
    this.element.hidden = false;
    this.focus();
  }

  close(): void {this.element.hidden = true;}

  dragMove(e: MouseEvent): void {
    if (!this.isLocked) super.dragMove(e);
  }

  dragStop(e: MouseEvent): void {
    if (!this.isLocked) super.dragStop(e);
  }

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
      let w = container as WindowContainer;
      w.resize(e.borderBoxSize[0].blockSize, e.borderBoxSize[0].inlineSize);
    }
  }
}
