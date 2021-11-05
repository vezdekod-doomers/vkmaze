import {Root, View, Panel, Group, CellButton} from "@vkontakte/vkui";
import {useState} from "react";
import Server from "./Server";
import Client from "./Client";

function App() {
    const [view, setView] = useState('main');
    return <Root activeView={view}>
        <View activePanel={'main'} id={'main'}>
            <Panel id={'main'}>
                <Group>
                    <h3>Режим работы</h3>
                    <CellButton onClick={() => setView('server')}>Сервер</CellButton>
                    <CellButton onClick={() => setView('client')}>Клиент</CellButton>
                </Group>
            </Panel>
        </View>
        <View activePanel={'server'} id={'server'}>
            <Panel id={'server'}>
                <Server />
            </Panel>
        </View>
        <View activePanel={'client'} id={'client'}>
            <Panel id={'client'}>
                <Client />
            </Panel>
        </View>
    </Root>
}

export default App;
