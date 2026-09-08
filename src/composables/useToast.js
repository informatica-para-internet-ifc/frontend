import { ref } from 'vue'

const toasts = ref([])
let uid = 0

function dismiss(id) {
  const idx = toasts.value.findIndex((t) => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

function push(message, { type = 'info', duration = 4500 } = {}) {
  const id = ++uid
  toasts.value.push({ id, message, type })
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration)
  }
  return id
}

export function useToast() {
  return {
    toasts,
    dismiss,
    toast: push,
    success: (message, opts) => push(message, { ...opts, type: 'success' }),
    error: (message, opts) => push(message, { ...opts, type: 'error', duration: opts?.duration ?? 6000 }),
    info: (message, opts) => push(message, { ...opts, type: 'info' }),
  }
}
