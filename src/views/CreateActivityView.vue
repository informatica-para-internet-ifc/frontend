<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { anos, addAtividade, editAtividade, getAtividade } from '../data/disciplinas.js'
import { useToast } from '../composables/useToast.js'
import { dificuldadeOptions, isBlockEmpty, getBlockLabel } from '../utils/activityBlocks.js'
import CreateActivityHeader from '../components/createActivity/CreateActivityHeader.vue'
import DraftBanner from '../components/createActivity/DraftBanner.vue'
import ErrorBanner from '../components/createActivity/ErrorBanner.vue'
import SuccessBanner from '../components/createActivity/SuccessBanner.vue'
import ActivityCoverForm from '../components/createActivity/ActivityCoverForm.vue'
import BlockEditorList from '../components/createActivity/BlockEditorList.vue'
import ActivityResultsPreview from '../components/createActivity/ActivityResultsPreview.vue'
import ActivitySidebar from '../components/createActivity/ActivitySidebar.vue'
import ConfirmDialog from '../components/ui/ConfirmDialog.vue'

const DRAFT_KEY = 'sio-draft-activity'

const props = defineProps({
  disciplinaId: { type: String, default: null },
  atividadeId: { type: String, default: null },
})

const router = useRouter()
const toast = useToast()

const isEditMode = computed(() => !!props.disciplinaId && !!props.atividadeId)
const editingAtividade = computed(() => {
  if (!isEditMode.value) return null
  return getAtividade(props.disciplinaId, props.atividadeId)
})

function loadEditMode() {
  if (!editingAtividade.value) return {}
  const a = editingAtividade.value
  let ano = a.ano || ''
  if (!ano) {
    for (const [id, anoData] of Object.entries(anos)) {
      if (anoData.disciplinas.some((d) => d.id === props.disciplinaId)) {
        ano = id
        break
      }
    }
  }
  return {
    title: a.title || '',
    description: a.desc || '',
    capa: a.capa || '',
    selectedAno: ano,
    selectedDisc: props.disciplinaId,
    blocks: a.blocks ? JSON.parse(JSON.stringify(a.blocks)) : [],
    categoria: a.categoria || 'atividade',
    dificuldade: a.dificuldade || '',
    tempoEstimado: a.tempoEstimado || '',
    tags: Array.isArray(a.tags) ? [...a.tags] : [],
    preRequisitos: a.preRequisitos || '',
    status: a.status || 'rascunho',
    prazoRecomendado: a.prazoRecomendado || '',
    fixada: !!a.fixada,
  }
}

const editData = isEditMode.value ? loadEditMode() : {}

let blockIdCounter = (editData.blocks || []).length
function nextId() {
  return ++blockIdCounter
}

const title = ref(editData.title || '')
const description = ref(editData.description || '')
const capa = ref(editData.capa || '')
const blocks = ref(editData.blocks || [])
const categoria = ref(editData.categoria || 'atividade')
const dificuldade = ref(editData.dificuldade || '')
const tempoEstimado = ref(editData.tempoEstimado || '')
const tags = ref(editData.tags || [])
const preRequisitos = ref(editData.preRequisitos || '')
const status = ref(editData.status || 'rascunho')
const prazoRecomendado = ref(editData.prazoRecomendado || '')
const fixada = ref(editData.fixada || false)

watch(status, (value) => {
  if (value !== 'publicada') fixada.value = false
})

const viewMode = ref('edit')
const collapsedBlocks = ref(new Set())

