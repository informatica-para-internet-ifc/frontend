<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { searchAtividades, anos } from '../data/disciplinas.js'

const route = useRoute()
const router = useRouter()

const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedAno = ref(typeof route.query.ano === 'string' ? route.query.ano : '')
const selectedDisc = ref(typeof route.query.disciplina === 'string' ? route.query.disciplina : '')
const inputEl = ref(null)
const isFocused = ref(false)
const showFilters = ref(false)

const anosList = Object.entries(anos).map(([id, ano]) => ({
  id,
  label: ano.label,
  desc: ano.desc,
  icon: id === '1' ? 'mdi-numeric-1-box' : id === '2' ? 'mdi-numeric-2-box' : 'mdi-numeric-3-box',
  disciplinas: ano.disciplinas,
}))

const disciplinasFiltro = computed(() => {
  const ano = anos[selectedAno.value]
  if (ano) return ano.disciplinas
  return anosList.flatMap((a) => a.disciplinas)
})

const hasTextSearch = computed(() => searchQuery.value.trim().length > 0)
const hasFilters = computed(() => hasTextSearch.value || !!selectedAno.value || !!selectedDisc.value)
const activeFilterCount = computed(() => [selectedAno.value, selectedDisc.value].filter(Boolean).length)
const filterKey = computed(() => `${searchQuery.value.trim()}|${selectedAno.value}|${selectedDisc.value}`)

const results = computed(() =>
  searchAtividades(searchQuery.value, {
    anoId: selectedAno.value,
    disciplinaId: selectedDisc.value,
  }),
)

function applyFilters() {
  const query = {}
  const q = searchQuery.value.trim()
  if (q) query.q = q
  if (selectedAno.value) query.ano = selectedAno.value
  if (selectedDisc.value) query.disciplina = selectedDisc.value
  router.replace({ query })
}

function doSearch() {
  applyFilters()
}

function selectAno(id) {
  selectedAno.value = id
  if (id) {
    const alvo = anosList.find((a) => a.id === id)
    if (selectedDisc.value && alvo && !alvo.disciplinas.some((d) => d.id === selectedDisc.value)) {
      selectedDisc.value = ''
    }
  }
  applyFilters()
}

function selectDisc(id) {
  selectedDisc.value = id
  applyFilters()
}

function clearSearch() {
  searchQuery.value = ''
  selectedAno.value = ''
  selectedDisc.value = ''
  applyFilters()
  inputEl.value?.focus()
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlight(text) {
  const q = searchQuery.value.trim()
  if (!q || !text) return text
  const safe = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const re = new RegExp(`(${escapeRegExp(q)})`, 'gi')
  return safe.replace(re, '<mark class="hl">$1</mark>')
}

function isEditable(el) {
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)
}

function onKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputEl.value?.focus()
  } else if (e.key === '/' && !isEditable(e.target)) {
    e.preventDefault()
    inputEl.value?.focus()
  } else if (e.key === 'Escape' && isFocused.value) {
    inputEl.value?.blur()
  }
}

