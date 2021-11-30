import { Target } from "../../enums/Target.js";
import { Desktop } from "../DesktopSingle.js";
import { WindowContainer } from "../windows/WindowContainer.js";
import { GenericDataDB } from "./GenericDataDB.js";
import { Bookmarks } from "../Bookmarks.js";

export class ContainersPreloadDB extends GenericDataDB {
  static tag = "_containers_preload";
  static data: string[] = [];

  static async getData(obj: Desktop): Promise<string[]> {
    let data = [];
    for (let id of Object.keys(obj.windows)) {
      let w = obj.windows[id];
      if (w.type == Target.WINDOW && (w as WindowContainer).isLocked) {
        data.push(w.nodeId);
      }
    }
    return data;
  }

  static async setData(obj: Desktop, data: string[]): Promise<void> {
    for (let id of data) {
      let node = await Bookmarks.getNode(id);
      if (node != undefined) {
        let w = new WindowContainer(id, node.title, 180, 160, {"node": node});
        w.create();
      }
    }
  }

  //overriding typescript parameter types
  static async save(obj: Desktop): Promise<void> {await super.save(obj);}
  static async load(obj: Desktop, fallback?: string[]): Promise<void> { await super.load(obj, fallback);}
}
