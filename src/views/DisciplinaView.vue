<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppListCard from '../components/ui/AppListCard.vue'
import {
  getDisciplina,
  getAtividades,
  disciplinaDescricoes,
  deleteAtividade,
  duplicarAtividade,
} from '../data/disciplinas.js'
import { categoriaOptions } from '../utils/activityBlocks.js'
import { useAuthStore } from '../stores/auth.js'
import { useToast } from '../composables/useToast.js'

const props = defineProps({
  anoId: { type: String, required: true },
  disciplinaId: { type: String, required: true },
})

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const disciplina = computed(() => getDisciplina(Number(props.anoId), props.disciplinaId))
const desc = computed(() => disciplinaDescricoes[props.disciplinaId] || '')
const atividades = computed(() => getAtividades(props.disciplinaId))

const pluralLabels = { questao: 'Questões', atividade: 'Atividades', tutorial: 'Tutoriais' }
const categoriaTabs = categoriaOptions.map((opt) => ({ ...opt, pluralLabel: pluralLabels[opt.value] }))

function categoriaDe(ativ) {
  return ativ.categoria || 'atividade'
}

const categoriaCounts = computed(() => {
  const counts = { questao: 0, atividade: 0, tutorial: 0 }
  for (const ativ of atividades.value) counts[categoriaDe(ativ)]++
  return counts
})

const activeCategoria = ref('atividade')
const atividadesFiltradas = computed(() =>
  atividades.value.filter((a) => categoriaDe(a) === activeCategoria.value),
)

let userChangedTab = false
watch(
  categoriaCounts,
  (counts) => {
    if (userChangedTab || counts[activeCategoria.value] > 0) return
    const firstNonEmpty = categoriaTabs.find((t) => counts[t.value] > 0)
    if (firstNonEmpty) activeCategoria.value = firstNonEmpty.value
  },
  { immediate: true },
)

function selectCategoria(value) {
  userChangedTab = true
  activeCategoria.value = value
}

const showDeleteModal = ref(false)
const deletingAtividade = ref(null)
const isDeleting = ref(false)
const duplicatingId = ref(null)

function confirmDelete(ativ) {
  deletingAtividade.value = ativ
  showDeleteModal.value = true
}

function cancelDelete() {
  if (isDeleting.value) return
  showDeleteModal.value = false
  deletingAtividade.value = null
}

async function executeDelete() {
  if (!deletingAtividade.value || isDeleting.value) return
  isDeleting.value = true
  try {
    await deleteAtividade(props.disciplinaId, deletingAtividade.value.id)
    toast.success('Atividade excluída com sucesso.')
    showDeleteModal.value = false
    deletingAtividade.value = null
  } catch (err) {
    toast.error(`Não foi possível excluir a atividade${err?.message ? `: ${err.message}` : '.'}`)
  } finally {
    isDeleting.value = false
  }
}

async function duplicate(ativ) {
  if (duplicatingId.value) return
  duplicatingId.value = ativ.id
  try {
    await duplicarAtividade(props.disciplinaId, ativ.id)
    toast.success('Atividade duplicada com sucesso.')
  } catch (err) {
    toast.error(`Não foi possível duplicar a atividade${err?.message ? `: ${err.message}` : '.'}`)
  } finally {
    duplicatingId.value = null
  }
}
</script>

<template>
  <div class="disciplinaView">
