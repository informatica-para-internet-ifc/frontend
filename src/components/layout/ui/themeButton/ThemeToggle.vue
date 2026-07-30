<script setup>
import { useTheme } from '@/composables/useTheme.js'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="themeBtn"
    :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
    @click="toggleTheme"
  >
    <div class="themeTrack">
      <div class="themeThumb">
        <Transition name="orbit" mode="out-in">
          <i v-if="isDark" key="sun" class="mdi mdi-white-balance-sunny"></i>
          <i v-else key="moon" class="mdi mdi-moon-waning-crescent"></i>
        </Transition>
      </div>
    </div>
  </button>
</template>

<style scoped>
.themeBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  flex-shrink: 0;
  position: relative;
}

.themeBtn:hover {
  border-color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
  transform: scale(1.05);
}

.themeBtn:active { transform: scale(0.92); }

.themeTrack {
  display: flex;
  align-items: center;
  justify-content: center;
}

.themeThumb {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
  font-size: 1.05rem;
  transition: color var(--duration-fast) var(--ease-out);
}

.themeBtn:hover .themeThumb { color: var(--color-navy-accent); }

/* Orbital transition */
.orbit-enter-active { transition: all 0.3s var(--ease-spring); }
.orbit-leave-active { transition: all 0.15s ease-in; }
.orbit-enter-from { opacity: 0; transform: scale(0.3) rotate(-180deg); }
.orbit-leave-to { opacity: 0; transform: scale(0.3) rotate(180deg); }
</style>
