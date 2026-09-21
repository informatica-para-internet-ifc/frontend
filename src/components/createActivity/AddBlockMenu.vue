<script setup>
import { computed, ref } from 'vue'
import { blockCategories, blockTypes } from '../../utils/activityBlocks.js'

defineProps({
  show: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'select'])

const query = ref('')

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const filteredBlockTypes = computed(() => {
  const q = normalizeText(query.value.trim())
  if (!q) return blockTypes
  return blockTypes.filter(
    (bt) => normalizeText(bt.label).includes(q) || normalizeText(bt.desc).includes(q),
  )
})

const groupedBlockTypes = computed(() => {
  const list = filteredBlockTypes.value
  return blockCategories
    .map((cat) => ({ ...cat, items: list.filter((bt) => bt.category === cat.id) }))
    .filter((cat) => cat.items.length > 0)
})

function close() {
  query.value = ''
  emit('close')
}

function select(type) {
  emit('select', type)
  query.value = ''
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="addMenuOverlay" @click.self="close">
      <div class="addMenu animate-scale-in">
        <div class="addMenuHeader">
          <h3>Adicionar bloco</h3>
          <button class="closeMenuBtn" @click="close">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="addMenuSearch">
          <i class="mdi mdi-magnify"></i>
          <input
            v-model="query"
            type="text"
            placeholder="Buscar tipo de bloco..."
            autofocus
          />
        </div>
        <div v-if="!filteredBlockTypes.length" class="addMenuEmpty">
          <i class="mdi mdi-text-search"></i>
          Nenhum tipo de bloco encontrado
        </div>
        <div v-else class="addMenuBody">
          <div v-for="cat in groupedBlockTypes" :key="cat.id" class="addMenuCategory">
            <div class="addMenuCategoryTitle">
              <i :class="`mdi ${cat.icon}`"></i>
              {{ cat.label }}
            </div>
            <div class="addMenuGrid">
              <button
                v-for="bt in cat.items"
                :key="bt.type"
                class="addMenuItem"
                @click="select(bt.type)"
              >
                <div class="addMenuIcon">
                  <i :class="`mdi ${bt.icon}`"></i>
                </div>
                <div class="addMenuText">
                  <span class="addMenuLabel">{{ bt.label }}</span>
                  <span class="addMenuDesc">{{ bt.desc }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.addMenuOverlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-6);
}

.addMenu {
  width: 100%;
  max-width: 700px;
  max-height: min(720px, calc(100vh - 2 * var(--sp-6)));
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.addMenuHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-5) var(--sp-6);
  border-bottom: 1px solid var(--color-border-1);
  flex-shrink: 0;
}

.addMenuHeader h3 {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text-1);
}

.closeMenuBtn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.closeMenuBtn:hover {
  background: var(--color-surface-3);
  color: var(--color-text-1);
}

.addMenuSearch {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-6);
  border-bottom: 1px solid var(--color-border-1);
  flex-shrink: 0;
}

.addMenuSearch i {
  font-size: 1.1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
}

.addMenuSearch input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: var(--text-sm);
  color: var(--color-text-1);
}

.addMenuSearch input::placeholder {
  color: var(--color-text-5);
}

.addMenuEmpty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-10) var(--sp-4);
  color: var(--color-text-5);
  font-size: var(--text-sm);
  text-align: center;
}

.addMenuEmpty i {
  font-size: 1.6rem;
}

.addMenuBody {
  padding: var(--sp-3);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.addMenuCategory + .addMenuCategory {
  margin-top: var(--sp-4);
}

.addMenuCategoryTitle {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-2) var(--sp-2);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-navy-accent);
}

.addMenuCategoryTitle i {
  font-size: 0.95rem;
}

.addMenuGrid {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

@media (min-width: 560px) {
  .addMenuGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sp-1) var(--sp-2);
  }
}

.addMenuItem {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  text-align: left;
}

.addMenuItem:hover {
  background: var(--color-navy-accent-muted);
}

.addMenuIcon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-spring);
}

.addMenuItem:hover .addMenuIcon {
  background: var(--color-navy-accent);
}

.addMenuIcon i {
  font-size: 1.1rem;
  color: var(--color-text-3);
  transition: color var(--duration-fast) var(--ease-out);
}

.addMenuItem:hover .addMenuIcon i {
  color: var(--color-text-on-accent);
}

.addMenuText {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.addMenuLabel {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
}

.addMenuDesc {
  font-size: var(--text-xs);
  color: var(--color-text-5);
}
</style>
