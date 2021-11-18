import { Grid } from "../classes/Grid";
import { Icon } from "../classes/Icon";
import { Target } from "../enums/Target";
import { FolderContentsDelta } from "./FolderContentsDelta";

export type Container = {
  id: string,
  nodeId: string,
  type: Target,
  element: HTMLDivElement,
  content: HTMLDivElement,
  grid: Grid,
  node: any,
  
  offsetX: number,
  offsetY: number,

  zIndex: number,

  getIcon: (id: string) => Icon,
  addIcon: (icon: Icon) => void,
  removeIcon: (icon: Icon) => void,
  applyDelta: (delta: FolderContentsDelta) => void,
  focus: () => void,
  unfocus: () => void
}
