import {Maze, Position} from "./maze";

class WSBase {
  ws: WebSocket;

  constructor() {
    this.ws = new WebSocket('wss://wss.alesharik.com/');
    setInterval(() => this.ws.send('!ping'), 1000);
  }

  join(id: string) {
    this.ws.send('join:maze_' + id);
  }

  broadcast(message: string) {
    this.ws.send('bcast:' + message);
  }
}

export class ServerWS extends WSBase {
  maze: Maze;
  onClientMove: (pos: Position) => void = () => {}

  constructor(maze: Maze) {
    super();
    this.maze = maze;
    this.ws.onmessage = ev => {
      if (ev.data === 'getfield') {
        const dat = this.maze.serialize();
        this.broadcast('field/' + JSON.stringify(dat));
      } else if (ev.data.startsWith('reqmove/')) {
        const dat: Position = JSON.parse(ev.data.substring(8));
        this.onClientMove(dat);
      }
    }
  }

  moveClient(pos: Position) {
    this.broadcast('move/' + JSON.stringify(pos));
  }

  moveServer(pos: Position) {
    this.broadcast('smove/' + JSON.stringify(pos));
  }

  sendWin(win: 'client' | 'server') {
    this.broadcast('win/' + win);
  }
}

export class ClientWS extends WSBase {
  onMaze: (maze: Maze) => void = () => {};
  onClientMove: (pos: Position) => void = () => {};
  onServerMove: (pos: Position) => void = () => {};
  onWin: (side: 'client' | 'server') => void = () => {};

  constructor() {
    super();
    this.ws.onmessage = ev => {
      if (ev.data.startsWith('move/')) {
        const cut: Position = JSON.parse(ev.data.substring(5));
        this.onClientMove(cut);
      } else if (ev.data.startsWith('smove/')) {
        const cut: Position = JSON.parse(ev.data.substring(6));
        this.onServerMove(cut);
      } else if (ev.data.startsWith('field/')) {
        const cut: boolean[][] = JSON.parse(ev.data.substring(6));
        this.onMaze(Maze.fromArray(cut));
      } else if (ev.data.startsWith('win/')) {
        const side = ev.data.substring(4);
        this.onWin(side);
      }
    }
  }

  reqField() {
    this.broadcast('getfield');
  }

  reqMove(deltas: Position) {
    this.broadcast('reqmove/' + JSON.stringify(deltas));
  }
}
