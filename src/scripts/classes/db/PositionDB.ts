import type { Position } from "../../types/Position";
import { GenericDataDB } from "./GenericDataDB.js";

interface IPosition {
  x: number,
  y: number,
  id: string
}

export class PositionDB extends GenericDataDB {
  static tag = "_position";
  static data: Position = {
    "x": 40,
    "y": 40
  };

  static async getData(obj: IPosition): Promise<Position> {
    return {
      "x": obj.x,
      "y": obj.y
    };
  }

  static async setData(obj: IPosition, data: Position): Promise<void> {
    obj.x = data.x;
    obj.y = data.y;
  }

  //overriding typescript parameter types
  static async save(obj: IPosition): Promise<void> {await super.save(obj);}
  static async load(obj: IPosition, fallback?: Position): Promise<void> { await super.load(obj, fallback);}
}
