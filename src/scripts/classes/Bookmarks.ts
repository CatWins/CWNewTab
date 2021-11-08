import { Icon } from "./Icon.js";
import type { BookmarkTreeNode } from "../types/chrome";

var browser: any = browser || chrome;

export class Bookmarks {
  static async getRootContents(): Promise<Icon[]> {
    let nodes = await Bookmarks.getRootNode();
    return Bookmarks.getFolderContents(nodes);
  }

  static async getRootNode(): Promise<BookmarkTreeNode[]> {
    let tree = await browser.bookmarks.getTree();
    return tree[0].children;
  }

  static async getFolderContents(nodes: BookmarkTreeNode[]): Promise<Icon[]> {
    let res = [];
    console.log(nodes);
    for (let node of nodes) {
      let is_folder = (!node.url);
      if (is_folder) {
        res.push(new Icon(
          "_bookmark_folder_" + node.id,
          node.title,
          (node.index % 8 * 60) + 10,
          Math.floor(node.index / 8) * 80,
          {
            "node": node
          }
        ));
      } else {
        res.push(new Icon(
          "_bookmark_" + node.id,
          node.title,
          (node.index % 8 * 60) + 10,
          Math.floor(node.index / 8) * 80,
          {
            "url": node.url,
            "node": node
          }
        ));
      }
    }
    return res;
  }
}
