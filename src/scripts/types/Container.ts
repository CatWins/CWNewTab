import { Grid } from "../classes/Grid";
import { Icon } from "../classes/Icon";
import { Target } from "../enums/Target";
import { BookmarkTreeNode } from "./chrome";
import { FolderContentsDelta } from "./FolderContentsDelta";

export type Container = {
  id: string,
  type: Target,
  content: HTMLDivElement,
  grid: Grid,
  node: BookmarkTreeNode,
  _contents: {[key: string]: Icon};
  isLocked: boolean;
  
  offsetX: number,
  offsetY: number,

  getIcon: (id: string) => Icon,
  addIcon: (icon: Icon) => void,
  removeIcon: (icon: Icon) => void,
  applyDelta: (delta: FolderContentsDelta) => void,
  refreshNode: () => void,
}
