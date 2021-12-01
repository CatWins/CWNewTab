import { GridType } from "../enums/GridType.js";
import { Container } from "../types/Container.js";
import { Grid } from "./Grid.js";
import { Icon } from "./Icon.js";

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

  addCell(obj: Icon): void {
    if (obj.x < 0 || obj.y < 0) {
      let gridCoords = this.getGridCoordinatesFromIndex(this._grid.length);
      let x = gridCoords.x * this.cellWidth;
      let y = gridCoords.y * this.cellHeight;
      obj.setPosition(x, y);
    }
    super.addCell(obj);
  }

  updateHint() {};
  showHint() {};
  recalc() {};
}
