import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.css'
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';

import './demos/ipc'
import { MantineProvider } from '@mantine/core'
import { emotionTransform, MantineEmotionProvider } from '@mantine/emotion'
import { theme } from './theme';
import { Notifications } from '@mantine/notifications';
import TitleBar from './components/Titlebar';
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider stylesTransform={emotionTransform} forceColorScheme='dark' theme={theme}>
      <MantineEmotionProvider>
        <TitleBar />
        <Notifications />
        <App />
      </MantineEmotionProvider>
    </MantineProvider>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
