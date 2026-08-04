<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLogo from '../ui/logo/AppLogo.vue'
import ThemeToggle from '../ui/themeButton/ThemeToggle.vue'
import SearchButton from '../ui/search/SearchButton.vue'
import UserButton from '../ui/user/UserButton.vue'
import SidebarDrawer from './SidebarDrawer.vue'

const route = useRoute()
const drawerOpen = ref(false)
const scrolled = ref(false)

function close() { drawerOpen.value = false }
function toggleDrawer() { drawerOpen.value = !drawerOpen.value }

function onScroll() {
  scrolled.value = window.scrollY > 8
}

watch(() => route.fullPath, () => close())
watch(drawerOpen, (o) => { document.body.style.overflow = o ? 'hidden' : '' })

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="mobileHeader" :class="{ scrolled }">
    <div class="mobileMainBar">
      <div class="mobileTopAccent"></div>

      <div class="mobileHeaderInner">
        <button
          class="menuBtn"
          :class="{ active: drawerOpen }"
          aria-label="Abrir menu"
          @click="toggleDrawer"
        >
          <span class="menuIcon">
            <span class="menuLine menuLineTop"></span>
            <span class="menuLine menuLineMid"></span>
            <span class="menuLine menuLineBot"></span>
          </span>
        </button>

        <AppLogo small />

        <div class="mobileActions">
          <SearchButton />
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </div>
  </header>

  <SidebarDrawer :open="drawerOpen" @close="close" />
</template>

<style scoped>
.mobileHeader {
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
    border-color var(--duration-normal) var(--ease-out),
    background var(--duration-normal) var(--ease-out);
}

.mobileHeader.scrolled {
  box-shadow: var(--shadow-md), 0 0 60px var(--color-navy-accent-muted);
  border-bottom-color: var(--color-border-2);
}

.mobileMainBar {
  position: relative;
  height: var(--header-h);
  flex-shrink: 0;
}

.mobileTopAccent {
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

.mobileHeader.scrolled .mobileTopAccent {
  opacity: 0.6;
}

.mobileHeaderInner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  height: 100%;
  padding: 0 var(--sp-3) 0 var(--sp-2);
}

.mobileHeaderInner :deep(.brand) {
  justify-content: center;
}

/* ── Animated Hamburger ── */
.menuBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  color: var(--color-text-1);
  transition: all var(--duration-fast) var(--ease-spring);
  flex-shrink: 0;
}

.menuBtn:hover {
  background: var(--color-accent-subtle);
  transform: scale(1.05);
}

.menuBtn:active { transform: scale(0.92); }

.menuIcon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  position: relative;
}

.menuLine {
  display: block;
  width: 20px;
  height: 2px;
  border-radius: 2px;
  background: var(--color-text-1);
  position: absolute;
  left: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.menuLineTop { top: 3px; }
.menuLineMid { top: 9px; width: 14px; }
.menuLineBot { top: 15px; }

.menuBtn.active .menuLineTop {
  top: 9px;
  transform: rotate(45deg);
  width: 20px;
}

.menuBtn.active .menuLineMid {
  opacity: 0;
  transform: translateX(-8px);
}

.menuBtn.active .menuLineBot {
  top: 9px;
  transform: rotate(-45deg);
  width: 20px;
}

.mobileActions {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  flex-shrink: 0;
}
</style>
