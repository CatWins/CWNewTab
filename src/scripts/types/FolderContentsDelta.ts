import { Icon } from "../classes/Icon.js";
import { BookmarkTreeNode } from "./chrome.js";

export type FolderContentsDelta = {
  node?: BookmarkTreeNode,
  added?: Icon[],
  removed?: string[]
}
