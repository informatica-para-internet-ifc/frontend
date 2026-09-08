<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  getDisciplina,
  getAtividades,
  disciplinaDescricoes,
  deleteAtividade,
  duplicarAtividade,
} from '../data/disciplinas.js'
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
    <div class="pageDeco">
      <div class="pageDecoDots"></div>
      <div class="pageDecoGrid"></div>
    </div>

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

      <div v-if="atividades.length" class="atividadesList">
        <div
          v-for="(ativ, idx) in atividades"
          :key="ativ.id"
          class="atividadeCard"
          v-reveal.left="idx % 8"
        >
          <RouterLink
            :to="`/atividade/${disciplinaId}/${ativ.id}`"
            class="atividadeLink"
          >
            <div class="atividadeNumber">{{ String(idx + 1).padStart(2, '0') }}</div>
            <div class="atividadeContent">
              <h2 class="atividadeTitle">{{ ativ.title }}</h2>
              <p class="atividadeDesc">{{ ativ.desc }}</p>
              <div class="atividadeMeta">
                <span class="metaItem">
                  <i class="mdi mdi-help-circle-outline"></i>
                  {{(ativ.questoes || []).length}} questão{{(ativ.questoes || []).length > 1 ? 's' : ''}}
                </span>
              </div>
            </div>
            <i class="mdi mdi-chevron-right atividadeArrow"></i>
          </RouterLink>
          <div v-if="auth.isLoggedIn" class="atividadeActions">
            <RouterLink
              :to="`/editar-atividade/${disciplinaId}/${ativ.id}`"
              class="actionBtnSmall editBtn"
              title="Editar atividade"
            >
              <i class="mdi mdi-pencil-outline"></i>
            </RouterLink>
            <button
              class="actionBtnSmall duplicateBtn"
              title="Duplicar atividade"
              :disabled="duplicatingId === ativ.id"
              @click.prevent="duplicate(ativ)"
            >
              <i :class="duplicatingId === ativ.id ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-copy'"></i>
            </button>
            <button
              class="actionBtnSmall deleteBtn"
              title="Excluir atividade"
              @click.prevent="confirmDelete(ativ)"
            >
              <i class="mdi mdi-delete-outline"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="emptyState animate-fade-in-up">
        <div class="emptyStateIcon">
          <i class="mdi mdi-file-document-outline"></i>
        </div>
        <h2>Nenhuma atividade</h2>
        <p>Esta disciplina ainda não possui atividades cadastradas.</p>
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

.atividadesList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.atividadeCard {
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
}

.atividadeCard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-navy-accent);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.atividadeCard:hover {
  border-color: var(--color-border-2);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.atividadeCard:hover::before {
  opacity: 1;
}

.atividadeLink {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  text-decoration: none;
}

.atividadeCard:hover .atividadeLink {
  background: var(--color-surface-3);
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
  transition: all var(--duration-normal) var(--ease-out);
}

.atividadeCard:hover .atividadeNumber {
  transform: scale(1.06);
}

.atividadeContent {
  flex: 1;
  min-width: 0;
}

.atividadeTitle {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: var(--sp-1);
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

.atividadeArrow {
  font-size: 1.2rem;
  color: var(--color-text-5);
  transition: all var(--duration-normal) var(--ease-spring);
  flex-shrink: 0;
}

.atividadeCard:hover .atividadeArrow {
  color: var(--color-navy-accent);
  transform: translateX(6px) scale(1.1);
}

.atividadeActions {
  display: flex;
  gap: var(--sp-2);
  padding: 0 var(--sp-6) var(--sp-4);
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

  .atividadeLink {
    padding: var(--sp-4);
  }

  .atividadeNumber {
    width: 36px;
    height: 36px;
    font-size: var(--text-xs);
  }
}
</style>
