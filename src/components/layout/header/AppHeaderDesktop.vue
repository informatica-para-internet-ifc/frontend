<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppLogo from '../ui/logo/AppLogo.vue'
import ThemeToggle from '../ui/themeButton/ThemeToggle.vue'
import SearchButton from '../ui/search/SearchButton.vue'
import UserButton from '../ui/user/UserButton.vue'
import { useAuthStore } from '../../../stores/auth.js'

const route = useRoute()
const auth = useAuthStore()
const scrolled = ref(false)
const reading = ref(0)

function onScroll() {
  scrolled.value = window.scrollY > 8
  const max = document.documentElement.scrollHeight - window.innerHeight
  reading.value = max > 0 ? Math.min(window.scrollY / max, 1) : 0
}

function isActive(name) {
  return route.name === name
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    class="header"
    :class="{ scrolled }"
  >
    <div class="headerBorder"></div>
    <div class="headerProgress" :style="{ '--pct': reading }"></div>

    <div class="headerInner">
      <AppLogo desc="Curso Técnico em Informática" grow />

      <nav class="nav">
        <RouterLink to="/" class="navLink" :class="{ active: isActive('home') }">
          <i class="mdi mdi-home-outline"></i>
          <span>Início</span>
        </RouterLink>
        <RouterLink to="/anos" class="navLink" :class="{ active: isActive('anos') }">
          <i class="mdi mdi-school-outline"></i>
          <span>Anos</span>
        </RouterLink>
      </nav>

      <div class="headerActions">
        <RouterLink v-if="auth.logged" to="/criar-atividade" class="createBtn">
          <div class="createShine"></div>
          <i class="mdi mdi-plus"></i>
          <span>Criar Atividade</span>
        </RouterLink>

        <SearchButton />
        <ThemeToggle />
        <UserButton />
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-h);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  transition:
    height var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    background var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.header.scrolled {
  height: 56px;
  box-shadow: var(--shadow-md), 0 0 60px var(--color-navy-accent-muted);
  border-bottom-color: var(--color-border-2);
}

/* ── Animated Border ── */
.headerBorder {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  z-index: 1;
  background: linear-gradient(90deg, transparent 0%, var(--color-border-2) 15%, var(--color-border-2) 85%, transparent 100%);
}

.headerBorder::before {
  content: '';
  position: absolute;
  inset: 0;
  background: conic-gradient(from var(--angle, 0deg), transparent, var(--color-navy-accent-muted), transparent, var(--color-navy-accent-muted), transparent);
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-out);
  animation: borderSpin 4s linear infinite;
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes borderSpin { to { --angle: 360deg; } }


/* ── Reading Progress ── */
.headerProgress {
  position: absolute;
  bottom: -1px;
  left: 0;
  z-index: 2;
  height: 1px;
  width: calc(var(--pct, 0) * 100%);
  background: var(--color-navy-accent);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.header.scrolled .headerProgress { opacity: 1; }

/* ── Inner ── */
.headerInner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--max-w);
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--sp-6);
}

/* ── Nav ── */
.nav {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  flex-shrink: 0;
}

.navLink {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-4);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.navLink i {
  font-size: 1.1rem;
  transition: transform var(--duration-fast) var(--ease-spring), color var(--duration-fast) var(--ease-out);
}

.navLink:hover { color: var(--color-text-1); }
.navLink:hover i { transform: translateY(-1px); }

.navLink.active {
  color: var(--color-navy-accent);
  font-weight: 600;
}

.navLink.active i {
  color: var(--color-navy-accent);
}

.navLink.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--sp-2);
  right: var(--sp-2);
  height: 2px;
  border-radius: 2px;
  background: var(--color-navy-accent);
  animation: lineIn 0.25s var(--ease-out) both;
}

@keyframes lineIn {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}

/* ── Actions ── */
.headerActions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

/* ── Create Button ── */
.createBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-4);
  padding-right: var(--sp-5);
  border-radius: var(--radius-full);
  background: var(--color-navy-accent);
  color: #ffffff;
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 12px var(--color-navy-accent-muted);
  transition: all var(--duration-normal) var(--ease-spring);
}

.createBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 24px var(--color-navy-accent-muted);
}

.createBtn:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 1px 8px var(--color-navy-accent-muted);
}

.createBtn i {
  font-size: 1.2rem;
  transition: transform var(--duration-fast) var(--ease-spring);
}

.createBtn:hover i { transform: rotate(90deg) scale(1.1); }

/* ── Responsive ── */
@media (max-width: 720px) {
  .nav { display: none; }
  .createBtn span { display: none; }
  .createBtn {
    padding: var(--sp-2);
    min-width: 38px;
    justify-content: center;
  }
}
</style>
