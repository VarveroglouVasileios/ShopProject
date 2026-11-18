import '@fontsource-variable/vollkorn/wght.css'
import '@fontsource-variable/vollkorn/wght-italic.css'
import '@fontsource-variable/source-sans-3/wght.css'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'

createApp(App).use(router).mount('#app')
