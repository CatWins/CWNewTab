import { MenuItem } from "./MenuItem.js"
import { MenuItemDivider } from "./MenuItemDivider.js"
import { Target } from "../enums/Target.js"
import { Icon } from "./Icon.js";
import { ActionTarget } from "../types/ActionTarget.js";
import { Container } from "../types/Container.js";
import { MenuItemSubmenu } from "./MenuItemSubmenu.js";
import { GridType } from "../enums/GridType.js";
import { GridSnap } from "./GridSnap.js";
import { GridStrict } from "./GridStrict.js";
import { GridFree } from "./GridFree.js";
import { WindowBookmarkCreate } from "./windows/WindowBookmarkCreate.js";
import { Bookmarks } from "./Bookmarks.js";
import { WindowDisplayProperties } from "./windows/WindowDisplayProperties.js";
import { Desktop } from "./DesktopSingle.js";

export class ContextMenu {
  static _menu: (MenuItem | MenuItemDivider)[];
  static element = document.getElementById("context-menu");
  static isOpened = false;

  static get x(): number {return this.element.offsetLeft;}
  static set x(x: number) {this.element.style.left = x .toString() + "px";}

  static get y(): number {return this.element.offsetTop;}
  static set y(y: number) {this.element.style.top = y .toString() + "px";}

  static init(): ContextMenu {
    this._menu = [];
    let itemCreateBookmark =  this.addItem(new MenuItem("Create Bookmark", [Target.WINDOW, Target.DESKTOP]));
    let itemCreateFolder =    this.addItem(new MenuItem("Create Folder", [Target.WINDOW, Target.DESKTOP]));
    let itemGridControlMenu = this.addItem(new MenuItemSubmenu("Arrange icons", [Target.WINDOW, Target.DESKTOP]));
    let itemGridLineup =        itemGridControlMenu.addItem(new MenuItem("Line up", [Target.WINDOW, Target.DESKTOP]));
    let itemGridSnapToGrid =    itemGridControlMenu.addItem(new MenuItem("Snap to grid", [Target.WINDOW, Target.DESKTOP]));
    let itemGridAutoArrange =   itemGridControlMenu.addItem(new MenuItem("Auto arrange", [Target.WINDOW, Target.DESKTOP]));
                              this.addItem(new MenuItemDivider());
    let itemRemove =          this.addItem(new MenuItem("Remove", [Target.ICON]));
    let itemRename =          this.addItem(new MenuItem("Rename", [Target.ICON]));
                              this.addItem(new MenuItemDivider());
    let itemDesktopLock =     this.addItem(new MenuItem("Lock icons", [Target.DESKTOP]));
    let itemDisplayProps =    this.addItem(new MenuItem("Properties", [Target.DESKTOP]));
    
    //Add Bookmark
    itemCreateBookmark.addEventListener("click", (e: MouseEvent) => {
      let w = new WindowBookmarkCreate(0, 0, itemCreateBookmark.currentTarget as Container, e.clientX, e.clientY);
      w.create().then(() => w.center());
    });

    //Add Folder
    itemCreateFolder.addEventListener("click", (e: MouseEvent) => {
      let container = itemCreateFolder.currentTarget as Container;
      Bookmarks.createFolder(container.node, "New Folder").then(
        () => Bookmarks.getFolderContentsDelta(container.node).then(
        delta => {
          container.applyDelta(delta).then(() => {
            delta.added[0].userRename();
          });
        }
      ));
    });

    //Remove Bookmark
    itemRemove.addEventListener("click", (e: MouseEvent) => {
      let icon = itemRemove.currentTarget as Icon;
      Bookmarks.removeNode(icon.node).then(
        () => Bookmarks.getFolderContentsDelta(icon.container.node).then(
        delta => {
          icon.container.applyDelta(delta);
          icon.element.remove();
        }
      ));
    });

    //Rename Bookmark
    itemRename.addEventListener("click", (e: MouseEvent) => {
      let icon = itemRename.currentTarget as Icon;
      icon.userRename();
    });

    //Grid Auto
    itemGridAutoArrange.onSetTarget = () => {
      let container = itemGridAutoArrange.currentTarget as Container;
      if (container.grid.type == GridType.STRICT) {
        itemGridAutoArrange.element.classList.add("checked");
      } else {
        itemGridAutoArrange.element.classList.remove("checked");
      }
    }

    itemGridAutoArrange.addEventListener("click", (e: MouseEvent) => {
      let container = itemGridAutoArrange.currentTarget as Container;
      container.grid = (container.grid.type == GridType.STRICT) ? GridSnap.from(container.grid) : GridStrict.from(container.grid);
    });

    //Grid Snap
    itemGridSnapToGrid.onSetTarget = () => {
      let container = itemGridSnapToGrid.currentTarget as Container;
      if (container.grid.type == GridType.STRICT || container.grid.type == GridType.SNAP) {
        itemGridSnapToGrid.element.classList.add("checked");
      } else {
        itemGridSnapToGrid.element.classList.remove("checked");
      }
    };

    itemGridSnapToGrid.addEventListener("click", (e: MouseEvent) => {
      let container = itemGridSnapToGrid.currentTarget as Container;
      container.grid = (container.grid.type == GridType.STRICT || container.grid.type == GridType.SNAP) ? GridFree.from(container.grid) : GridSnap.from(container.grid);
    });

    //Grid Lineup
    itemGridLineup.onSetTarget = () => {
      let container = itemGridLineup.currentTarget as Container;
      if (container.grid.type != GridType.FREE) {
        itemGridLineup.element.classList.add("disabled");
      } else {
        itemGridLineup.element.classList.remove("disabled");
      }
    }

    itemGridLineup.addEventListener("click", (e: MouseEvent) => {
      let container = itemGridLineup.currentTarget as Container;
      container.grid = GridSnap.from(container.grid);  //Grid will recalc icon positions on type change
      container.grid = GridFree.from(container.grid);
    });

    //Desktop Lock
    itemDesktopLock.onSetTarget = () => {
      let container = itemDesktopLock.currentTarget as Desktop;
      itemDesktopLock.element.classList.toggle("checked", container.isLocked);
    }

    itemDesktopLock.addEventListener("click", () => {
      let container = itemDesktopLock.currentTarget as Desktop;
      container.toggleLock();
    });

    //Display Properties
    itemDisplayProps.addEventListener("click", () => {
      WindowDisplayProperties.get().open();
    });

    return ContextMenu;
  }

  static addItem<T extends MenuItem | MenuItemDivider>(menuItem: T): T {
    this._menu.push(menuItem);
    this.element.append(menuItem.element);
    return menuItem;
  }

  static open(x: number, y: number, target: ActionTarget): void {
    if (target.type == Target.DEFAULT) {
      this.close();
      return;
    }
    this.setTarget(target);
    this.x = x;
    this.y = y;
    this.element.style.display = null;
    this.isOpened = true;
  }

  static close(): void {
    this.element.style.display = "none";
    this.isOpened = false;
  }

  static setTarget(target: ActionTarget): void {
    for (let item of this._menu) {
      item.setTarget(target);
    }
  }
}
