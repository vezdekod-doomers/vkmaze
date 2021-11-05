import {CellButton, Group, Input} from "@vkontakte/vkui";
import {useCallback, useEffect, useRef, useState} from "react";
import bridge, {AnyReceiveMethodName, VKBridgeEvent} from "@vkontakte/vk-bridge";
import {Maze, Position} from "./maze";
import {ClientWS} from "./websocket";

function Client() {
  const [win, setWin] = useState<'client' | 'server' | undefined>(undefined);
  const [id, setId] = useState('');
  const [connected, setConnected] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const maze = useRef<Maze>()
  const gyro = useRef<Position>();
  const connect = useCallback((id: string) => {
    gyro.current = {x: 0, y: 0};
    const cl = new ClientWS();
    setConnected(true);
    cl.onClientMove = pos1 => maze.current?.renderClient(pos1, canvas);
    cl.onServerMove = pos1 => maze.current?.renderPlayer(pos1, canvas);
    cl.onMaze = maze1 => {
      maze.current = maze1;
      maze1.render(canvas);
      maze1.renderClient({x: 1, y: 37}, canvas);
      maze1.renderPlayer({x: 1, y: 1}, canvas);
    }
    cl.onWin = side => setWin(side);
    setTimeout(() => {
      cl.join(id);
      cl.reqField();
    }, 300);

    // @ts-ignore
    bridge.send('VKWebAppGyroscopeStart', {refresh_rate: 100});
    bridge.subscribe(({ detail }: VKBridgeEvent<AnyReceiveMethodName>) => {
      if (!detail.data) return;
      const m = maze.current;
      if (!m) return;
      // @ts-ignore
      const gyroDeltas = {x: parseFloat(detail.data.x), y: parseFloat(detail.data.y)};
      const g = gyro.current;
      if (!g) return;
      if (!isNaN(gyroDeltas.y)) g.y += gyroDeltas.y;
      if (!isNaN(gyroDeltas.x)) g.x += gyroDeltas.x;
      if (g.x > 90) g.x = 90;
      if (g.x < -90) g.x = -90;
      if (g.y > 90) g.y = 90;
      if (g.y < -90) g.y = -90;
      let vector = {
        x: Math.floor(g.y / 3),
        y: Math.floor(g.x / 3),
      };
      cl.reqMove(vector);
    });
  }, []);
  return <Group className={'container'}>
    <Input type={'text'} onChange={event => setId(event.target.value)} value={id} />
    <CellButton onClick={() => connect(id)} disabled={connected}>
      Подключиться
    </CellButton>
    <canvas ref={canvas} />
    {win && <h4>{win === 'client' ? 'Вы выиграли' : 'Сервер выиграл'}</h4> }
  </Group>
}

export default Client;
