import { GridType } from "../enums/GridType.js";
import { Container } from "../types/Container.js";
import { Grid } from "./Grid.js";
import { Icon } from "./Icon.js";

export class GridSnap extends Grid {
  static from(grid: Grid): GridSnap {
    let gridSnap = new GridSnap(grid.container, grid.container.content.scrollWidth, grid.container.content.scrollHeight, grid.cellWidth, grid.cellHeight);
    gridSnap._grid = grid.grid;
    gridSnap.snapIconsToGrid();
    return gridSnap;
  }

  constructor(container: Container, width: number, height: number, cellWidth: number, cellHeight: number) {
    super(container, width, height, cellWidth, cellHeight);
    this._type = GridType.SNAP;
  }

  removeNextEmptyCell(index: number): void {
    for (let i = index; i < this._grid.length; i++) {
      if (this._grid[i] == undefined) {
        this._grid.splice(i, 1);
        return;
      }
    }
  }

  addCell(obj: Icon): void {
    for (let i = 0; i < this._grid.length; i++) {
      if (this._grid[i] == undefined) {
        this._grid[i] = obj;
        this.recalc(i);
        return;
      }
    }
    super.addCell(obj);
  }

  addCellByCoords(obj: Icon, x: number, y: number): void {
    let to = this.getGridIndexFromLocalCoordinates(x, y);
    if (this._grid[to] != undefined) {
      this._grid.splice(to, 0, obj);
      this.removeNextEmptyCell(to);
    } else {
      this._grid[to] = obj;
    }
    this.recalc(to);
  }

  moveCell(obj: Icon, x: number, y: number): void {
    let from = this.getGridIndexFromLocalCoordinates(obj.x, obj.y);
    let to = this.getGridIndexFromLocalCoordinates(x, y);
    if (this._grid[to] != undefined) {
      this._grid[from] = undefined;
      this._grid.splice(to, 0, obj);
      this.removeNextEmptyCell(to);
    } else {
      this._grid[from] = undefined;
      this._grid[to] = obj;
    }
    this.recalc(Math.min(from, to));
  }

  removeCell(x: number, y: number): void {
    let from = this.getGridIndexFromLocalCoordinates(x, y);
    this._grid[from] = undefined;
  }

  snapIconsToGrid() {
    let newGrid: Icon[] = [];
    for (let icon of this._grid) {
      if (icon == undefined) continue;
      let gridIndex = this.getGridIndexFromLocalCoordinates(icon.x, icon.y);
      while (newGrid[gridIndex] != undefined) gridIndex++;
      newGrid[gridIndex] = icon;
    }
    this._grid = newGrid;
    this.recalc(0);
  }

  redefine(width: number, height: number, cellWidth: number = this.cellWidth, cellHeight: number = this.cellHeight): void {
    this.width = width;
    this.height = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this._gridWidth = Math.floor(this.width / this.cellWidth);
    this._gridHeight = Math.floor(this.height / this.cellHeight);
    this.snapIconsToGrid();
  }
}
