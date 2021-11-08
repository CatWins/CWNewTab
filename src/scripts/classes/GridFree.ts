import { GridType } from "../enums/GridType.js";
import { Container } from "../types/Container.js";
import { Grid } from "./Grid.js";

export class GridFree extends Grid {
  static from(grid: Grid): GridFree {
    let gridFree = new GridFree(grid.container, grid.width, grid.height, grid.cellWidth, grid.cellHeight);
    gridFree._grid = grid.grid;
    return gridFree;
  }

  constructor(container: Container, width: number, height: number, cellWidth: number, cellHeight: number) {
    super(container, width, height, cellWidth, cellHeight);
    this._type = GridType.FREE;
  }

  updateHint() {};
  showHint() {};
  recalc() {};
}
