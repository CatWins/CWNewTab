import { desktop } from "../DesktopSingle.js";
import { WindowGeneric } from "./WindowGeneric.js";
import { BackgroundTypes } from "../../enums/BackgroundTypes";
import { DisplayPropertiesDB } from "../db/DisplayPropertiesDB.js";
import { rgbToHex } from "../../Utility.js";

export class WindowDisplayProperties extends WindowGeneric {
  static PREFIX = "_wdisplayprops_";

  static _instance: WindowDisplayProperties = undefined;

  static get(): WindowDisplayProperties {
    if (this._instance == undefined) {
      this._instance = new WindowDisplayProperties();
      this._instance.create();
    }
    return this._instance;
  }

  form: HTMLFormElement;
  radioBackgroundColorDefault: HTMLInputElement;
  radioBackgroundColorCustom: HTMLInputElement;
  radioBackgroundImageDefault: HTMLInputElement;
  radioBackgroundImageCustom: HTMLInputElement;
  buttonBackgroundColor: HTMLInputElement;
  buttonBackgroundImage: HTMLInputElement;

  isImageSet: boolean;

  buttonCancel: HTMLDivElement;
  buttonOk: HTMLDivElement;
  buttonApply: HTMLDivElement;

  constructor() {
    if (WindowDisplayProperties._instance != undefined) return;
    super("window-desktop-properties", "Display Properties", 0, 0);
    this.isImageSet = false;
    this.html =
      '<div id="' + this.id + '" class="window window-desktop-properties">' +
        '<div class="window-head">' +
          '<span>' + this.name + '</span>' +
          '<div class="button button-close"></div>' +
        '</div>' +
        '<div class="window-content">' +
          '<form>' +
            '<div class="content-outline">' +
              '<div class="content-outline-inner">' +
                '<div class="content-outline-title">Background Color</div>' +
                '<div class="input-radio">' +
                  '<input id="background-color-radio-input-default" class="hidden-input" type="radio" name="background-color-type" value="' + BackgroundTypes.DEFAULT + '"></input>' +
                  '<label for="background-color-radio-input-default" class="radio-button">Default</label>' +
                '</div>' +
                '<div class="input-radio">' +
                  '<input id="background-color-radio-input-custom" class="hidden-input" type="radio" name="background-color-type" value="' + BackgroundTypes.CUSTOM + '"></input>' +
                  '<label for="background-color-radio-input-custom" class="radio-button">Custom</label>' +
                '</div>' +
                '<div class="input-button">' +
                  '<input id="background-color-input" class="hidden-input" type="color"></input>' +
                  '<label for="background-color-input" class="button">Pick Color...</label>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="content-outline">' +
              '<div class="content-outline-inner">' +
                '<div class="content-outline-title">Background Image</div>' +
                '<div class="input-radio">' +
                  '<input id="background-image-radio-input-default" class="hidden-input" type="radio" name="background-image-type" value="' + BackgroundTypes.DEFAULT + '"></input>' +
                  '<label for="background-image-radio-input-default" class="radio-button">None</label>' +
                '</div>' +
                '<div class="input-radio">' +
                  '<input id="background-image-radio-input-custom" class="hidden-input" type="radio" name="background-image-type" value="' + BackgroundTypes.CUSTOM + '"></input>' +
                  '<label for="background-image-radio-input-custom" class="radio-button">Custom</label>' +
                '</div>' +
                '<div class="input-button">' +
                  '<input id="background-image-file-input" class="hidden-input" type="file"></input>' +
                  '<label for="background-image-file-input" class="button">Browse...</label>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</form>' +
          '<div class="clearfix footer">' +
            '<div class="button button-medium button-apply">Apply</div>' +
            '<div class="button button-medium button-cancel">Cancel</div>' +
            '<div class="button button-medium button-ok">Ok</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  get id(): string {return WindowDisplayProperties.PREFIX + this._id;}

  async create(): Promise<void> {
    await super.create();
    this.form = this.element.getElementsByTagName("form")[0] as HTMLFormElement;
    this.radioBackgroundColorDefault = document.getElementById("background-color-radio-input-default") as HTMLInputElement;
    this.radioBackgroundColorCustom = document.getElementById("background-color-radio-input-custom") as HTMLInputElement;
    this.radioBackgroundImageDefault = document.getElementById("background-image-radio-input-default") as HTMLInputElement;
    this.radioBackgroundImageCustom = document.getElementById("background-image-radio-input-custom") as HTMLInputElement;
    this.buttonBackgroundColor = document.getElementById("background-color-input") as HTMLInputElement;
    this.buttonBackgroundImage = document.getElementById("background-image-file-input") as HTMLInputElement;
    this.buttonCancel = this.element.getElementsByClassName("button-cancel")[0] as HTMLDivElement;
    this.buttonOk = this.element.getElementsByClassName("button-ok")[0] as HTMLDivElement;
    this.buttonApply = this.element.getElementsByClassName("button-apply")[0] as HTMLDivElement;

    if (desktop.element.style.backgroundColor == "") {
      this.radioBackgroundColorDefault.setAttribute("checked", "");
      this.buttonBackgroundColor.labels[0].classList.add("disabled");
    } else {
      this.radioBackgroundColorCustom.setAttribute("checked", "");
      this.buttonBackgroundColor.labels[0].classList.remove("disabled");
      this.buttonBackgroundColor.value = rgbToHex(desktop.element.style.backgroundColor);
    }

    if (desktop.element.style.backgroundImage == "") {
      this.radioBackgroundImageDefault.setAttribute("checked", "");
      this.buttonBackgroundImage.labels[0].classList.add("disabled");
    } else {
      this.radioBackgroundImageCustom.setAttribute("checked", "");
      this.buttonBackgroundImage.labels[0].classList.remove("disabled");
    }

    this.radioBackgroundColorDefault.labels[0].addEventListener("click", () => {
      this.buttonBackgroundColor.labels[0].classList.add("disabled");
    });

    this.radioBackgroundColorCustom.labels[0].addEventListener("click", () => {
      this.buttonBackgroundColor.labels[0].classList.remove("disabled");
    });
    
    this.radioBackgroundImageDefault.labels[0].addEventListener("click", () => {
      this.buttonBackgroundImage.labels[0].classList.add("disabled");
    });

    this.radioBackgroundImageCustom.labels[0].addEventListener("click", () => {
      this.buttonBackgroundImage.labels[0].classList.remove("disabled");
    });

    this.buttonBackgroundImage.addEventListener("change", () => {this.isImageSet = true});

    this.buttonCancel.addEventListener("click", (e: MouseEvent) => {this.close(); e.stopPropagation();});
    this.buttonApply.addEventListener("click", () => {this.applySettings();});
    this.buttonOk.addEventListener("click", () => {this.applySettings(); this.close();});
  }

  applySettings(): void {
    let reader = new FileReader();
    reader.readAsDataURL(this.buttonBackgroundImage.files[0] || new Blob());
    reader.onload = () => {
      DisplayPropertiesDB.save({
        id: "desktop",
        obj: this,
        image: (this.isImageSet) ? reader.result as string : desktop.element.style.backgroundImage.slice(4, -1)
      }).then(() => {
        DisplayPropertiesDB.load(desktop);
      });
    };
  }
}
