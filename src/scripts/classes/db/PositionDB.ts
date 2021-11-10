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

  static getData(obj: IPosition): Position {
    return {
      "x": obj.x,
      "y": obj.y
    };
  }

  static setData(obj: IPosition, data: Position): void {
    obj.x = data.x;
    obj.y = data.y;
  }

  //overriding typescript parameter types
  static save(obj: IPosition): void {super.save(obj);}
  static load(obj: IPosition, fallback?: Position): void {super.load(obj, fallback);}
}