<div class="disciplinaContent" v-if="disciplina">
      <div class="discHeader" v-reveal>
        <button class="backBtn" @click="router.back()">
          <i class="mdi mdi-arrow-left"></i>
        </button>
        <div class="discInfo">
          <div class="breadcrumb">
            <RouterLink :to="`/ano/${anoId}`">Ano {{ anoId }}</RouterLink>
            <i class="mdi mdi-chevron-right"></i>
            <span>{{ disciplina.name }}</span>
          </div>
          <h1 class="discTitle">
            <span class="discTitleIcon"><i :class="`mdi ${disciplina.icon}`"></i></span>
            {{ disciplina.name }}
          </h1>
          <p class="discDesc" v-if="desc">{{ desc }}</p>
        </div>
      </div>

      <div v-if="atividades.length" class="categoriaTabs" role="tablist">
        <button
          v-for="tab in categoriaTabs"
          :key="tab.value"
          type="button"
          role="tab"
          class="categoriaTab"
          :class="{ active: activeCategoria === tab.value }"
          :aria-selected="activeCategoria === tab.value"
          @click="selectCategoria(tab.value)"
        >
          <i :class="`mdi ${tab.icon}`"></i>
          {{ tab.pluralLabel }}
          <span class="categoriaTabCount">{{ categoriaCounts[tab.value] }}</span>
        </button>
      </div>

      <div v-if="atividadesFiltradas.length" class="atividadesList">
        <AppListCard
          v-for="(ativ, idx) in atividadesFiltradas"
          :key="ativ.id"
          :to="`/atividade/${disciplinaId}/${ativ.id}`"
          :highlighted="ativ.fixada"
          v-reveal.left="idx % 8"
        >
          <template #leading>
            <div class="atividadeNumber">{{ String(idx + 1).padStart(2, '0') }}</div>
          </template>
          <div class="atividadeTitleRow">
            <h2 class="atividadeTitle">{{ ativ.title }}</h2>
            <span v-if="ativ.fixada" class="fixadaBadge">
              <i class="mdi mdi-pin"></i>
              Fixada
            </span>
          </div>
          <p class="atividadeDesc">{{ ativ.desc }}</p>
          <div class="atividadeMeta">
            <span class="metaItem">
              <i class="mdi mdi-help-circle-outline"></i>
              {{(ativ.questoes || []).length}} questão{{(ativ.questoes || []).length > 1 ? 's' : ''}}
            </span>
          </div>

          <template v-if="auth.isLoggedIn" #actions>
            <RouterLink
              :to="`/editar-atividade/${disciplinaId}/${ativ.id}`"
              class="actionBtnSmall editBtn"
              title="Editar atividade"
              @click.stop
            >
              <i class="mdi mdi-pencil-outline"></i>
            </RouterLink>
            <button
              class="actionBtnSmall duplicateBtn"
              title="Duplicar atividade"
              :disabled="duplicatingId === ativ.id"
              @click.prevent.stop="duplicate(ativ)"
            >
              <i :class="duplicatingId === ativ.id ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-copy'"></i>
            </button>
            <button
              class="actionBtnSmall deleteBtn"
              title="Excluir atividade"
              @click.prevent.stop="confirmDelete(ativ)"
            >
              <i class="mdi mdi-delete-outline"></i>
            </button>
          </template>
        </AppListCard>
      </div>

      <div v-else-if="atividades.length" class="emptyState animate-fade-in-up">
        <div class="emptyStateIcon">
          <i :class="`mdi ${categoriaTabs.find((t) => t.value === activeCategoria)?.icon}`"></i>
        </div>
        <h2>Nenhum conteúdo aqui</h2>
        <p>Esta disciplina ainda não possui itens na categoria "{{ pluralLabels[activeCategoria] }}".</p>
      </div>

      <div v-else class="emptyState animate-fade-in-up">
        <div class="emptyStateIcon">
          <i class="mdi mdi-file-document-outline"></i>
        </div>
        <h2>Nenhuma atividade</h2>
        <p>Esta disciplina ainda não possui conteúdo cadastrado.</p>
      </div>
    </div>

    <div class="disciplinaContent" v-else>
      <div class="emptyState animate-fade-in-up">
        <div class="emptyStateIcon">
          <i class="mdi mdi-alert-circle-outline"></i>
        </div>
        <h2>Disciplina não encontrada</h2>
        <p>A disciplina solicitada não existe.</p>
        <RouterLink to="/" class="backHome">Voltar ao início</RouterLink>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="modalOverlay" @click.self="cancelDelete">
        <div class="deleteModal animate-scale-in">
          <div class="modalIcon">
            <i class="mdi mdi-alert-circle-outline"></i>
          </div>
          <h3 class="modalTitle">Excluir atividade?</h3>
          <p class="modalDesc">
            Tem certeza que deseja excluir <strong>{{ deletingAtividade?.title }}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div class="modalActions">
            <button class="modalBtn modalBtnCancel" :disabled="isDeleting" @click="cancelDelete">
              Cancelar
            </button>
            <button class="modalBtn modalBtnDelete" :disabled="isDeleting" @click="executeDelete">
              <i :class="isDeleting ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-delete-outline'"></i>
              {{ isDeleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.disciplinaView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.disciplinaContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.discHeader {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-4);
  margin-bottom: var(--sp-8);
}

.discInfo {
  flex: 1;
}

.discTitle {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-2);
}

