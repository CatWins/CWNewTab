import { GridType } from "../../enums/GridType.js";
import { Grid } from "../Grid.js";
import { GridFree } from "../GridFree.js";
import { GridSnap } from "../GridSnap.js";
import { GridStrict } from "../GridStrict.js";
import { GenericDataDB } from "./GenericDataDB.js";

interface IGrid {
  grid: Grid,
  id: string
}

export class GridTypeDB extends GenericDataDB {
  static tag = "_grid-type";
  static data: GridType = GridType.FREE;

  static async getData(obj: IGrid): Promise<GridType> {
    return obj.grid.type;
  }

  static async setData(obj: IGrid, data: GridType): Promise<void> {
    if (obj.grid.type != data) {
      switch (data) {
        case GridType.FREE:
          obj.grid = GridFree.from(obj.grid);
          return;
        case GridType.SNAP:
          obj.grid = GridSnap.from(obj.grid);
          return;
        case GridType.STRICT:
          obj.grid = GridStrict.from(obj.grid);
          return;
      }
    }
  }

  //overriding typescript parameter types
  static async save(obj: IGrid): Promise<void> {await super.save(obj);}
  static async load(obj: IGrid): Promise<void> {await super.load(obj);}
}
