<script setup>
import { RouterLink, useRoute } from 'vue-router'
import AppLogo from '../ui/logo/AppLogo.vue'
import ThemeToggle from '../ui/themeButton/ThemeToggle.vue'
import UserButton from '../ui/user/UserButton.vue'
import { anos } from '../../../data/disciplinas.js'
import { useAuthStore } from '../../../stores/auth.js'

defineProps({ open: Boolean })
const emit = defineEmits(['close'])
const route = useRoute()
const auth = useAuthStore()

function isActive(path) { return route.path === path }

const anosList = Object.entries(anos).map(([id, ano]) => ({
  id, label: ano.label, desc: ano.desc,
  icon: id === '1' ? 'mdi-numeric-1-box-outline' : id === '2' ? 'mdi-numeric-2-box-outline' : 'mdi-numeric-3-box-outline',
}))
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="open" class="sidebarOverlay" @click="emit('close')"></div>
    </Transition>

    <Transition name="drawer">
      <aside v-if="open" class="sidebar">
        <div class="sidebarDots"></div>
        <div class="sidebarBorder"></div>

        <div class="sidebarHeader">
          <AppLogo @click="emit('close')" />
          <button class="closeBtn" aria-label="Fechar menu" @click="emit('close')">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <nav class="sidebarNav">
          <RouterLink to="/" class="sidebarLink" :class="{ active: isActive('/') }" :style="{ '--i': 0 }" @click="emit('close')">
            <i class="mdi mdi-home-outline"></i>
            Início
          </RouterLink>

          <RouterLink to="/anos" class="sidebarLink" :class="{ active: isActive('/anos') }" :style="{ '--i': 1 }" @click="emit('close')">
            <i class="mdi mdi-school-outline"></i>
            Anos
          </RouterLink>

          <RouterLink
            v-for="(ano, i) in anosList" :key="ano.id"
            :to="`/ano/${ano.id}`"
            class="sidebarLink sidebarLinkSub"
            :class="{ active: isActive(`/ano/${ano.id}`) }"
            :style="{ '--i': i + 2 }"
            @click="emit('close')"
          >
            <i :class="`mdi ${ano.icon}`"></i>
            {{ ano.label }}
          </RouterLink>

          <RouterLink to="/buscar" class="sidebarLink" :class="{ active: isActive('/buscar') }" :style="{ '--i': 5 }" @click="emit('close')">
            <i class="mdi mdi-magnify"></i>
            Buscar
          </RouterLink>

          <div class="sidebarDivider" :style="{ '--i': 6 }"></div>

          <RouterLink v-if="auth.logged" to="/criar-atividade" class="sidebarLink sidebarLinkAccent" :class="{ active: isActive('/criar-atividade') }" :style="{ '--i': 7 }" @click="emit('close')">
            <i class="mdi mdi-plus-circle"></i>
            Criar Atividade
          </RouterLink>

        </nav>

        <div class="sidebarFooter">
          <div class="sidebarFooterRow">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sidebarOverlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: var(--color-overlay);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 201;
  width: 300px;
  max-width: 85vw;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Ambient Dots ── */
.sidebarDots {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: radial-gradient(var(--color-navy-accent) 0.5px, transparent 0.5px);
  background-size: 20px 20px;
  opacity: 0.04;
  mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 80% 50% at 50% 0%, black 20%, transparent 70%);
  pointer-events: none;
}

/* ── Animated Border ── */
.sidebarBorder {
  position: absolute;
  right: -1px;
  top: 0;
  bottom: 0;
  width: 1px;
  z-index: 1;
  background: linear-gradient(180deg, transparent 0%, var(--color-border-2) 15%, var(--color-border-2) 85%, transparent 100%);
}

.sidebarBorder::before {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(from 0deg, transparent, var(--color-navy-accent-muted), transparent, var(--color-navy-accent-muted), transparent);
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-out);
  animation: borderSpin 4s linear infinite;
}

@keyframes borderSpin { to { transform: rotate(360deg); } }


