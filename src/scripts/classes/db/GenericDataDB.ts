export class GenericDataDB {
  static tag: string;
  static data: any;

  static getData(obj: any): any {};
  static setData(obj: any, data: any): any {};

  static isValid(data: any): boolean {
    if (data == undefined) return false;
    try {
      if (typeof data == "object") {
        for (const key in this.data) {
          if (typeof this.data[key] != typeof data[key]) {
            throw `Error\nType mismatch: ${typeof this.data[key]} != ${typeof data[key]}`;
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
      alert(error.message + "\n" + error.stack);
      return false;
    }
    return true;
  }

  static save(obj: any): void {
    let data = this.getData(obj);
    if (!this.isValid(data)) return;
    window.localStorage.setItem(obj.id + this.tag, JSON.stringify(data));
  }

  static load(obj: any, fallback: any = undefined): void {
    try {
      let data = JSON.parse(window.localStorage.getItem(obj.id + this.tag));
      if (!this.isValid(data)) data = fallback || this.data;
      this.setData(obj, data);
    } catch (error) {
      alert(error.stack);
    }
  }
}