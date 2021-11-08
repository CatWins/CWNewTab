import { Target } from "../enums/Target";
import { ActionTarget } from "../types/ActionTarget";
import { MenuItem } from "./MenuItem.js";
import { MenuItemDivider } from "./MenuItemDivider.js";

export class MenuItemSubmenu extends MenuItem {
  private _menu: (MenuItem | MenuItemDivider)[];
  private _menuElement: HTMLUListElement;

  constructor(name: string, validTargets: Target[]) {
    super(name, validTargets);
    this.element.classList.add("submenu");
    this._menu = [];
    this._menuElement = document.createElement("ul");
    this._menuElement.classList.add("menu");
    this.element.append(this._menuElement);
  }

  addItem<T extends MenuItem | MenuItemDivider>(menuItem: T): T {
    this._menu.push(menuItem);
    this._menuElement.append(menuItem.element);
    return menuItem;
  }

  setTarget(target: ActionTarget) {
    super.setTarget(target);
    for (let item of this._menu) {
      item.setTarget(target);
    }
  }
}
