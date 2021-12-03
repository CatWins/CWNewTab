import { IconPath } from "../enums/IconPath.js";
import { Desktop, desktop } from "./DesktopSingle.js";
import { MovableObject, MovableObjectCreateOptions } from "./MovableObject.js";
import { WindowContainer } from "./windows/WindowContainer.js";
import { Target } from "../enums/Target.js";
import { Container } from "../types/Container.js";
import { BookmarkTreeNode } from "../types/chrome.js";
import { GridType } from "../enums/GridType.js";
import { Grid } from "./Grid.js";
import { PositionDB } from "./db/PositionDB.js";
import { Bookmarks } from "./Bookmarks.js";
import { EventEmitter } from "./EventEmitter.js";
import { IconType } from "../enums/IconType";

export class Icon extends MovableObject {
  static PREFIX: string = "_i_";
  static _reference: Icon;

  url: string;
  node: BookmarkTreeNode;
  urlBase: string;
  urlDomain: string;
  favicon: string;
  html: string;
  icon: HTMLImageElement;
  nameElement: HTMLSpanElement;
  container: Container;

  constructor(id: string, name: string, x: number, y: number, args: {url?: string, node?: any} = {"url": "#", "node": undefined}) {
    super(id, name, x, y);
    this.type = Target.ICON;
    this.url = args.url;
    this.node = args.node;
    if (this.url != undefined) {
      this.urlBase = this.url.split("/").filter((_, i) => (i < 3)).join("/");
      this.urlDomain = this.urlBase.split("://")[1];
    } else {
      this.favicon = IconPath.FOLDER;
    }
    this.html = 
      '<div id="' + this.id + '" class="icon">' +
        '<a href="#">' +
          '<img src="">' +
          '<span>' + this.name + '</span>' +
        '</a>' +
      '</div>';
    this.element = undefined;
    this.draggable = undefined;
    this.icon = undefined;
    this.nameElement = undefined;
    this.container = undefined;
  }

  get id(): string {return Icon.PREFIX + this._id;}

  async create(options: MovableObjectCreateOptions = {}, container: Container = desktop): Promise<void> {
    await super.create(options);
    this.container = container;
    container.content.insertAdjacentHTML('beforeend', this.html);
    this.element = document.getElementById(this.id) as HTMLDivElement;
    this.draggable = this.element;
    this.element.style.top = this.y.toString() + "px";
    this.element.style.left = this.x.toString() + "px";
    this.nameElement = this.element.getElementsByTagName("span")[0];
    this.icon = this.element.getElementsByTagName("img")[0];
    
    if (this.url != undefined) {
      let iconType = IconType.ENUM_LENGTH;
      let tryNextIconType = (): void => {
        switch (--iconType) {
          case IconType.ICO:
            this.favicon = this.urlBase + "/favicon.ico";
            break;
          case IconType.PNG:
            this.favicon = this.urlBase + "/favicon.png";
            break;
          //Can't find out how to part true favicons returned by Google and DDG from placeholders
          case IconType.GOOGLE_API:
//            this.favicon = "https://s2.googleusercontent.com/s2/favicons?sz=64&domain_url=" + this.urlBase;
            break;
          case IconType.DUCKDUCKGO_API:
//            this.favicon = "https://icons.duckduckgo.com/ip3/" + this.urlDomain + ".ico";
            break;
          case IconType.YANDEX_API:
            this.favicon = "https://favicon.yandex.net/favicon/" + this.urlDomain;
            break;
          case IconType.DEFAULT:
            this.favicon = IconPath.DEFAULT;
            break;
          default:
            EventEmitter.dispatchErrorEvent(new Error("Can't load any favicon for Icon: " + this.id));
            return;
        }
        this.icon.src = this.favicon;
      }

      this.icon.addEventListener('error', () => {tryNextIconType();});
      this.icon.addEventListener('load', () => {if (this.icon.naturalWidth < 8) tryNextIconType();});
    }

    this.makeDraggable();
    if (this.url == undefined) {
      this.icon.src = this.favicon;
      this.element.addEventListener("dblclick", () => {
        let w = desktop.getContainer(WindowContainer.PREFIX + this.nodeId) as WindowContainer;
        if (w == undefined) {
          let x = 120, y = 120;
          if (this.container.type == Target.WINDOW) { x = (this.container as WindowContainer).x + 36; y = (this.container as WindowContainer).y + 36; }
          w = new WindowContainer(this.nodeId, this.name, x, y, {"node": this.node});
          w.create();
        } else {
          if (w.element.hidden) w.open();
        }
      });
    }
  }

