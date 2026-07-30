import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const logged = ref(false)

  function toggle() {
    logged.value = !logged.value
  }

  return { logged, toggle }
})
