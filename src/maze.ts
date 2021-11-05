// @ts-ignore
import amaze from 'amazejs';
import {RefObject} from "react";

export interface Position {
  x: number;
  y: number;
}

const SCALE = 8;

interface MazeAdapter {
  width: number;
  height: number;
  get(x: number, y: number): boolean;
}

export class Maze {
  tracker: MazeAdapter;
  playerTrack: Position | undefined = undefined;
  clientTrack: Position | undefined = undefined;

  constructor(tracker: MazeAdapter) {
    this.tracker = tracker;
  }

  static genNew(): Maze {
    const tracker = new amaze.Backtracker(39, 39);
    tracker.generate();
    return new Maze(tracker);
  }

  static fromArray(arr: boolean[][]): Maze {
    return new Maze({
      width: arr.length,
      height: arr[0].length,
      get: (x, y) => arr[x][y]
    })
  }

  renderPlayer(position: Position, canvas: RefObject<HTMLCanvasElement>) {
    this.playerTrack = position;
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.clearRect(0, 0, c.width, c.height);
    this.render(canvas);
    ctx.fillStyle = 'red';
    ctx.fillRect(position.x * SCALE, position.y * SCALE, SCALE, SCALE);
    if (this.clientTrack) {
      ctx.fillStyle = 'blue';
      ctx.fillRect(this.clientTrack.x * SCALE, this.clientTrack.y * SCALE, SCALE, SCALE);
    }
  }

  renderClient(position: Position, canvas: RefObject<HTMLCanvasElement>) {
    this.clientTrack = position;
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.clearRect(0, 0, c.width, c.height);
    this.render(canvas);
    ctx.fillStyle = 'blue';
    ctx.fillRect(position.x * SCALE, position.y * SCALE, SCALE, SCALE);
    if (this.playerTrack) {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.playerTrack.x * SCALE, this.playerTrack.y * SCALE, SCALE, SCALE);
    }
  }

  render(canvas: RefObject<HTMLCanvasElement>) {
    const c = canvas.current;
    if (!c) return;
    c.width = this.tracker.width * SCALE;
    c.height = this.tracker.height * SCALE;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = 'white';
    for (let i = 0; i < this.tracker.width; i++) {
      for (let j = 0; j < this.tracker.height; j++) {
        if (this.tracker.get(i, j)) ctx.fillRect(i * SCALE, j * SCALE, SCALE, SCALE);
      }
    }
    ctx.fillStyle = 'green';
    ctx.fillRect((this.tracker.width - 2) * SCALE, (this.tracker.height - 2) * SCALE, SCALE, SCALE);
  }

  isWin(x: number, y: number) {
    return x === (this.tracker.width - 2) && y === (this.tracker.height - 2);
  }

  checkCollides(x: number, y: number): boolean {
    if (this.clientTrack) {
      return this.clientTrack.x === x && this.clientTrack.y === y;
    }
    if (this.playerTrack) {
      return this.playerTrack.x === x && this.playerTrack.y === y;
    }
    return false;
  }

  checkAndMove(pos: Position, deltas: Position): Position {
    if (deltas.y !== 0) {
      if (deltas.y < 0 && this.tracker.get(pos.x, pos.y - 1) && !this.checkCollides(pos.x, pos.y - 1)) return {x: pos.x, y: pos.y - 1};
      if (deltas.y > 0 && this.tracker.get(pos.x, pos.y + 1) && !this.checkCollides(pos.x, pos.y + 1)) return {x: pos.x, y: pos.y + 1};
    }
    if (deltas.x !== 0) {
      if (deltas.x < 0 && this.tracker.get(pos.x - 1, pos.y) && !this.checkCollides(pos.x - 1, pos.y)) return {x: pos.x - 1, y: pos.y};
      if (deltas.x > 0 && this.tracker.get(pos.x + 1, pos.y) && !this.checkCollides(pos.x + 1, pos.y)) return {x: pos.x + 1, y: pos.y};
    }
    return pos;
  }

  serialize(): boolean[][] {
    const ret: boolean[][] = [];
    for (let i = 0; i < this.tracker.width; i++) {
      const r: boolean[] = [];
      ret.push(r);
      for (let j = 0; j < this.tracker.height; j++) {
        r.push(this.tracker.get(i, j))
      }
    }
    return ret;
  }
}