function toggleBlockCollapse(id) {
  const next = new Set(collapsedBlocks.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsedBlocks.value = next
}

function collapseAll() {
  collapsedBlocks.value = new Set(blocks.value.map((b) => b.id))
}

function expandAll() {
  collapsedBlocks.value = new Set()
}

function scrollToBlock(id) {
  if (viewMode.value !== 'edit') viewMode.value = 'edit'
  requestAnimationFrame(() => {
    document.getElementById(`block-anchor-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const selectedAno = ref(editData.selectedAno || '')
const selectedDisc = ref(editData.selectedDisc || '')
const isSaving = ref(false)
const errors = ref({})
const showErrors = ref(false)
const savedAtividade = ref(null)
const savedDiscId = ref(null)
const showDraftBanner = ref(false)
const showLeaveConfirm = ref(false)
const showResetConfirm = ref(false)
let pendingLeaveResolve = null

const anosList = Object.entries(anos).map(([id, ano]) => ({
  id,
  label: ano.label,
  disciplinas: ano.disciplinas,
}))

const disciplinasDoAno = computed(() => {
  if (!selectedAno.value) return []
  const ano = anos[selectedAno.value]
  return ano ? ano.disciplinas : []
})

const previewAnoLabel = computed(() => (selectedAno.value ? anos[selectedAno.value]?.label : ''))
const previewDiscNome = computed(() => disciplinasDoAno.value.find((d) => d.id === selectedDisc.value)?.name || '')
const previewDificuldade = computed(() => dificuldadeOptions.find((o) => o.value === dificuldade.value))

const hasChanges = computed(() => {
  return (
    title.value ||
    description.value ||
    capa.value ||
    blocks.value.length > 0 ||
    selectedAno.value ||
    selectedDisc.value ||
    dificuldade.value ||
    tempoEstimado.value ||
    tags.value.length > 0 ||
    preRequisitos.value ||
    prazoRecomendado.value
  )
})

let justSaved = false

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignorar falha ao limpar localStorage
  }
}

function saveDraft() {
  if (isEditMode.value || !hasChanges.value) return
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        title: title.value,
        description: description.value,
        capa: capa.value,
        blocks: blocks.value,
        selectedAno: selectedAno.value,
        selectedDisc: selectedDisc.value,
        categoria: categoria.value,
        dificuldade: dificuldade.value,
        tempoEstimado: tempoEstimado.value,
        tags: tags.value,
        preRequisitos: preRequisitos.value,
        status: status.value,
        prazoRecomendado: prazoRecomendado.value,
        fixada: fixada.value,
        savedAt: Date.now(),
      }),
    )
  } catch {
    // localStorage indisponível (modo privado, cota cheia...) — rascunho é best-effort
  }
}

let draftTimer = null
function scheduleDraftSave() {
  clearTimeout(draftTimer)
  draftTimer = setTimeout(saveDraft, 600)
}

function restoreDraft() {
  const draft = readDraft()
  if (!draft) return
  title.value = draft.title || ''
  description.value = draft.description || ''
  capa.value = draft.capa || ''
  blocks.value = draft.blocks || []
  selectedAno.value = draft.selectedAno || ''
  selectedDisc.value = draft.selectedDisc || ''
  categoria.value = draft.categoria || 'atividade'
  dificuldade.value = draft.dificuldade || ''
  tempoEstimado.value = draft.tempoEstimado || ''
  tags.value = draft.tags || []
  preRequisitos.value = draft.preRequisitos || ''
  status.value = draft.status || 'rascunho'
  prazoRecomendado.value = draft.prazoRecomendado || ''
  fixada.value = draft.fixada || false
  blockIdCounter = Math.max(blockIdCounter, ...(draft.blocks || []).map((b) => b.id || 0), 0)
  showDraftBanner.value = false
  toast.info('Rascunho restaurado.')
}

function discardDraft() {
  clearDraft()
  showDraftBanner.value = false
}

if (!isEditMode.value && readDraft()) {
  showDraftBanner.value = true
}

watch(
  [title, description, capa, blocks, selectedAno, selectedDisc, categoria, dificuldade, tempoEstimado, tags, preRequisitos, status, prazoRecomendado, fixada],
  scheduleDraftSave,
  { deep: true },
)

onBeforeUnmount(() => clearTimeout(draftTimer))

function onBeforeUnloadGuard(e) {
  if (justSaved || !hasChanges.value) return
  e.preventDefault()
  e.returnValue = ''
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnloadGuard))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnloadGuard))

function onSaveShortcut(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    if (!isSaving.value) save()
  }
}

onMounted(() => window.addEventListener('keydown', onSaveShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', onSaveShortcut))

onBeforeRouteLeave(() => {
  if (justSaved || !hasChanges.value) return true
  return new Promise((resolve) => {
    pendingLeaveResolve = resolve
    showLeaveConfirm.value = true
  })
})

function resolveLeaveConfirm(result) {
  showLeaveConfirm.value = false
  pendingLeaveResolve?.(result)
  pendingLeaveResolve = null
}

function validate() {
  const e = {}
  if (!title.value.trim()) e.title = 'O título é obrigatório.'
  if (!selectedAno.value) e.ano = 'Selecione o ano.'
  if (!selectedDisc.value) e.disc = 'Selecione a disciplina.'
  if (blocks.value.length === 0) {
    e.blocks = 'Adicione pelo menos um bloco.'
  } else {
    const emptyIdx = blocks.value.findIndex(isBlockEmpty)
    if (emptyIdx !== -1) {
      const label = getBlockLabel(blocks.value[emptyIdx].type)
      e.blocks = `O bloco "${label}" (posição ${emptyIdx + 1}) está sem conteúdo.`
    }
  }
  errors.value = e
  return Object.keys(e).length === 0
}

function resetFormState() {
  title.value = ''
  description.value = ''
  capa.value = ''
  blocks.value = []
  selectedAno.value = ''
  selectedDisc.value = ''
  categoria.value = 'atividade'
  dificuldade.value = ''
  tempoEstimado.value = ''
  tags.value = []
  preRequisitos.value = ''
  status.value = 'rascunho'
  prazoRecomendado.value = ''
  fixada.value = false
  errors.value = {}
  showErrors.value = false
  viewMode.value = 'edit'
  blockIdCounter = 0
  justSaved = false
}

async function save() {
  showErrors.value = true
  if (!validate()) {
    const firstError = document.querySelector('.fieldError, .blocksError')
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  isSaving.value = true

  const questoes = blocks.value
    .filter((b) => b.type === 'question')
    .map((b) => ({ enunciado: b.enunciado, tipo: b.tipo }))

  const payload = {
    title: title.value.trim(),
    desc: description.value.trim(),
    capa: capa.value,
    ano: selectedAno.value,
    blocks: JSON.parse(JSON.stringify(blocks.value)),
    questoes,
    categoria: categoria.value,
    dificuldade: dificuldade.value || '',
    tempo_estimado: tempoEstimado.value.trim(),
    tags: tags.value,
    pre_requisitos: preRequisitos.value.trim(),
    status: status.value,
    prazo_recomendado: prazoRecomendado.value || null,
    fixada: fixada.value,
  }

  try {
    if (isEditMode.value) {
      const editada = await editAtividade(props.disciplinaId, props.atividadeId, payload)
      clearDraft()
      justSaved = true
      toast.success('Atividade atualizada com sucesso!')
      router.push(`/atividade/${props.disciplinaId}/${editada.id}`)
    } else {
      const newAtiv = await addAtividade(selectedDisc.value, payload)
      clearDraft()
      justSaved = true
      savedAtividade.value = newAtiv
      savedDiscId.value = selectedDisc.value
      toast.success('Atividade criada com sucesso!')
    }
  } catch (err) {
    const msg =
      err?.message === 'network'
        ? 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
        : `Não foi possível salvar a atividade${err?.message ? `: ${err.message}` : '.'}`
    toast.error(msg)
  } finally {
    isSaving.value = false
  }
}

function resetForm() {
  if (!hasChanges.value) {
    clearDraft()
    resetFormState()
    return
  }
  showResetConfirm.value = true
}

function confirmReset() {
  showResetConfirm.value = false
  clearDraft()
  resetFormState()
}

function startNewActivity() {
  resetFormState()
  savedAtividade.value = null
  savedDiscId.value = null
}
</script>

<template>
  <div class="createView">
    <div class="createContent">
      <CreateActivityHeader
        :is-edit-mode="isEditMode"
        :block-count="blocks.length"
        :has-collapsed-blocks="collapsedBlocks.size > 0"
        v-model:view-mode="viewMode"
        :is-saving="isSaving"
        @back="router.back()"
        @toggle-collapse-all="collapsedBlocks.size ? expandAll() : collapseAll()"
        @save="save"
      />

      <DraftBanner :show="showDraftBanner" @restore="restoreDraft" @discard="discardDraft" />

      <ErrorBanner :show="showErrors" :error-count="Object.keys(errors).length" />

      <SuccessBanner :atividade="savedAtividade" :disc-id="savedDiscId" @new="startNewActivity" />

      <template v-if="!savedAtividade">
        <ActivityCoverForm
          v-model:title="title"
          v-model:description="description"
          v-model:capa="capa"
          :show-title-error="showErrors"
          :title-error="errors.title"
        />

        <div class="builderLayout">
          <div class="mainColumn">
            <BlockEditorList
              v-if="viewMode !== 'preview'"
              v-model:blocks="blocks"
              :next-id="nextId"
              :collapsed-blocks="collapsedBlocks"
              :show-errors="showErrors"
              :blocks-error="errors.blocks"
              :is-saving="isSaving"
              @toggle-block-collapse="toggleBlockCollapse"
              @save="save"
              @reset="resetForm"
            />

            <ActivityResultsPreview
              v-if="viewMode !== 'edit'"
              :title="title"
              :description="description"
              :capa="capa"
              :blocks="blocks"
              :ano-label="previewAnoLabel"
              :disc-nome="previewDiscNome"
              :dificuldade-label="previewDificuldade?.label"
              :dificuldade-icon="previewDificuldade?.icon"
              :tempo-estimado="tempoEstimado"
              :tags="tags"
            />
          </div>

          <ActivitySidebar
            v-model:categoria="categoria"
            v-model:selected-ano="selectedAno"
            v-model:selected-disc="selectedDisc"
            v-model:dificuldade="dificuldade"
            v-model:tempo-estimado="tempoEstimado"
            v-model:tags="tags"
            v-model:pre-requisitos="preRequisitos"
            v-model:status="status"
            v-model:prazo-recomendado="prazoRecomendado"
            v-model:fixada="fixada"
            :anos-list="anosList"
            :blocks="blocks"
            :show-errors="showErrors"
            :errors="errors"
            @scroll-to-block="scrollToBlock"
          />
        </div>
      </template>
    </div>

    <ConfirmDialog
      :show="showLeaveConfirm"
      title="Sair sem salvar?"
      message="Você tem alterações não salvas. Se sair agora, elas serão perdidas."
      confirm-label="Sair sem salvar"
      cancel-label="Continuar editando"
      danger
      @confirm="resolveLeaveConfirm(true)"
      @cancel="resolveLeaveConfirm(false)"
    />

    <ConfirmDialog
      :show="showResetConfirm"
      title="Limpar tudo?"
      message="Tem certeza que deseja limpar o formulário? O rascunho será perdido."
      confirm-label="Limpar tudo"
      cancel-label="Cancelar"
      danger
      @confirm="confirmReset"
      @cancel="showResetConfirm = false"
    />
  </div>
</template>

<style scoped>
.createView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.createContent {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.builderLayout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: start;
  gap: var(--sp-6);
}

.mainColumn {
  min-width: 0;
}

@media (max-width: 1080px) {
  .builderLayout {
    grid-template-columns: 1fr;
  }
}
</style>
