import { BackgroundTypes } from "../../enums/BackgroundTypes.js";
import { Desktop } from "../DesktopSingle.js";
import { WindowDisplayProperties } from "../windows/WindowDisplayProperties.js";
import { GenericDataDB } from "./GenericDataDB.js";

type Data = {
  colorType: BackgroundTypes,
  imageType: BackgroundTypes,
  color: string,
  image: string
}

export class DisplayPropertiesDB extends GenericDataDB {
  static tag = "_display-properties";
  static data: Data = {
    colorType: BackgroundTypes.DEFAULT,
    imageType: BackgroundTypes.DEFAULT,
    color: "#008080",
    image: ""
  };

  static async getData(fakeObj: {id: string, obj: WindowDisplayProperties, image: string}): Promise<Data> {
    let obj = fakeObj.obj;
    return {
      colorType: parseInt(obj.form["background-color-type"].value),
      imageType: parseInt(obj.form["background-image-type"].value),
      color: obj.form["background-color-input"].value,
      image: fakeObj.image
    }
  }

  static async setData(obj: Desktop, data: Data): Promise<void> {
    switch (data.colorType) {
      case BackgroundTypes.CUSTOM:
        obj.setBackgroundColor(data.color);
        break;
      case BackgroundTypes.DEFAULT:
      default:
        obj.resetBackgroundColor();
    }
    switch (data.imageType) {
      case BackgroundTypes.CUSTOM:
        if (data.image == "") {
          obj.resetBackgroundImage();
        } else {
          obj.setBackgroundImage(data.image);
        }
        break;
      case BackgroundTypes.DEFAULT:
      default:
        obj.resetBackgroundImage();
    }
  }

  //overriding typescript parameter types
  static async save(obj: {id: string, obj: WindowDisplayProperties, image: string}): Promise<void> {await super.save(obj);}
  static async load(obj: Desktop): Promise<void> {await super.load(obj);}
}