watch(
  () => route.query,
  (query) => {
    const q = typeof query.q === 'string' ? query.q : ''
    const ano = typeof query.ano === 'string' ? query.ano : ''
    const disc = typeof query.disciplina === 'string' ? query.disciplina : ''
    if (q !== searchQuery.value) searchQuery.value = q
    if (ano !== selectedAno.value) selectedAno.value = ano
    if (disc !== selectedDisc.value) selectedDisc.value = disc
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  if (!isTouch) inputEl.value?.focus()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="searchView">
    <div class="pageDeco">
      <div class="pageDecoDots"></div>
      <div class="pageDecoGrid"></div>
    </div>

    <div class="searchContent">
      <div class="searchHero animate-fade-in-up">
        <div class="heroIcon" :class="{ focused: isFocused }">
          <i class="mdi mdi-magnify"></i>
        </div>
        <h1 class="heroTitle">Buscar</h1>
        <p class="heroDesc">
          Pesquise atividades por nome ou conteúdo e refine os resultados por ano e matéria.
        </p>
      </div>

      <form class="searchBar animate-fade-in-up delay-1" @submit.prevent="doSearch">
        <div class="searchInputWrap" :class="{ focused: isFocused }">
          <i class="mdi mdi-magnify searchIcon"></i>
          <input
            ref="inputEl"
            v-model="searchQuery"
            type="text"
            class="searchInput"
            placeholder="Buscar atividades..."
            @focus="isFocused = true"
            @blur="isFocused = false"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="clearBtn"
            aria-label="Limpar busca"
            @click="clearSearch"
          >
            <i class="mdi mdi-close"></i>
          </button>
          <kbd v-if="!searchQuery" class="shortcutHint">Ctrl K</kbd>
        </div>

        <div class="filterToggleRow">
          <button
            type="button"
            class="filterToggleBtn"
            :class="{ active: activeFilterCount > 0, open: showFilters }"
            :aria-expanded="showFilters"
            @click="showFilters = !showFilters"
          >
            <i class="mdi mdi-tune"></i>
            Filtros
            <span v-if="activeFilterCount" class="filterToggleCount">{{ activeFilterCount }}</span>
            <i class="mdi mdi-chevron-down filterToggleChevron"></i>
          </button>
          <span v-if="activeFilterCount" class="filterToggleHint">
            Refinando por ano e matéria
          </span>
        </div>

        <div v-if="showFilters" class="filterGroups animate-slide-down">
          <div class="filterGroup">
            <span class="filterLabel"><i class="mdi mdi-calendar-star"></i> Ano</span>
            <div class="chipRow">
              <button
                type="button"
                class="filterChip"
                :class="{ active: !selectedAno }"
                @click="selectAno('')"
              >
                Todos
              </button>
              <button
                v-for="a in anosList"
                :key="a.id"
                type="button"
                class="filterChip"
                :class="{ active: selectedAno === a.id }"
                @click="selectAno(a.id)"
              >
                <i :class="`mdi ${a.icon}`"></i>
                {{ a.label }}
              </button>
            </div>
          </div>

          <div class="filterGroup">
            <span class="filterLabel"><i class="mdi mdi-book-open-variant"></i> Matéria</span>
            <div class="chipRow">
              <button
                type="button"
                class="filterChip"
                :class="{ active: !selectedDisc }"
                @click="selectDisc('')"
              >
                Todas
              </button>
              <button
                v-for="d in disciplinasFiltro"
                :key="d.id"
                type="button"
                class="filterChip"
                :class="{ active: selectedDisc === d.id }"
                @click="selectDisc(d.id)"
              >
                <i :class="`mdi ${d.icon}`"></i>
                {{ d.name }}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div v-if="hasFilters" class="searchResults animate-fade-in-up delay-2">
        <div class="resultsHeader">
          <span class="resultsCount">
            <i class="mdi mdi-format-list-bulleted"></i>
            {{ results.length }} atividade{{ results.length !== 1 ? 's' : '' }}
          </span>
          <div class="resultsHeaderActions">
            <span v-if="activeFilterCount" class="activeFilterPill">
              <i class="mdi mdi-tune"></i>
              {{ activeFilterCount }}
            </span>
            <button class="clearSearchBtn" type="button" @click="clearSearch">
              <i class="mdi mdi-close"></i>
              Limpar
            </button>
          </div>
        </div>

        <div v-if="results.length" :key="filterKey" class="resultsList">
          <RouterLink
            v-for="(r, idx) in results"
            :key="`${r.disciplina.id}-${r.atividade.id}`"
            :to="`/atividade/${r.disciplina.id}/${r.atividade.id}`"
            class="resultItem"
            v-reveal.left="idx % 8"
          >
            <div class="resultLeft">
              <div class="resultIcon">
                <i :class="`mdi ${r.disciplina.icon}`"></i>
              </div>
              <div class="resultInfo">
                <span class="resultBreadcrumb">
                  <i class="mdi mdi-folder-outline"></i>
                  {{ r.anoLabel }} / {{ r.disciplina.name }}
                </span>
                <h3 class="resultTitle" v-html="highlight(r.atividade.title)"></h3>
                <p class="resultDesc" v-html="highlight(r.atividade.desc)"></p>
                <div class="resultTags">
                  <span class="resultTag">
                    <i class="mdi mdi-cube-outline"></i>
                    {{ r.atividade.blocks?.length || 0 }} blocos
                  </span>
                  <span v-if="(r.atividade.questoes || []).length" class="resultTag">
                    <i class="mdi mdi-help-circle-outline"></i>
                    {{ r.atividade.questoes.length }} questões
                  </span>
                </div>
              </div>
            </div>
            <i class="mdi mdi-arrow-right resultArrow"></i>
          </RouterLink>
        </div>

        <div v-else class="emptyResult">
          <div class="emptyIcon">
            <i class="mdi mdi-text-search"></i>
          </div>
          <h3>Nenhum resultado</h3>
          <p>
            Não encontramos atividades para essa combinação. Tente outros termos ou ajuste os
            filtros de ano e matéria.
          </p>
          <button class="emptyClearBtn" type="button" @click="clearSearch">
            <i class="mdi mdi-close"></i>
            Limpar busca e filtros
          </button>
        </div>
      </div>

      <div v-else class="browseSection animate-fade-in-up delay-2">
        <h2 class="sectionTitle">Navegar por Ano</h2>
        <p class="browseHint">
          Ou clique em Filtros para listar as atividades de um ano ou de uma matéria.
        </p>

        <div class="anosGrid">
          <div v-for="(ano, idx) in anosList" :key="ano.id" class="anoBlock" v-reveal="idx">
            <RouterLink :to="`/ano/${ano.id}`" class="anoHeader">
              <div class="anoIcon">
                <i :class="`mdi ${ano.icon}`"></i>
              </div>
              <div class="anoInfo">
                <h3 class="anoLabel">{{ ano.label }}</h3>
                <p class="anoDesc">{{ ano.desc }}</p>
              </div>
              <i class="mdi mdi-chevron-right anoArrow"></i>
            </RouterLink>

            <div class="disciplinasList">
              <RouterLink
                v-for="disc in ano.disciplinas"
                :key="disc.id"
                :to="`/disciplina/${ano.id}/${disc.id}`"
                class="discLink"
              >
                <i :class="`mdi ${disc.icon}`"></i>
                <span>{{ disc.name }}</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.searchView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.searchContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: var(--sp-10) var(--sp-6);
}

.searchHero {
  text-align: center;
  margin-bottom: var(--sp-8);
}

.heroIcon {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--sp-6);
  transition: all var(--duration-normal) var(--ease-spring);
}

