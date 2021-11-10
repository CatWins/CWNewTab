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

  static getData(obj: IDimensions): Dimensions {
    return {
      "width": obj.width,
      "height": obj.height
    };
  }

  static setData(obj: IDimensions, data: Dimensions): void {
    obj.width = data.width;
    obj.height = data.height;
  }

  //overriding typescript parameter types
  static save(obj: IDimensions): void {super.save(obj);}
  static load(obj: IDimensions): void {super.load(obj);}
}