  userRename(): void {
    let oldName = this.nameElement.innerText;
    this.nameElement.contentEditable = "true";
    let range = document.createRange();
    range.selectNodeContents(this.nameElement);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    this.nameElement.focus();

    let mouseCallback = ((e: MouseEvent): void => {
      (e.target == this.nameElement) ? e.stopPropagation() : stop();
    }).bind(this);

    let keyboardCallback = ((e: KeyboardEvent): void => {
      if (e.key == "Enter") {
        e.preventDefault();
        e.stopPropagation();
        stop();
      }
    }).bind(this);

    let stop = ((): void => {
      this.nameElement.contentEditable = "false";
      if (this.nameElement.innerText == "") this.nameElement.innerText = oldName;
      this.focus();
      document.removeEventListener("mousedown", mouseCallback, true);
      document.removeEventListener("keydown", keyboardCallback, true);
      Bookmarks.renameNode(this.node, this.name).then(
        (/*resolve*/) => {
          this.name = this.nameElement.innerText;
          if (this.node != undefined) {
            let container = desktop.getContainer(WindowContainer.PREFIX + this._id) as WindowContainer;
            if (container != undefined) {
              container.name = this.name;
              container.headTitle.innerText = this.name;
            }
          }
        },
        (/*reject*/) => {this.nameElement.innerText = oldName;}
      );
    }).bind(this);

    document.addEventListener("mousedown", mouseCallback, true);
    document.addEventListener("keydown", keyboardCallback, true);
  }

  focus() {
    this.element.getElementsByTagName("a")[0].focus();
  }

  setContainer(container: Desktop | WindowContainer): void {
    container.addIcon(this);
    this.container.removeIcon(this);
    this.container = container;
  }

  async isContainerValid(container: Container): Promise<boolean> {
    let node = await Bookmarks.getNode(container.node.id);
    if (node.id == this.node.id) return false;
    while (node.parentId != undefined) {
      if (node.parentId == this.node.id) return false;
      node = await Bookmarks.getNode(node.parentId);
    }
    return true;
  }

  dragMove(e: MouseEvent): void {
    if (this.container.isLocked) return;
    let ref = Icon.getReference();
    if (MovableObject.is_dragged) {
      if (e.clientX > 0 && e.clientX < window.innerWidth) {
        ref.element.style.left = (ref.element.offsetLeft + e.clientX - MovableObject.mouseX).toString() + "px";
      }
      if (e.clientY > 0 && e.clientY < window.innerHeight) {
        ref.element.style.top = (ref.element.offsetTop + e.clientY - MovableObject.mouseY).toString() + "px";
      }
      let xLocal = e.clientX - this.container.offsetX;
      let yLocal = e.clientY - this.container.offsetY;
      this.container.grid.updateHint(xLocal, yLocal);
    } else {
      if (Math.abs(e.clientX - MovableObject.mouseDownX) + Math.abs(e.clientY - MovableObject.mouseDownY) > 4) {
        MovableObject.is_dragged = true;
        MovableObject.clickedOffsetX = e.clientX - this.container.offsetX - this.element.offsetLeft;
        MovableObject.clickedOffsetY = e.clientY - this.container.offsetY - this.element.offsetTop;
        let xLocal = e.clientX - this.container.offsetX;
        let yLocal = e.clientY - this.container.offsetY;
        this.container.grid.showHint(xLocal, yLocal);
        ref.setPosition(this.element.offsetLeft + this.container.offsetX, this.element.offsetTop + this.container.offsetY);
        ref.icon.src = this.icon.src;
        ref.nameElement.textContent = this.nameElement.textContent;
        ref.show();
      }
    }
    MovableObject.mouseX = e.clientX;
    MovableObject.mouseY = e.clientY;
  }

