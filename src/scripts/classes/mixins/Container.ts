import { Target } from "../../enums/Target";
import { BookmarkTreeNode } from "../../types/chrome";
import { FolderContentsDelta } from "../../types/FolderContentsDelta";
import { Bookmarks } from "../Bookmarks.js";
import { LockedStateDB } from "../db/LockedStateDB.js";
import { Grid } from "../Grid.js";
import { Icon } from "../Icon.js";

type Constructor = new (...args: any[]) => {};
//type ConstructorGeneric<T = {}> = new (...args: any[]) => T;

export function ContainerMixin<BaseClass extends Constructor>(BaseClass: BaseClass) {
  abstract class MContainer extends BaseClass {
      
    abstract id: string;
    abstract type: Target;
    abstract content: HTMLDivElement;

    abstract offsetX: number;
    abstract offsetY: number;

    abstract grid: Grid;
    abstract node: BookmarkTreeNode;
    abstract _contents: {[key: string]: Icon};
    abstract isLocked: boolean;

    getIcon(id: string): Icon {
      return this._contents[id];
    }

    addIcon(icon: Icon): void {
      this._contents[icon.id] = icon;
    }

    removeIcon(icon: Icon): void {
      this._contents[icon.id] = undefined;
    }

    async applyDelta(delta: FolderContentsDelta): Promise<void> {
      if (delta.node != undefined) this.node = delta.node; //Actually don't needed, this is the same node. But just in case of future changes in function that creates delta.
      if (delta.added != undefined) {
        for (let icon of delta.added) {
          this.addIcon(icon);
          await icon.create(this);
          this.grid.addCell(icon);
        }
      }
      if (delta.removed != undefined) {
        for (let id of delta.removed) {
          let icon = this.getIcon(id);
          if (icon != undefined) {
            this.removeIcon(icon);
            this.grid.removeCell(icon.x, icon.y);
            icon.container = undefined;
          }
        }
      }
    }

    async refreshNode(): Promise<void> {
      let node = await Bookmarks.getNode(this.node.id);
      if (node != undefined) {this.node = node;}
    }

    toggleLock(): void {
      this.isLocked = !this.isLocked;
      LockedStateDB.save(this);
    }
  }
  return MContainer;
}
