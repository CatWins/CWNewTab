import { Container } from "../../types/Container.js";
import { GenericDataDB } from "./GenericDataDB.js";

export class LockedStateDB extends GenericDataDB {
  static tag = "_locked_state";
  static data: boolean = false;

  static async getData(obj: Container): Promise<boolean> {
    return obj.isLocked;
  }

  static async setData(obj: Container, data: boolean): Promise<void> {
    obj.isLocked = data;
  }

  //overriding typescript parameter types
  static async save(obj: Container): Promise<void> {await super.save(obj);}
  static async load(obj: Container): Promise<void> {await super.load(obj);}
}