  dragStop(e: MouseEvent): void {
    if (this.container.isLocked) return;
    if (MovableObject.is_dragged) {
      let ref = Icon.getReference();
      let refX = ref.element.offsetLeft;
      let refY = ref.element.offsetTop;
      ref.hide();

      //Detecting new container
      this.element.style.pointerEvents = "none";
      let destElement = document.elementFromPoint(e.clientX, e.clientY);
      while (!destElement.classList.contains("window-container") && destElement.id != "desktop" && destElement != null) {
        destElement = destElement.parentElement;
      }
      if (destElement.id != this.container.id) {
        //Move to a new container
        let destContainer = desktop.getContainer(destElement.id) as (Desktop | WindowContainer);  //casting types here because of how we get destElement ^^^ (it's html contains either class=window-container or id=desktop)
        this.isContainerValid(destContainer).then(
          (isValid) => {
            if (isValid) {
              Bookmarks.moveNode(this.node, 0, destContainer.node).then(
                () => {
                  this.container.refreshNode();
                  destContainer.refreshNode();
                  this.container.grid.removeCell(this.x, this.y);
                  this.setContainer(destContainer);
                  //Setting coordinates in new container
                  let xLocal = e.clientX - this.container.offsetX;
                  let yLocal = e.clientY - this.container.offsetY;
                  
                  if (this.container.grid.type == GridType.FREE) {
                    //FREE GridType
                    let x = xLocal - MovableObject.clickedOffsetX;
                    let y = yLocal - MovableObject.clickedOffsetY;
                    this.setPosition(x, y);
                    this.container.grid.addCell(this);
                  } else {
                    //STRICT or SNAP GridType
                    this.container.grid.addCellByCoords(this, xLocal, yLocal);
                  }

                  this.container.content.appendChild(this.element);
                }
              );
            } else {
              EventEmitter.dispatchErrorEvent(new Error("Can't move folder inside itself"));
            }
          }
        );
        Grid.hideHint();
      } else {
        //Move inside the same grid
        if (this.container.grid.type == GridType.FREE) {
          this.setPosition(refX - this.container.offsetX, refY - this.container.offsetY);
        } else {
          this.container.grid.moveCell(this, refX + MovableObject.clickedOffsetX - this.container.offsetX, refY + MovableObject.clickedOffsetY - this.container.offsetY);
        }
        Grid.hideHint();
      }

      this.element.style.pointerEvents = null;
      this.element.style.zIndex = null;
      MovableObject.is_dragged = false;
      this.updatePosition(this.element.offsetLeft, this.element.offsetTop);
      PositionDB.save(this);
    }
  }

  static getReference(): Icon {
    if (this._reference == undefined) {
      this._reference = new Icon("_gridReference_", "_gridReference_", -9999, -9999);
      desktop.content.insertAdjacentHTML('beforeend', this._reference.html);
      this._reference.element = document.getElementById(this._reference.id) as HTMLDivElement;
      this._reference.nameElement = this._reference.element.getElementsByTagName("span")[0];
      this._reference.icon = this._reference.element.getElementsByTagName("img")[0];
      this._reference.icon.classList.add("transparent");
      this._reference.element.style.zIndex = "9999";
      this._reference.element.style.left = this._reference.x + "px";
      this._reference.element.style.top = this._reference.y + "px";
      this._reference.hide();
    }
    return this._reference;
  }
}
