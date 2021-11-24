import { Container } from "../types/Container";
import { Position } from "../types/Position";
import { Icon } from "./Icon";
import { GridType } from "../enums/GridType";

export class Grid {
  static hint = document.getElementById("drag-hint");

  static hideHint(): void {
    this.hint.style.display = "none";
  }

  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  protected _gridWidth: number;
  protected _gridHeight: number;
  protected _grid: Icon[];
  protected _container: Container;
  protected _type: GridType;

  constructor(container: Container, width: number, height: number, cellWidth: number, cellHeight: number) {
    this.width = width;
    this.height = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this._gridWidth = Math.floor(this.width / this.cellWidth);
    this._gridHeight = Math.floor(this.height / this.cellHeight);
    this._grid = [];
    this._container = container;
    this._type = undefined;
  }

  get container(): Container {return this._container;}
  get grid(): Icon[] {return this._grid;}
  get type(): GridType {return this._type;}

  get offsetX(): number {return this._container.offsetX;}
  get offsetY(): number {return this._container.offsetY;}

  updateHint(x: number, y: number): void {
    let gridCoords = this.getGridCoordinatesFromLocal(x, y);
    let index = this.getGridIndexFromGridCoordinates(gridCoords.x, gridCoords.y);
    if (index >= this._grid.length && this.type == GridType.STRICT) {
      gridCoords = this.getGridCoordinatesFromIndex(this._grid.length);
    }
    Grid.hint.style.left = (gridCoords.x * this.cellWidth + this.offsetX).toString() + "px";
    Grid.hint.style.top = (gridCoords.y * this.cellHeight + this.offsetY).toString() + "px";
  }

  showHint(x: number, y: number): void {
    this.updateHint(x, y);
    Grid.hint.style.display = "block";
  }

  getGridCoordinatesFromLocal(x: number, y: number): Position {
    x = Math.min(Math.max(0, x), this.width); y = Math.max(0, y);
    let gridX = Math.floor((x / this.cellWidth));
    let gridY = Math.floor(y / this.cellHeight);
    return {'x': gridX, 'y': gridY};
  }

  getGridIndexFromLocalCoordinates(x: number, y: number): number {
    let gridCoords = this.getGridCoordinatesFromLocal(x, y);
    return this.getGridIndexFromGridCoordinates(gridCoords.x, gridCoords.y);
  }

  getGridIndexFromGridCoordinates(x: number, y: number): number {
    return y * this._gridWidth + x;
  }

  getGridCoordinatesFromIndex(n: number): Position {
    let gridX = n % this._gridWidth;
    let gridY = (n - gridX) / this._gridWidth;
    return {'x': gridX, 'y': gridY};
  }

  getCell(x: number, y: number): Icon {
    return this._grid[y * this._gridHeight + x];
  }

  /**
   * Add a new cell to the end of the grid.
   */
  addCell(obj: Icon): void {
    this._grid.push(obj);
    this.recalc(this._grid.length - 1);
  }

  /**
   * Add a new cell to the specified coordinates of the grid.
   */
  addCellByCoords(obj: Icon, x: number, y: number): void {
    let n = Math.min(this._grid.length, this.getGridIndexFromLocalCoordinates(x, y));
    this._grid.splice(n, 0, obj);
    this.recalc(n);
  }

  /**
   * Move a cell with specified object to a new coordinates within the same grid.
   */
  moveCell(obj: Icon, x: number, y: number): void {
    let from = this.getGridIndexFromLocalCoordinates(obj.x, obj.y);
    let to = this.getGridIndexFromLocalCoordinates(x, y);
    if (to <= from) {
      this._grid.splice(to, 0, ...this._grid.splice(from, 1));
      this.recalc(Math.min(from, to));
    } else {
      this._grid.splice(to - 1, 0, ...this._grid.splice(from, 1));
      this.recalc(Math.min(from, to - 1));
    }
  }
  
  /**
   * Remove a cell that lies at specified coordinates.
   */
  removeCell(x: number, y: number): void {
    let n = this.getGridIndexFromLocalCoordinates(x, y);
    this._grid.splice(n, 1);
    this.recalc(n);
  }

  redefine(width: number, height: number, cellWidth: number = this.cellWidth, cellHeight: number = this.cellHeight): void {
    this.width = width;
    this.height = height;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    let gridWidth = Math.floor(width / cellWidth);
    let gridHeight = Math.floor(height / cellHeight);
    this._gridHeight = gridHeight;
    if (gridWidth != this._gridWidth) {
      this._gridWidth = gridWidth;
      this.recalc(0);
    }
  }

  recalc(i: number): void {
    for (i; i < this._grid.length; i++) {
      if (this._grid[i] == undefined) continue;
      let x = i % this._gridWidth * this.cellWidth;
      let y = (i - (i % this._gridWidth)) / this._gridWidth * this.cellHeight;
      this._grid[i].setPosition(x, y);
    }
  }

  sort(): void {
    this._grid.sort((a: Icon, b: Icon): number => {
      let aIndex = this.getGridIndexFromLocalCoordinates(a.x, a.y);
      let bIndex = this.getGridIndexFromLocalCoordinates(b.x, b.y);
      return aIndex - bIndex;
    });
  }
}
