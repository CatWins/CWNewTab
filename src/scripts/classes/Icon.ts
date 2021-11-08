import { Favicon } from "../enums/Favicon.js";
import { Desktop as desktop } from "./DesktopSingle.js";
import { MovableObject } from "./MovableObject.js";
import { Window } from "./Window.js";
import { Target } from "../enums/Target.js";
import { Container } from "../types/Container.js";
import { BookmarkTreeNode } from "../types/chrome.js";

export class Icon extends MovableObject {
  static PREFIX: string = "_i_";
  static _reference: Icon;

  url: string;
  node: BookmarkTreeNode;
  favicon: string;
  html: string;
  icon: HTMLImageElement;
  nameElement: HTMLSpanElement;

  constructor(id: string, name: string, x: number, y: number, args: {url?: string, node?: any} = {"url": "#", "node": undefined}) {
    super(id, name, x, y);
    this.type = Target.ICON;
    this.url = args.url;
    this.node = args.node;
    this.favicon = (this.url == undefined) ? Favicon.FOLDER : this.url.split("/").filter((_, i) => (i < 3)).join("/") + "/favicon.ico";
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

  create(container: Container = desktop): void {
    this.container = container;
    container.content.insertAdjacentHTML('beforeend', this.html);
    this.element = document.getElementById(this.id) as HTMLDivElement;
    this.draggable = this.element;
    this.element.style.top = this.y.toString() + "px";
    this.element.style.left = this.x.toString() + "px";
    this.nameElement = this.element.getElementsByTagName("span")[0];
    this.icon = this.element.getElementsByTagName("img")[0];
    this.icon.addEventListener('error', () => {
      this.icon.src = Favicon.DEFAULT;
    });
    this.icon.src = this.favicon;
    this.makeDraggable();
    if (this.node != undefined) {
      this.element.addEventListener("dblclick", () => {
        let w = desktop.getContainer(Window.PREFIX + this.nodeId) as Window;
        if (w == undefined) {
          w = new Window(this.nodeId, this.name, 180, 160, {"node": this.node});
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
    }).bind(this);

    document.addEventListener("mousedown", mouseCallback, true);
    document.addEventListener("keydown", keyboardCallback, true);
  }

  focus() {
    this.element.getElementsByTagName("a")[0].focus();
  }

  setContainer(container: Container): void {
    container.addIcon(this);
    this.container.removeIcon(this);
    this.container = container;
  }

  static getReference(): Icon {
    if (this._reference == undefined) {
      this._reference = new Icon("_gridReference_", "_gridReference_", -9999, -9999);
      desktop.content.insertAdjacentHTML('beforeend', this._reference.html);
      this._reference.element = document.getElementById(this._reference.id) as HTMLDivElement;
      this._reference.element.style.left = this._reference.x + "px";
      this._reference.element.style.top = this._reference.y + "px";
    }
    return this._reference;
  }
}
