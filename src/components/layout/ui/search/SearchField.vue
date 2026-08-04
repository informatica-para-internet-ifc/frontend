<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const q = ref('')
const focused = ref(false)
const inputEl = ref(null)

function focus() {
  inputEl.value?.focus()
}

function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    focus()
  } else if (e.key === 'Escape') {
    inputEl.value?.blur()
  }
}

function submit() {
  const query = q.value.trim() ? { q: q.value.trim() } : {}
  router.push({ name: 'search', query })
  q.value = ''
  inputEl.value?.blur()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="searchField" :class="{ focused }">
    <i class="mdi mdi-magnify searchIcon"></i>
    <input
      ref="inputEl"
      v-model="q"
      type="search"
      class="searchInput"
      placeholder="Buscar matérias, provas, conteúdo..."
      aria-label="Buscar"
      @focus="focused = true"
      @blur="focused = false"
      @keydown.enter.prevent="submit"
    />
    <Transition name="hint">
      <kbd v-if="!focused && !q" class="searchHint">Ctrl K</kbd>
    </Transition>
  </div>
</template>

<style scoped>
.searchField {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  width: 220px;
  height: 38px;
  padding: 0 var(--sp-3);
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-4);
  cursor: text;
  transition:
    width var(--duration-normal) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
  flex-shrink: 0;
}

.searchField:hover {
  background: var(--color-surface-4);
  border-color: var(--color-border-3);
}

.searchField.focused {
  width: 280px;
  background: var(--color-surface);
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.searchIcon {
  font-size: 1.1rem;
  transition: color var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.searchField.focused .searchIcon {
  color: var(--color-navy-accent);
}

.searchInput {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: inherit;
  outline: none;
}

.searchInput::placeholder {
  color: var(--color-text-4);
}

.searchInput::-webkit-search-cancel-button {
  display: none;
}

.searchHint {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-accent-subtle);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-5);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
}

.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.15s var(--ease-out), transform 0.15s var(--ease-out);
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateX(4px);
}
</style>
