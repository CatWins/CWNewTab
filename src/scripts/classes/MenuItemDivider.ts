import { ActionTarget } from "../types/ActionTarget";

export class MenuItemDivider {
  element: HTMLLIElement;

  constructor() {
    this.element = document.createElement("li") as HTMLLIElement;
    this.element.className = "divider";
  }

  setTarget(target: ActionTarget): void {

  }
}