.heroIcon::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: calc(var(--radius-xl) + 10px);
  border: 1.5px solid var(--color-navy-accent);
  opacity: 0;
  transform: scale(0.82);
  transition: all var(--duration-normal) var(--ease-spring);
  pointer-events: none;
}

.heroIcon.focused {
  background: var(--color-navy-accent);
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 32px var(--color-navy-accent-muted);
  transform: scale(1.08);
}

.heroIcon.focused::before {
  opacity: 0.45;
  transform: scale(1);
  animation: heroPulse 2.2s var(--ease-out) infinite;
}

@keyframes heroPulse {
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.12; transform: scale(1.1); }
}

.heroIcon i {
  font-size: 2rem;
  color: var(--color-navy-accent);
  transition: all var(--duration-normal) var(--ease-spring);
}

.heroIcon.focused i {
  color: var(--color-text-on-accent);
  transform: scale(1.1);
}

.heroTitle {
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-3);
}

.heroDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  max-width: 420px;
  margin: 0 auto;
}

.searchBar {
  max-width: 720px;
  margin: 0 auto var(--sp-10);
}

.searchInputWrap {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 2px solid var(--color-border-1);
  transition: all var(--duration-normal) var(--ease-spring);
}

.searchInputWrap.focused {
  border-color: var(--color-navy-accent);
  background: var(--color-surface);
  box-shadow: 0 0 0 4px var(--color-navy-accent-muted), var(--shadow-lg);
}

.searchIcon {
  font-size: 1.3rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: color var(--duration-fast) var(--ease-out);
}

.searchInputWrap.focused .searchIcon {
  color: var(--color-navy-accent);
}

.searchInput {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--text-base);
  color: var(--color-text-1);
  font-family: var(--font-sans);
}

.searchInput::placeholder {
  color: var(--color-text-5);
}

.shortcutHint {
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--color-accent-subtle);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-5);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
}

.searchInputWrap.focused .shortcutHint {
  opacity: 0;
}

