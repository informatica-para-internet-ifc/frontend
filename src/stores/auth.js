import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '../api/client.js'

const STORAGE_KEY = 'sio-user'

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

function normalizeUser(me, email) {
  const nome = me?.name || email?.split('@')[0] || ''
  return {
    id: me?.id,
    email: me?.email || email,
    nome,
    avatar: (nome || email || 'U').charAt(0).toUpperCase(),
  }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref(loadSession())
  const user = computed(() => session.value?.user || null)
  const isLoggedIn = computed(() => !!session.value?.user)
  const logged = computed(() => isLoggedIn.value)

  async function login(email, password) {
    if (!email || !password) return false

    try {
      const data = await request('/api/token/', { method: 'POST', body: { email, password } })
      const base = {
        token: data.access,
        refresh: data.refresh,
        user: normalizeUser(null, email),
      }
      session.value = base
      saveSession(base)

      try {
        const me = await request('/api/usuarios/me/')
        const next = { ...base, user: normalizeUser(me, email) }
        session.value = next
        saveSession(next)
      } catch {
        // token obtido é suficiente; perfil é opcional
      }
      return true
    } catch {
      return false
    }
  }

  function logout() {
    session.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return { session, user, isLoggedIn, logged, login, logout }
})