.discTitleIcon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-out);
}

.discTitleIcon i {
  font-size: 1.3rem;
  color: var(--color-navy-accent);
  transition: transform var(--duration-fast) var(--ease-spring);
}

.discTitle:hover .discTitleIcon {
  background: var(--color-navy-accent);
}

.discTitle:hover .discTitleIcon i {
  color: var(--color-text-on-accent);
}

.discDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
}

.categoriaTabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-6);
  padding-bottom: var(--sp-4);
  border-bottom: 1px solid var(--color-border-1);
}

.categoriaTab {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  color: var(--color-text-3);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.categoriaTab i {
  font-size: 1rem;
}

.categoriaTab:hover {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.categoriaTab.active {
  background: var(--color-navy-accent);
  border-color: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.categoriaTabCount {
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

.categoriaTab.active .categoriaTabCount {
  background: rgba(255, 255, 255, 0.22);
  color: var(--color-text-on-accent);
}

.atividadesList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.listCard.highlighted .atividadeNumber {
  background: var(--color-navy-accent);
}

.atividadeNumber {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: var(--text-sm);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.atividadeTitleRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin-bottom: var(--sp-1);
}

.atividadeTitle {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
}

.fixadaBadge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px var(--sp-2);
  border-radius: var(--radius-full);
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  flex-shrink: 0;
}

.fixadaBadge i {
  font-size: 0.75rem;
}

.atividadeDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-normal);
  margin-bottom: var(--sp-2);
}

.atividadeMeta {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}

.actionBtnSmall {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-3);
  color: var(--color-text-4);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  text-decoration: none;
}

.actionBtnSmall:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.actionBtnSmall:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.editBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.duplicateBtn:hover {
  border-color: var(--color-success);
  color: var(--color-success);
  background: var(--color-success-muted);
}

.deleteBtn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-muted);
}

.modalOverlay {
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

.deleteModal {
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-xl);
  padding: var(--sp-8);
  text-align: center;
}

.modalIcon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-danger-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--sp-5);
}

.modalIcon i {
  font-size: 2rem;
  color: var(--color-danger);
}

.modalTitle {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-1);
  margin-bottom: var(--sp-3);
}

.modalDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-6);
}

.modalDesc strong {
  color: var(--color-text-2);
}

.modalActions {
  display: flex;
  gap: var(--sp-3);
}

.modalBtn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  border: none;
}

.modalBtnCancel {
  background: var(--color-surface-3);
  color: var(--color-text-3);
  border: 1px solid var(--color-border-2);
}

.modalBtnCancel:hover {
  background: var(--color-surface-4);
}

.modalBtnDelete {
  background: var(--color-danger);
  color: #ffffff;
}

.modalBtnDelete:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.modalBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.fade-enter-active {
  transition: opacity 0.25s var(--ease-out);
}

.fade-leave-active {
  transition: opacity 0.2s var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .discTitle {
    font-size: var(--text-xl);
  }

  .atividadeNumber {
    width: 36px;
    height: 36px;
    font-size: var(--text-xs);
  }
}
</style>
