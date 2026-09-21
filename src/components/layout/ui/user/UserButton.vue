<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../../../stores/auth.js'

const auth = useAuthStore()
</script>

<template>
  <RouterLink to="/perfil" class="userBtn" :class="{ loggedIn: auth.logged }">
    <Transition name="icon" mode="out-in">
      <span v-if="auth.logged" key="avatar" class="userAvatar">U</span>
      <i v-else key="login" class="mdi mdi-login-variant"></i>
    </Transition>
  </RouterLink>
</template>

<style scoped>
.userBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-3);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  flex-shrink: 0;
  position: relative;
}

.userBtn:not(.loggedIn):hover {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  transform: translateY(-1px);
}

.userBtn:not(.loggedIn):active { transform: scale(0.92); }

.userBtn i { font-size: 1.15rem; }

.userBtn.loggedIn {
  background: transparent;
  border-color: transparent;
}

.userBtn.loggedIn::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  z-index: -1;
}

.userBtn.loggedIn:hover::before {
  opacity: 1;
}

.userBtn.loggedIn:hover { transform: scale(1.08); }
.userBtn.loggedIn:active { transform: scale(0.95); }

.userAvatar {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: var(--text-sm);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.icon-enter-active { transition: all 0.2s var(--ease-spring); }
.icon-leave-active { transition: all 0.15s ease-in; }
.icon-enter-from { opacity: 0; transform: scale(0.5) rotate(-90deg); }
.icon-leave-to { opacity: 0; transform: scale(0.5) rotate(90deg); }
</style>
