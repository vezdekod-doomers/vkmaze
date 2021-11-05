import {Group} from "@vkontakte/vkui";
import {useEffect, useRef, useState} from "react";
import bridge, {AnyReceiveMethodName, VKBridgeEvent} from "@vkontakte/vk-bridge";
import {Maze, Position} from "./maze";
import {ServerWS} from "./websocket";

function Server() {
  const [win, setWin] = useState<'client' | 'server' | undefined>(undefined);
  const canvas = useRef<HTMLCanvasElement>(null);
  const maze = useRef<Maze>()
  const posRef = useRef<Position>();
  const clPosRef = useRef<Position>();
  const gyro = useRef<Position>();
  const [pos, setPos] = useState<Position>({x: 1, y: 1})
  const [clPos, setClPos] = useState<Position>({x: 1, y: 37});
  const [id, setId] = useState('');
  useEffect(() => {
    posRef.current = pos;
    maze.current?.renderPlayer(pos, canvas);
  }, [pos]);
  useEffect(() => {
    clPosRef.current = clPos;
    maze.current?.renderClient(clPos, canvas);
  }, [clPos]);
  useEffect(() => {
    const m = Maze.genNew();
    maze.current = m;
    gyro.current = {x: 0, y: 0};
    m.render(canvas);
    if (posRef.current) {
      m.renderPlayer(posRef.current, canvas);
    }
    if (clPosRef.current) {
      m.renderClient(clPosRef.current, canvas);
    }
    const serv = new ServerWS(m);
    serv.onClientMove = pos1 => {
      const r = clPosRef.current;
      if (!r) return;
      let newPos = m.checkAndMove(r, pos1);
      setClPos(newPos);
      if (m.isWin(newPos.x, newPos.y)) {
        setWin('client');
        serv.sendWin('client');
      }
      serv.moveClient(newPos);
    }
    setTimeout(() => {
      const i = (Math.random() + 1).toString(36).substring(2);
      serv.join(i);
      setId(i);
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
      const lastPos = posRef.current;
      if (!lastPos) return;
      let vector = {
        x: Math.floor(g.y / 3),
        y: Math.floor(g.x / 3),
      };
      const r = posRef.current;
      if (!r) return;
      let newPos = m.checkAndMove(r, vector);
      serv.moveServer(newPos);
      if (m.isWin(newPos.x, newPos.y)) {
        setWin('server');
        serv.sendWin('server');
      }
      setPos(newPos);
    });
  }, []);
  return <Group className={'container'}>
    <h3>{id}</h3>
    <canvas ref={canvas} />
    {win && <h4>{win === 'client' ? 'Клиент выиграл' : 'Вы выиграли'}</h4> }
  </Group>
}

export default Server;
