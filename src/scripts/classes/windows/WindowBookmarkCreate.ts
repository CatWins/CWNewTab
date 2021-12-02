import { WindowGeneric } from "./WindowGeneric.js";
import { ImagePath } from "../../enums/ImagePath";
import { desktop } from "../DesktopSingle.js";
import { getRandomId } from "../../Utility.js";
import { Container } from "../../types/Container.js";
import { Bookmarks } from "../Bookmarks.js";

export class WindowBookmarkCreate extends WindowGeneric {
  static PREFIX = "_wbookmarkcreate_";

  container: Container;
  clickX: number;
  clickY: number;

  pagedContent: HTMLDivElement;
  pages: HTMLCollectionOf<HTMLDivElement>;
  buttonCancel: HTMLDivElement;
  buttonBack: HTMLDivElement;
  buttonNext: HTMLDivElement;

  inputUrl: HTMLInputElement;
  inputName: HTMLInputElement;

  activePageIndex: number;

  constructor(x: number, y: number, container: Container, clickX: number, clickY: number) {
    super(getRandomId(), "New Bookmark", x, y);
    this.container = container;
    this.clickX = clickX;
    this.clickY = clickY;
    this.html = 
      '<div id="' + this.id + '" class="window window-wizard">' +
        '<div class="window-head">' +
          '<span>' + this.name + '</span>' +
          '<div class="button button-header button-close"><div></div></div>' +
        '</div>' +
        '<div class="window-content">' +
          '<div class="clearfix">' +
            '<img class="side-image" src="' + ImagePath.CREATE_BOOKMARK_WIZARD + '"/>' +
            '<div class="paged-content">' +
              '<div class="paged-content-page">' +
                '<div class="paged-content-description">' +
                  'Enter address of the website you wish to create bookmark for.' +
                  '<br>' +
                  '<br>' +
                  'Website url:' +
                '</div>' +
                '<input class="input-text bookmark-url" type="url"></input>' +
              '</div>' +
              '<div class="paged-content-page">' +
                '<div class="paged-content-description">' +
                  'Enter the name for your newly created bookmark.' +
                  '<br>' +
                  '<br>' +
                  'Bookmark name:' +
                '</div>' +
                '<input class="input-text bookmark-name" type="text"></input>' +
              '</div>' +

            '</div>' +
          '</div>' +
          '<div class="divider"></div>' +
          '<div class="clearfix">' +
            '<div class="button button-medium button-cancel">Cancel</div>' +
            '<div class="button button-medium button-next">Next&nbsp&gt</div>' +
            '<div class="button button-medium button-back">&lt&nbspBack</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  get id(): string {return WindowBookmarkCreate.PREFIX + this._id;}

  async create(): Promise<void> {
    await super.create({savePosition: false});
    this.pagedContent = this.element.getElementsByClassName("paged-content")[0] as HTMLDivElement;
    this.pages = this.pagedContent.getElementsByClassName("paged-content-page") as HTMLCollectionOf<HTMLDivElement>;
    this.buttonBack = this.element.getElementsByClassName("button-back")[0] as HTMLDivElement;
    this.buttonNext = this.element.getElementsByClassName("button-next")[0] as HTMLDivElement;
    this.buttonCancel = this.element.getElementsByClassName("button-cancel")[0] as HTMLDivElement;
    this.inputUrl = this.pagedContent.getElementsByClassName("bookmark-url")[0] as HTMLInputElement;
    this.inputName = this.pagedContent.getElementsByClassName("bookmark-name")[0] as HTMLInputElement;

    for (let i = 1; i < this.pages.length; i++) {
      this.pages[i].style.display = "none";
    }
    this.activePageIndex = 0;
    this.buttonBack.classList.add("disabled");
    if (this.pages.length == 1) {
      this.buttonNext.innerText = "Finish";
    }

    let focusInput = () => {
      if (this.inputUrl.offsetParent != null) this.inputUrl.focus();
      if (this.inputName.offsetParent != null) this.inputName.focus();
    }

    let isInputValid = (): boolean => {
      if (this.inputUrl.offsetParent != null && this.inputUrl.value.length > 0) return true;
      if (this.inputName.offsetParent != null && this.inputName.value.length > 0) return true;
      return false;
    }

    this.buttonNext.classList.add("disabled");
    focusInput();

    this.buttonCancel.addEventListener("click", (e: MouseEvent) => {this.close(); e.stopPropagation();});

    let nextPage = () => {
      if (this.activePageIndex != this.pages.length - 1) {
        //Show another page
        this.pages[this.activePageIndex].style.display = "none";
        this.activePageIndex += 1;
        this.pages[this.activePageIndex].style.display = null;
        if (this.activePageIndex == this.pages.length - 1) {
          this.buttonNext.innerText = "Finish";
        }
        if (this.activePageIndex == 1) {
          this.buttonBack.classList.remove("disabled");
        }
        this.buttonNext.classList.toggle("disabled", !isInputValid());
      } else {
        //Finisher: gather data, perform actions.
        Bookmarks.createBookmark(this.container.node, this.inputName.value, this.inputUrl.value).then(
          () => Bookmarks.getFolderContentsDelta(this.container.node).then(
          delta => this.container.applyDelta(delta)
        ));
        this.close();
      }
      focusInput();
    }

    this.buttonNext.addEventListener("click", nextPage);
    this.element.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key == "Enter") {
        e.preventDefault();
        e.stopPropagation();
        if (isInputValid()) nextPage();
      }
    }, true);

    let previousPage = () => {
      if (this.activePageIndex != 0) {
        this.pages[this.activePageIndex].style.display = "none";
        this.activePageIndex -= 1;
        this.pages[this.activePageIndex].style.display = null;
        if (this.activePageIndex == this.pages.length - 2) {
          this.buttonNext.innerText = "Next\xa0>";
        }
        if (this.activePageIndex == 0) {
          this.buttonBack.classList.add("disabled");
        }
        this.buttonNext.classList.toggle("disabled", !isInputValid());
      }
      focusInput();
    }

    this.inputName.addEventListener("input", () => {this.buttonNext.classList.toggle("disabled", !isInputValid());})
    this.inputUrl.addEventListener("input", () => {this.buttonNext.classList.toggle("disabled", !isInputValid());})

    this.buttonBack.addEventListener("click", previousPage);
  }

  open(): void {}

  close(): void {
    desktop.unregisterWindow(this);
    this.element.remove();
  }
}
