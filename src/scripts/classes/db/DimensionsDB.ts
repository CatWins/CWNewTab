import { GenericDataDB } from "./GenericDataDB.js";
import type { Dimensions } from "../../types/Dimensions";

interface IDimensions {
  width: number,
  height: number,
  id: string
}

export class DimensionsDB extends GenericDataDB {
  static tag = "_dimensions";
  static data: Dimensions = {
    "width": window.innerWidth / 2,
    "height": window.innerHeight /2
  };

  static async getData(obj: IDimensions): Promise<Dimensions> {
    return {
      "width": obj.width,
      "height": obj.height
    };
  }

  static async setData(obj: IDimensions, data: Dimensions): Promise<void> {
    obj.width = data.width;
    obj.height = data.height;
  }

  //overriding typescript parameter types
  static async save(obj: IDimensions): Promise<void> {await super.save(obj);}
  static async load(obj: IDimensions): Promise<void> {await super.load(obj);}
}
