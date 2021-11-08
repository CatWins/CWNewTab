import { GridType } from "../enums/GridType.js";
import { Container } from "../types/Container.js";
import { Grid } from "./Grid.js";

export class GridStrict extends Grid {
  static from(grid: Grid): GridStrict {
    let gridStrict = new GridStrict(grid.container, grid.width, grid.height, grid.cellWidth, grid.cellHeight);
    gridStrict._grid = grid.grid;
    gridStrict._grid = gridStrict._grid.filter(e => e != undefined);
    gridStrict.recalc(0);
    return gridStrict;
  }

  constructor(container: Container, width: number, height: number, cellWidth: number, cellHeight: number) {
    super(container, width, height, cellWidth, cellHeight);
    this._type = GridType.STRICT;
  }
}