@media (hover: none) and (pointer: coarse) {
  .shortcutHint {
    display: none;
  }
}

.clearBtn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-surface-4);
  border: none;
  color: var(--color-text-4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  flex-shrink: 0;
}

.clearBtn:hover {
  background: var(--color-danger-muted);
  color: var(--color-danger);
  transform: scale(1.1);
}

/* ── Filtros (ano / matéria) ── */
.filterGroups {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-top: var(--sp-4);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--color-border-1);
}

.filterGroup {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
}

.filterLabel {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding-top: 7px;
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-text-5);
  white-space: nowrap;
}

.filterLabel i {
  font-size: 0.85rem;
  color: var(--color-navy-accent);
}

.chipRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.filterChip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-3);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
}

.filterChip i {
  font-size: 0.9rem;
  color: var(--color-text-5);
  transition: color var(--duration-fast) var(--ease-out);
}

.filterChip:hover {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--color-navy-accent-muted);
}

.filterChip:hover i {
  color: var(--color-navy-accent);
}

.filterChip:active {
  transform: translateY(0) scale(0.96);
}

.filterChip.active {
  background: var(--color-navy-accent);
  border-color: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  box-shadow: 0 3px 12px var(--color-navy-accent-muted);
}

.filterChip.active i {
  color: var(--color-text-on-accent);
}

/* ── Botão de filtros ── */
.filterToggleRow {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-top: var(--sp-4);
}

.filterToggleBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-3);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
}

.filterToggleBtn > i {
  font-size: 0.95rem;
}

.filterToggleBtn:hover {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--color-navy-accent-muted);
}

.filterToggleBtn:active {
  transform: translateY(0) scale(0.97);
}

.filterToggleBtn.active {
  background: var(--color-navy-accent);
  border-color: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  box-shadow: 0 3px 12px var(--color-navy-accent-muted);
}

.filterToggleBtn.active:hover {
  color: var(--color-text-on-accent);
  box-shadow: 0 4px 16px var(--color-navy-accent-muted);
}

.filterToggleCount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 0.68rem;
  font-weight: 700;
}

.filterToggleBtn.active .filterToggleCount {
  background: rgba(255, 255, 255, 0.22);
  color: var(--color-text-on-accent);
}

.filterToggleChevron {
  margin-left: 2px;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.filterToggleBtn.open .filterToggleChevron {
  transform: rotate(180deg);
}

.filterToggleHint {
  font-size: var(--text-xs);
  color: var(--color-text-5);
}

.searchResults {
  max-width: 720px;
  margin: 0 auto;
}

.resultsHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-4);
}

.resultsHeaderActions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.resultsCount {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-4);
}

.resultsCount i {
  font-size: 1rem;
  color: var(--color-navy-accent);
}

.activeFilterPill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: var(--text-xs);
  font-weight: 600;
}

.activeFilterPill i {
  font-size: 0.8rem;
}

.clearSearchBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-full);
  background: transparent;
  border: 1px solid var(--color-border-2);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
}

.clearSearchBtn:hover {
  background: var(--color-danger-muted);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.resultsList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.resultItem {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
}

.resultItem::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--color-navy-accent), var(--color-navy-accent-hover));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.resultItem::after {
  content: '';
  position: absolute;
  top: 0;
  left: -80%;
  width: 40%;
  height: 100%;
  background: linear-gradient(105deg, transparent, var(--color-navy-accent-muted), transparent);
  transform: skewX(-18deg);
  transition: left 0.55s var(--ease-out);
  pointer-events: none;
}

.resultItem:hover {
  background: var(--color-surface-3);
  border-color: var(--color-border-2);
  transform: translateX(4px) translateY(-2px);
  box-shadow: var(--shadow-md), 0 4px 24px var(--color-navy-accent-muted);
}

.resultItem:hover::before {
  transform: scaleY(1);
}

.resultItem:hover::after {
  left: 140%;
}

.resultLeft {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-4);
  min-width: 0;
  flex: 1;
}

.resultIcon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.resultIcon i {
  font-size: 1.1rem;
  color: var(--color-navy-accent);
}

.resultItem:hover .resultIcon {
  background: var(--color-navy-accent);
}

.resultItem:hover .resultIcon i {
  color: var(--color-text-on-accent);
}

