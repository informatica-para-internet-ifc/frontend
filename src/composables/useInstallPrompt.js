import { ref, computed } from 'vue'

const deferredEvent = ref(null)
const isInstalled = ref(
  typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches,
)

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredEvent.value = e
})

window.addEventListener('appinstalled', () => {
  deferredEvent.value = null
  isInstalled.value = true
})

const canInstall = computed(() => !isInstalled.value && !!deferredEvent.value)

export function useInstallPrompt() {
  async function promptInstall() {
    if (!deferredEvent.value) return
    deferredEvent.value.prompt()
    await deferredEvent.value.userChoice
    deferredEvent.value = null
  }

  return { canInstall, isInstalled, promptInstall }
}