/* ── Header ── */
.sidebarHeader {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-5);
  border-bottom: 1px solid var(--color-border-1);
  flex-shrink: 0;
}

.closeBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--color-text-3);
  font-size: 1.3rem;
  transition: all var(--duration-fast) var(--ease-spring);
}

.closeBtn:hover {
  background: var(--color-accent-subtle);
  color: var(--color-text-1);
  transform: rotate(90deg);
}

/* ── Nav ── */
.sidebarNav {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: var(--sp-3);
  overflow-y: auto;
}

.sidebarLink {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text-2);
  text-decoration: none;
  transition: all 0.3s var(--ease-out);
  position: relative;
  overflow: hidden;
  animation: linkEnter 0.4s var(--ease-out) both;
  animation-delay: calc(0.03s * var(--i, 0));
}

@keyframes linkEnter {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

.sidebarLink::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 60%;
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  background: var(--color-navy-accent);
  transition: transform var(--duration-fast) var(--ease-spring);
}

.sidebarLink:hover {
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  padding-left: var(--sp-5);
  transform: translateX(2px);
}

.sidebarLink:hover i {
  transform: scale(1.1);
}

.sidebarLink:hover::before { transform: translateY(-50%) scaleY(1); }

.sidebarLink.active {
  background: var(--color-navy-accent-muted);
  font-weight: 600;
}

.sidebarLink.active::before { transform: translateY(-50%) scaleY(1); }

.sidebarLinkAccent {
  color: #ffffff;
  background: var(--color-navy-accent);
  font-weight: 600;
  box-shadow: 0 1px 4px var(--color-navy-accent-muted);
  transition: all 0.3s var(--ease-out);
}

.sidebarLinkAccent i {
  transition: transform 0.3s var(--ease-spring);
}

.sidebarLinkAccent:hover {
  background: var(--color-navy-accent-hover, var(--color-navy-accent));
  color: #ffffff;
  padding-left: var(--sp-5);
  box-shadow: 0 4px 16px var(--color-navy-accent-muted);
  transform: translateY(-1px);
}

.sidebarLinkAccent:hover i {
  color: #ffffff;
  transform: scale(1.15) rotate(-90deg);
}

.sidebarLinkAccent.active {
  background: var(--color-navy-accent);
  color: #ffffff;
  box-shadow: 0 1px 4px var(--color-navy-accent-muted);
}

.sidebarLinkAccent.active i {
  color: #ffffff;
}

.sidebarLinkAccent::before {
  background: rgba(255, 255, 255, 0.4);
}

.sidebarLinkAccent.active::before { background: #ffffff; }

.sidebarLinkSub {
  padding-left: var(--sp-8);
  font-size: var(--text-sm);
}

.sidebarDivider {
  height: 1px;
  margin: var(--sp-2) var(--sp-4);
  background: linear-gradient(90deg, var(--color-border-1), var(--color-border-2), var(--color-border-1));
}

.sidebarLink i {
  flex-shrink: 0;
  font-size: 1.2rem;
  color: var(--color-text-4);
  transition: transform 0.3s var(--ease-spring), color 0.3s var(--ease-out);
}

.sidebarLinkSub i { font-size: 1rem; }

.sidebarLink:hover i,
.sidebarLink.active i { color: var(--color-navy-accent); }

/* ── Footer ── */
.sidebarFooter {
  position: relative;
  z-index: 2;
  padding: var(--sp-4) var(--sp-5);
  border-top: 1px solid var(--color-border-1);
  flex-shrink: 0;
}

.sidebarFooterRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── Transitions ── */
.overlay-enter-active { transition: opacity 0.25s var(--ease-out); }
.overlay-leave-active { transition: opacity 0.2s var(--ease-out); }
.overlay-enter-from,
.overlay-leave-to { opacity: 0; }

.drawer-enter-active { transition: transform 0.35s var(--ease-out); }
.drawer-leave-active { transition: transform 0.2s var(--ease-out); }
.drawer-enter-from,
.drawer-leave-to { transform: translateX(-100%); }
</style>