.resultInfo {
  min-width: 0;
  flex: 1;
}

.resultBreadcrumb {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-navy-accent);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  margin-bottom: var(--sp-1);
}

.resultBreadcrumb i {
  font-size: 0.75rem;
}

.resultTitle {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: var(--sp-1);
}

.resultDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-normal);
}

.resultTags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-top: var(--sp-2);
}

.resultTag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-1);
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-5);
  transition: all var(--duration-fast) var(--ease-spring);
}

.resultTag i {
  font-size: 0.75rem;
}

.resultItem:hover .resultTag {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-border-2);
  color: var(--color-navy-accent);
}

.resultTitle :deep(.hl),
.resultDesc :deep(.hl) {
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 600;
}

.resultArrow {
  font-size: 1.2rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.resultItem:hover .resultArrow {
  color: var(--color-navy-accent);
  transform: translateX(4px);
}

.emptyResult {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  text-align: center;
  padding: var(--sp-16) var(--sp-6);
}

.emptyIcon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px dashed var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.emptyIcon i {
  font-size: 2rem;
  color: var(--color-text-5);
  animation: emptyFloat 3s var(--ease-in-out) infinite;
}

@keyframes emptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.emptyResult h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
}

.emptyResult p {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  max-width: 440px;
}

.emptyClearBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  border: 1px solid transparent;
  color: var(--color-navy-accent);
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  margin-top: var(--sp-2);
}

.emptyClearBtn:hover {
  background: var(--color-danger-muted);
  border-color: var(--color-danger);
  color: var(--color-danger);
  transform: translateY(-1px);
}

.browseSection {
  max-width: 720px;
  margin: 0 auto;
}

.sectionTitle {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
  margin-bottom: var(--sp-6);
  text-align: center;
}

.browseHint {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  text-align: center;
  margin-top: calc(var(--sp-2) * -1);
  margin-bottom: var(--sp-6);
}

.anosGrid {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.anoBlock {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  transition: all var(--duration-normal) var(--ease-spring);
}

.anoBlock::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--color-navy-accent),
    var(--color-navy-accent-hover),
    var(--color-navy-accent)
  );
  background-size: 200% 100%;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-normal) var(--ease-spring);
  z-index: 1;
}

.anoBlock:hover {
  border-color: var(--color-border-2);
  box-shadow: var(--shadow-md), 0 4px 24px var(--color-navy-accent-muted);
  transform: translateY(-2px);
}

.anoBlock:hover::before {
  transform: scaleX(1);
}

.anoHeader {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  text-decoration: none;
  transition: background var(--duration-fast) var(--ease-out);
}

.anoHeader:hover {
  background: var(--color-surface-3);
}

.anoIcon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-navy-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.anoIcon i {
  font-size: 1.4rem;
  color: var(--color-text-on-accent);
}

.anoHeader:hover .anoIcon {
  transform: scale(1.05);
}

.anoInfo {
  flex: 1;
  min-width: 0;
}

.anoLabel {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
  margin-bottom: var(--sp-1);
}

.anoDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-normal);
}

.anoArrow {
  font-size: 1.3rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.anoHeader:hover .anoArrow {
  color: var(--color-navy-accent);
  transform: translateX(4px);
}

.disciplinasList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1px;
  background: var(--color-border-1);
  border-top: 1px solid var(--color-border-1);
}

.discLink {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-6);
  background: var(--color-surface-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-3);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.discLink:hover {
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  transform: translateX(3px);
}

.discLink i {
  font-size: 1.1rem;
  color: var(--color-text-5);
  transition: color var(--duration-fast) var(--ease-out);
}

.discLink:hover i {
  color: var(--color-navy-accent);
}

@media (max-width: 600px) {
  .filterGroup {
    flex-direction: column;
    gap: var(--sp-2);
  }
}

@media (max-width: 480px) {
  .heroTitle {
    font-size: var(--text-3xl);
  }

  .anoHeader {
    padding: var(--sp-4);
  }

  .anoIcon {
    width: 40px;
    height: 40px;
  }

  .anoIcon i {
    font-size: 1.2rem;
  }

  .disciplinasList {
    grid-template-columns: 1fr;
  }

  .resultItem {
    padding: var(--sp-4);
  }
}
</style>
