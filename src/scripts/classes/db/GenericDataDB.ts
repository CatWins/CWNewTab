import { EventEmitter } from "../EventEmitter.js";

export class GenericDataDB {
  static tag: string;
  static data: any;

  static async getData(obj: any): Promise<any> {};
  static async setData(obj: any, data: any): Promise<any> {};

  static isValid(data: any): boolean {
    if (data == undefined) return false;
    try {
      if (typeof data == "object") {
        for (const key in this.data) {
          if (typeof this.data[key] != typeof data[key]) {
            throw new Error(`Error\nType mismatch: ${typeof this.data[key]} != ${typeof data[key]} at key ${key}`);
          } else {
            if (typeof this.data[key] == "number" && !isFinite(data[key])) {
              throw new Error(`Error\n${key} = ${data[key]} is not a number`);
            }
          }
        }
      } else {
        if (typeof this.data != typeof data) {
          throw new Error(`Error\nType mismatch: ${typeof this.data} != ${typeof data}`);
        } else {
          if (typeof this.data == "number" && !isFinite(data)) {
            throw new Error(`Error\n${data} is not a number`);
          }
        }
      }
    } catch(error) {
      EventEmitter.dispatchErrorEvent(error);
      return false;
    }
    return true;
  }

  static async save(obj: any): Promise<void> {
    try {
      let data = await this.getData(obj);
      if (!this.isValid(data)) return;
      window.localStorage.setItem(obj.id + this.tag, JSON.stringify(data));
    } catch (error) {
      EventEmitter.dispatchErrorEvent(error);
    }
  }

  static async load(obj: any, fallback: any = undefined): Promise<void> {
    try {
      let data = JSON.parse(window.localStorage.getItem(obj.id + this.tag));
      if (!this.isValid(data)) data = fallback || this.data;
      await this.setData(obj, data);
    } catch (error) {
      EventEmitter.dispatchErrorEvent(error);
    }
  }
}
