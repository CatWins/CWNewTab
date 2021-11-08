import { Target } from "../enums/Target.js";
import { ActionTarget } from "../types/ActionTarget.js";
import { Icon } from "./Icon.js";

export class MenuItem {
  name: string;
  element: HTMLLIElement;
  currentTarget: ActionTarget;
  validTargets: Target[];
  onSetTarget: () => void;

  constructor(name: string, validTargets: Target[]) {
    this.name = name;
    this.element = document.createElement("li");
    this.element.innerHTML = this.name;
    this.currentTarget = undefined;
    this.validTargets = validTargets;
  }

  enable(): void {
//    this.element.style.display = null;
    this.element.classList.remove("disabled");
  }

  disable(): void {
//    this.element.style.display = "none";
    this.element.classList.add("disabled");
  }

  addEventListener(eventType: keyof HTMLElementEventMap, listener: any, options: boolean | AddEventListenerOptions = undefined) {
    this.element.addEventListener(eventType, listener, options);
  }

  setTarget(target: ActionTarget): void {
    if (this.validTargets.some(e => e == target.type)) {
      this.enable();
    } else {
      if (target.type == Target.ICON) {
        this.setTarget((target as Icon).container);
        return;
      }
      this.disable();
    }
    this.currentTarget = target;
    if (this.onSetTarget != undefined) this.onSetTarget();
  }
};
