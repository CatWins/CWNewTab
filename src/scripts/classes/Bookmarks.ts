import { Icon } from "./Icon.js";
import type { BookmarkTreeNode, BookmarkCreateDetails } from "../types/chrome";
import { EventEmitter } from "./EventEmitter.js";
import { FolderContentsDelta } from "../types/FolderContentsDelta";

var browser: any = browser || chrome;

export class Bookmarks {
  static async getRootNode(): Promise<BookmarkTreeNode> {
    let tree = await browser.bookmarks.getTree();
    return tree[0];
  }

  static async getFolderContents(nodes: BookmarkTreeNode[]): Promise<Icon[]> {
    let res: Icon[] = [];
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

  static async getFolderContentsDelta(folderNode: BookmarkTreeNode): Promise<FolderContentsDelta> {
    try {
      let newContents = await this.getNode(folderNode.id);
      let addedNodes = newContents.children.filter(e => folderNode.children.findIndex(other => e.id == other.id) == -1);
      let removedNodes = folderNode.children.filter(e => newContents.children.findIndex(other => e.id == other.id) == -1);
      folderNode = newContents;
      return {
        node: folderNode,
        added: await this.getFolderContents(addedNodes),
        removed: removedNodes.map(e => Icon.PREFIX + "_bookmark_" + e.id)
      };
    } catch (error) {
      EventEmitter.dispatchErrorEvent(error);
    }
  }

  static async getNode(nodeId: string): Promise<BookmarkTreeNode> {
    try {
      return (await browser.bookmarks.getSubTree(nodeId))[0] as BookmarkTreeNode;
    } catch (error) {
      EventEmitter.dispatchErrorEvent(error);
      return Promise.reject(error);
    }
  }

  static async createNode(parent: BookmarkTreeNode, title: string, url: string = null): Promise<BookmarkTreeNode> {
    let createDetails: BookmarkCreateDetails = {
      index: 0,
      parentId: parent.id,
      title: title,
      url: url
    };
    try {
      return await browser.bookmarks.create(createDetails);
    } catch(error) {
      EventEmitter.dispatchErrorEvent(error);
    }
  }

  static async createBookmark(parent: BookmarkTreeNode, title: string, url: string): Promise<BookmarkTreeNode> {
    return await this.createNode(parent, title, url);
  }

  static async createFolder(parent: BookmarkTreeNode, title: string): Promise<BookmarkTreeNode> {
    return await this.createNode(parent, title);
  }

  static async removeNode(node: BookmarkTreeNode): Promise<void> {
    try {
      return await browser.bookmarks.remove(node.id);
    } catch (error) {
      EventEmitter.dispatchErrorEvent(error);
      return Promise.reject(error);
    }
  }

  static async updateNode(node: BookmarkTreeNode, title: string = null, url: string = null): Promise<BookmarkTreeNode> {
    let changes: {title?: string, url?: string} = {};
    changes.title = title || undefined;
    changes.url = url || undefined;
    try {
      return await browser.bookmarks.update(node.id, changes);
    } catch (error) {
      EventEmitter.dispatchErrorEvent(error);
      return Promise.reject(error);
    }
  }

  static async renameNode(node: BookmarkTreeNode, title: string): Promise<BookmarkTreeNode> {
    return await this.updateNode(node, title);
  }

  static async moveNode(node: BookmarkTreeNode, newIndex: number, newParent: BookmarkTreeNode = null) {
    let destination: {parentId?: string, index?: number} = {};
    destination.index = newIndex || undefined;
    destination.parentId = newParent && newParent.id || undefined;
    try {
      return await browser.bookmarks.move(node.id, destination);
    } catch (error) {
      EventEmitter.dispatchErrorEvent(error);
      return Promise.reject(error);
    }
  }
}
