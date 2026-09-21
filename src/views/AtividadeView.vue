<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getAtividade, disciplinaNomes, getAnoIdByDisciplina, deleteAtividade } from '../data/disciplinas.js'
import { useToast } from '../composables/useToast.js'
import AtividadeHeader from '../components/atividade/AtividadeHeader.vue'
import AtividadeToc from '../components/atividade/AtividadeToc.vue'
import BlockRenderer from '../components/atividade/BlockRenderer.vue'
import QuestoesFallback from '../components/atividade/QuestoesFallback.vue'
import AtividadeNotFound from '../components/atividade/AtividadeNotFound.vue'
import DeleteAtividadeModal from '../components/atividade/DeleteAtividadeModal.vue'

const props = defineProps({
  disciplinaId: { type: String, required: true },
  atividadeId: { type: String, required: true },
})

const router = useRouter()
const toast = useToast()

const atividade = computed(() => getAtividade(props.disciplinaId, props.atividadeId))
const disciplinaName = computed(() => disciplinaNomes[props.disciplinaId] || '')
const anoId = computed(() => getAnoIdByDisciplina(props.disciplinaId))

const showDeleteModal = ref(false)
const isDeleting = ref(false)

function confirmDelete() {
  showDeleteModal.value = true
}

function cancelDelete() {
  if (isDeleting.value) return
  showDeleteModal.value = false
}

async function executeDelete() {
  if (isDeleting.value) return
  isDeleting.value = true
  try {
    await deleteAtividade(props.disciplinaId, props.atividadeId)
    toast.success('Atividade excluída com sucesso.')
    showDeleteModal.value = false
    router.push(`/disciplina/${anoId.value || 1}/${props.disciplinaId}`)
  } catch (err) {
    toast.error(`Não foi possível excluir a atividade${err?.message ? `: ${err.message}` : '.'}`)
  } finally {
    isDeleting.value = false
  }
}

const readProgress = ref(0)
let progressTicking = false

function updateReadProgress() {
  const doc = document.documentElement
  const total = doc.scrollHeight - doc.clientHeight
  readProgress.value = total > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / total) * 100)) : 0
  progressTicking = false
}

function onScroll() {
  if (progressTicking) return
  progressTicking = true
  requestAnimationFrame(updateReadProgress)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  updateReadProgress()
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const hasBlocks = computed(() => atividade.value?.blocks && atividade.value.blocks.length > 0)
const totalBlocks = computed(() => atividade.value?.blocks?.length || 0)

const questionCount = computed(() => {
  if (hasBlocks.value) {
    return atividade.value.blocks.filter(b => b.type === 'question').length
  }
  return atividade.value?.questoes?.length || 0
})

const printExpandAll = ref(false)
function onBeforePrint() { printExpandAll.value = true }
function onAfterPrint() { printExpandAll.value = false }

onMounted(() => {
  window.addEventListener('beforeprint', onBeforePrint)
  window.addEventListener('afterprint', onAfterPrint)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeprint', onBeforePrint)
  window.removeEventListener('afterprint', onAfterPrint)
})
</script>

<template>
  <div class="atividadeView">
    <div v-if="atividade" class="readProgress no-print" aria-hidden="true">
      <div class="readProgressBar" :style="{ width: `${readProgress}%` }"></div>
    </div>

    <div class="atividadeContent" v-if="atividade">
      <AtividadeHeader
        :atividade="atividade"
        :disciplina-name="disciplinaName"
        :ano-id="anoId"
        :disciplina-id="disciplinaId"
        :atividade-id="atividadeId"
        :question-count="questionCount"
        :total-blocks="totalBlocks"
        @delete-request="confirmDelete"
      />

      <AtividadeToc v-if="hasBlocks" :blocks="atividade.blocks" />

      <BlockRenderer v-if="hasBlocks" :blocks="atividade.blocks" :print-expand-all="printExpandAll" />

      <QuestoesFallback v-else-if="atividade.questoes && atividade.questoes.length > 0" :questoes="atividade.questoes" />
    </div>

    <AtividadeNotFound
      v-else
      :disciplina-name="disciplinaName"
      :disciplina-id="disciplinaId"
      :ano-id="anoId"
    />

    <DeleteAtividadeModal
      :show="showDeleteModal"
      :atividade-title="atividade?.title"
      :is-deleting="isDeleting"
      @cancel="cancelDelete"
      @confirm="executeDelete"
    />
  </div>
</template>

<style scoped>
.atividadeView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.readProgress {
  position: fixed;
  top: var(--header-h);
  left: 0;
  right: 0;
  z-index: 90;
  height: 3px;
  background: transparent;
}

.readProgressBar {
  height: 100%;
  background: var(--color-navy-accent);
  transition: width 0.1s linear;
}

@media (prefers-reduced-motion: reduce) {
  .readProgressBar {
    transition: none;
  }
}

.atividadeContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w-narrow);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}
</style>
