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
      res.push(new Icon(
        node.id,
        node.title,
        -999999,
        -999999,
        {
          "url": node.url,
          "node": node
        }
      ));
    }
    return res;
  }

  static async getDesktopNode(): Promise<BookmarkTreeNode> {
    let root = await this.getRootNode();
    return root.children[1] || root;
  }

  static async getDesktopContents(): Promise<Icon[]> {
    let root = await this.getRootNode();
    let contents = await this.getFolderContents([root.children[0]]);
    for (let i = 1; i < root.children.length; i++) {
      contents = contents.concat(await this.getFolderContents(root.children[i].children));
    }
    return contents;
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
