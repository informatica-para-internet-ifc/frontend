<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { anos } from '../../../data/disciplinas.js'

const route = useRoute()
const hovered = ref(false)
const clicked = ref(false)
const rootEl = ref(null)

const open = computed(() => hovered.value || clicked.value)

const anosList = Object.entries(anos).map(([id, ano]) => ({
  id,
  label: ano.label,
  desc: ano.desc,
  icon:
    id === '1'
      ? 'mdi-numeric-1-box-outline'
      : id === '2'
        ? 'mdi-numeric-2-box-outline'
        : 'mdi-numeric-3-box-outline',
}))

const onAnoRoute = computed(() => route.path.startsWith('/ano'))

function toggle() {
  clicked.value = !clicked.value
}

function close() {
  clicked.value = false
  hovered.value = false
}

function onDocClick(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) close()
}

function onKey(e) {
  if (e.key === 'Escape') close()
}

watch(() => route.fullPath, () => close())

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="rootEl" class="anosMenu" @mouseenter="hovered = true" @mouseleave="hovered = false">
    <button
      class="anosTrigger"
      :class="{ open, active: onAnoRoute }"
      type="button"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >
      <i class="mdi mdi-school-outline"></i>
      <span>Anos</span>
      <i class="mdi mdi-chevron-down anosChevron"></i>
    </button>

    <Transition name="panel">
      <div v-if="open" class="anosPanel" role="menu">
        <div class="panelTip"></div>

        <div class="panelHeader">
          <span class="panelEyebrow">Curso Técnico</span>
          <span class="panelTitle">Navegue por ano</span>
        </div>

        <div class="panelList">
          <RouterLink
            v-for="ano in anosList"
            :key="ano.id"
            :to="`/ano/${ano.id}`"
            class="panelItem"
            role="menuitem"
            @click="close"
          >
            <span class="itemIcon">
              <i :class="`mdi ${ano.icon}`"></i>
            </span>
            <span class="itemBody">
              <span class="itemLabel">{{ ano.label }}</span>
              <span class="itemDesc">{{ ano.desc }}</span>
            </span>
            <i class="mdi mdi-arrow-right itemArrow"></i>
          </RouterLink>
        </div>

        <RouterLink to="/anos" class="panelFooter" @click="close">
          <span>Ver todos os anos</span>
          <i class="mdi mdi-chevron-right"></i>
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.anosMenu {
  position: relative;
  flex-shrink: 0;
}

/* ── Trigger ── */
.anosTrigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border: none;
  background: transparent;
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: inherit;
  color: var(--color-text-4);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}

.anosTrigger::after {
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

.anosTrigger > i {
  font-size: 1.1rem;
  transition: color var(--duration-fast) var(--ease-out);
}

.anosTrigger:hover {
  color: var(--color-text-1);
}

.anosTrigger:hover::after,
.anosTrigger.open::after,
.anosTrigger.active::after {
  transform: translateX(-50%) scaleX(1);
}

.anosTrigger.open,
.anosTrigger.active {
  color: var(--color-navy-accent);
  font-weight: 600;
}

.anosChevron {
  font-size: 0.9rem !important;
  transition: transform var(--duration-fast) var(--ease-spring) !important;
}

.anosTrigger.open .anosChevron {
  transform: rotate(180deg);
}

/* ── Panel ── */
.anosPanel {
  position: absolute;
  top: calc(100% + var(--sp-3));
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-xl);
  padding: var(--sp-3);
  z-index: 200;
}

.panelTip {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border-2);
  border-top: 1px solid var(--color-border-2);
}

.panelHeader {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--sp-2) var(--sp-3) var(--sp-3);
}

.panelEyebrow {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-navy-accent);
}

.panelTitle {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text-1);
}

/* ── Items ── */
.panelList {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panelItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition:
    background var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.panelItem:hover {
  background: var(--color-navy-accent-muted);
  transform: translateX(2px);
}

.itemIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-3);
  transition:
    background var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.panelItem:hover .itemIcon {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.itemIcon i {
  font-size: 1.15rem;
}

.itemBody {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.itemLabel {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
}

.itemDesc {
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  color: var(--color-text-5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.itemArrow {
  font-size: 1rem;
  color: var(--color-text-5);
  opacity: 0;
  transform: translateX(-6px);
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring),
    color var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.panelItem:hover .itemArrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--color-navy-accent);
}

/* ── Footer ── */
.panelFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--sp-2);
  padding: var(--sp-3);
  border-top: 1px solid var(--color-border-1);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-navy-accent);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}

.panelFooter i {
  transition: transform var(--duration-fast) var(--ease-spring);
}

.panelFooter:hover {
  color: var(--color-navy-accent-hover);
}

.panelFooter:hover i {
  transform: translateX(3px);
}

/* ── Transition ── */
.panel-enter-active {
  transition:
    opacity 0.2s var(--ease-out),
    transform 0.25s var(--ease-spring);
}

.panel-leave-active {
  transition:
    opacity 0.15s var(--ease-out),
    transform 0.15s var(--ease-out);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px) scale(0.98);
}
</style>
