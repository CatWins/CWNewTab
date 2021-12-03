import { IconType } from "../../enums/IconType.js";
import { Icon } from "../Icon.js";
import { GenericDataDB } from "./GenericDataDB.js";

export class FaviconTypeDB extends GenericDataDB {
  static tag = "_favicon_type";
  static data: IconType = IconType.ENUM_LENGTH - 1;

  static async getData(obj: Icon): Promise<IconType> {
    return obj.faviconType;
  }

  static async setData(obj: Icon, data: IconType): Promise<void> {
    obj.faviconType = data;
  }

  //overriding typescript parameter types
  static async save(obj: Icon): Promise<void> {await super.save(obj);}
  static async load(obj: Icon, fallback?: IconType): Promise<void> { await super.load(obj, fallback);}
}
