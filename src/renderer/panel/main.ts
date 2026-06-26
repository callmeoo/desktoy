import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '../src/assets/theme.css'
import '../src/assets/panel.css'
import PanelApp from '../src/PanelApp.vue'
import { router } from '../src/router'

createApp(PanelApp).use(createPinia()).use(router).mount('#app')
