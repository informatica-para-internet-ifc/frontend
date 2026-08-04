import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useIsMobileStore = defineStore('isMobile', () => {
  const BREAKPOINT = 900
  const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINT}px)`)
  const isMobile = ref(mediaQuery.matches)

  function onChange(event) {
    isMobile.value = event.matches
  }

  mediaQuery.addEventListener('change', onChange)

  return { isMobile }
})
