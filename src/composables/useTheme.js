import { ref, computed, watchEffect } from 'vue'

const stored = localStorage.getItem('sio-theme')
const prefersLight =
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: light)').matches

const theme = ref(stored === 'light' || stored === 'dark' ? stored : prefersLight ? 'light' : 'dark')
const isDark = computed(() => theme.value === 'dark')

const THEME_COLORS = { dark: '#0a0a0a', light: '#fafaf9' }

function applyTheme() {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('sio-theme', theme.value)
  const color = THEME_COLORS[theme.value]
  document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
    el.setAttribute('content', color)
  })
}

applyTheme()

watchEffect(applyTheme)

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, isDark, toggleTheme }
}
