import './themeBridge.js';
import './index.css';
import { AppRegistry } from 'react-native'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

AppRegistry.registerComponent('App', () => App)

const root = createRoot(document.getElementById('root'))
root.render(createElement(App))
