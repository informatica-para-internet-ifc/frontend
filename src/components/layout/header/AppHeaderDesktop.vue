<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppLogo from '../ui/logo/AppLogo.vue'
import ThemeToggle from '../ui/themeButton/ThemeToggle.vue'
import SearchField from '../ui/search/SearchField.vue'
import SearchButton from '../ui/search/SearchButton.vue'
import UserButton from '../ui/user/UserButton.vue'
import AnosDropdown from './AnosDropdown.vue'
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
  onScroll()
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
    <div class="mainBar">
      <div class="headerTopAccent"></div>
      <div class="headerBorder"></div>
      <div class="headerProgress" :style="{ '--pct': reading }"></div>

      <div class="headerInner">
        <AppLogo desc="Curso Técnico em Informática" grow />

        <nav class="nav" aria-label="Navegação principal">
          <RouterLink to="/" class="navLink" :class="{ active: isActive('home') }">
            <i class="mdi mdi-home-outline"></i>
            <span>Início</span>
          </RouterLink>

          <AnosDropdown />
        </nav>

        <div class="headerActions">
          <SearchField class="headerSearch" />
          <span class="tip headerSearchCompact" data-tip="Buscar (Ctrl K)">
            <SearchButton />
          </span>

          <div class="actionsDivider" aria-hidden="true"></div>

          <div class="iconGroup">
            <span class="tip" data-tip="Alternar tema">
              <ThemeToggle />
            </span>
            <span class="tip" data-tip="Minha conta">
              <UserButton />
            </span>
          </div>

          <RouterLink v-if="auth.logged" to="/criar-atividade" class="createBtn">
            <div class="createShine"></div>
            <span class="createIcon">
              <i class="mdi mdi-plus"></i>
            </span>
            <span class="createLabel">Criar Atividade</span>
          </RouterLink>
        </div>
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
  display: flex;
  flex-direction: column;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  transition:
    box-shadow var(--duration-normal) var(--ease-out),
    background var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.header.scrolled {
  box-shadow: var(--shadow-md), 0 0 60px var(--color-navy-accent-muted);
  border-bottom-color: var(--color-border-2);
}

/* ── Main Bar ── */
.mainBar {
  position: relative;
  height: var(--header-h);
  flex-shrink: 0;
}

/* ── Top Accent Line ── */
.headerTopAccent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 3;
  background: linear-gradient(90deg, var(--color-navy-accent), transparent 60%);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.header.scrolled .headerTopAccent {
  opacity: 0.6;
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

.header.scrolled .headerBorder::before { opacity: 1; }

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
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-6);
  max-width: var(--max-w);
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--sp-6);
}

.headerInner > * {
  animation: headerItemIn 0.6s var(--ease-out) both;
}

.headerInner > :nth-child(1) { animation-delay: 0.05s; }
.headerInner > :nth-child(2) { animation-delay: 0.1s; }
.headerInner > :nth-child(3) { animation-delay: 0.15s; }

@keyframes headerItemIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Nav ── */
.nav {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex: 1;
  justify-content: center;
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

.navLink::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-navy-accent);
  transition: transform var(--duration-normal) var(--ease-spring);
}

.navLink i {
  font-size: 1.1rem;
  transition:
    transform var(--duration-fast) var(--ease-spring),
    color var(--duration-fast) var(--ease-out);
}

.navLink:hover {
  color: var(--color-text-1);
}

.navLink:hover::after,
.navLink.active::after {
  transform: translateX(-50%) scaleX(1);
}

.navLink:hover i { transform: translateY(-1px); }

.navLink.active {
  color: var(--color-navy-accent);
  font-weight: 600;
}

.navLink.active i {
  color: var(--color-navy-accent);
}

/* ── Actions ── */
.headerActions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--sp-3);
  flex: 1;
  min-width: 0;
}

.actionsDivider {
  width: 1px;
  height: 20px;
  background: var(--color-border-2);
}

.tip.headerSearchCompact {
  display: none;
}

/* ── Tooltips ── */
.tip {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tip::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 9px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  padding: 5px 9px;
  border-radius: 6px;
  background: var(--color-text-1);
  color: var(--color-text-on-accent);
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
  z-index: 300;
}

.tip::before {
  content: '';
  position: absolute;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-bottom-color: var(--color-text-1);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) var(--ease-out);
  z-index: 300;
}

.tip:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.tip:hover::before {
  opacity: 1;
}

.iconGroup {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

/* ── Create Button ── */
.createBtn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 5px var(--sp-4) 5px 5px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-navy), var(--color-navy-light));
  color: #ffffff;
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 12px var(--color-navy-accent-muted);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-spring);
}

.createShine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s var(--ease-out);
}

.createBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--color-navy-accent-muted);
}

.createBtn:hover .createShine {
  left: 200%;
}

.createBtn:active {
  transform: translateY(0) scale(0.97);
  box-shadow: 0 1px 8px var(--color-navy-accent-muted);
}

.createIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.18);
  transition: transform var(--duration-fast) var(--ease-spring);
}

.createBtn:hover .createIcon {
  transform: rotate(90deg) scale(1.1);
}

.createIcon i {
  font-size: 1.05rem;
}

/* ── Responsive ── */
@media (max-width: 1200px) {
  .headerSearch { display: none; }
  .tip.headerSearchCompact { display: inline-flex; }
}

@media (max-width: 1080px) {
  .actionsDivider { display: none; }
}

@media (max-width: 960px) {
  .nav { display: none; }
  .createBtn .createLabel { display: none; }
  .createBtn {
    padding: var(--sp-2);
    justify-content: center;
  }
}
</style>
