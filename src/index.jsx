import React from 'react';
import ReactDOM from 'react-dom';

import '@vkontakte/vkui/dist/vkui.css';
import './main.css';

import App from './App';
import bridge from "@vkontakte/vk-bridge";
import {AdaptivityProvider, AppRoot} from "@vkontakte/vkui";

// Init VK  Mini App
bridge.send("VKWebAppInit");

ReactDOM.render(
    <AdaptivityProvider>
        <AppRoot>
            <App />
        </AppRoot>
    </AdaptivityProvider>,
    document.getElementById('root')
);
