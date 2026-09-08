import './assets/css/reset.css'
import './assets/css/theme.css'
import '@mdi/font/css/materialdesignicons.css'

import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.js'
import { initCatalog, refreshAtividades } from './data/disciplinas.js'
import vReveal from './directives/vReveal.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.directive('reveal', vReveal)

const auth = useAuthStore(pinia)
watch(
  () => auth.isLoggedIn,
  () => {
    refreshAtividades()
  },
)

initCatalog()

app.mount('#app')
