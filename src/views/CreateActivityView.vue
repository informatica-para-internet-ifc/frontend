<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, onBeforeRouteLeave, RouterLink } from 'vue-router'
import { anos, addAtividade, editAtividade, getAtividade } from '../data/disciplinas.js'
import { renderMarkdown } from '../composables/useMarkdown.js'
import { useToast } from '../composables/useToast.js'

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
    selectedAno: ano,
    selectedDisc: props.disciplinaId,
    blocks: a.blocks ? JSON.parse(JSON.stringify(a.blocks)) : [],
  }
}

const editData = isEditMode.value ? loadEditMode() : {}

let blockIdCounter = (editData.blocks || []).length
function nextId() {
  return ++blockIdCounter
}

const title = ref(editData.title || '')
const description = ref(editData.description || '')
const blocks = ref(editData.blocks || [])
const showAddMenu = ref(false)
const addMenuIdx = ref(null)
const addMenuQuery = ref('')
const viewMode = ref('edit')
const draggingIdx = ref(null)
const dragOverIdx = ref(null)

function onBlockDragStart(idx, e) {
  draggingIdx.value = idx
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', String(idx))
}

function onBlockDragOver(idx) {
  if (draggingIdx.value === null) return
  dragOverIdx.value = idx
}

function onBlockDrop(idx) {
  if (draggingIdx.value === null || draggingIdx.value === idx) {
    resetBlockDrag()
    return
  }
  const [moved] = blocks.value.splice(draggingIdx.value, 1)
  blocks.value.splice(idx, 0, moved)
  resetBlockDrag()
}

function resetBlockDrag() {
  draggingIdx.value = null
  dragOverIdx.value = null
}
const selectedAno = ref(editData.selectedAno || '')
const selectedDisc = ref(editData.selectedDisc || '')
const isSaving = ref(false)
const errors = ref({})
const showErrors = ref(false)
const savedAtividade = ref(null)
const savedDiscId = ref(null)
const showDraftBanner = ref(false)

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

const hasChanges = computed(() => {
  return title.value || description.value || blocks.value.length > 0 || selectedAno.value || selectedDisc.value
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
        blocks: blocks.value,
        selectedAno: selectedAno.value,
        selectedDisc: selectedDisc.value,
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
  blocks.value = draft.blocks || []
  selectedAno.value = draft.selectedAno || ''
  selectedDisc.value = draft.selectedDisc || ''
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

watch([title, description, blocks, selectedAno, selectedDisc], scheduleDraftSave, { deep: true })

onBeforeUnmount(() => clearTimeout(draftTimer))

function onBeforeUnloadGuard(e) {
  if (justSaved || !hasChanges.value) return
  e.preventDefault()
  e.returnValue = ''
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnloadGuard))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnloadGuard))

onBeforeRouteLeave(() => {
  if (justSaved || !hasChanges.value) return true
  return window.confirm('Você tem alterações não salvas. Deseja realmente sair sem salvar?')
})

const blockCount = computed(() => blocks.value.length)
const questionCount = computed(() => blocks.value.filter((b) => b.type === 'question').length)
const textLength = computed(() => {
  return blocks.value.reduce((sum, b) => {
    if (b.content) return sum + b.content.length
    if (b.enunciado) return sum + b.enunciado.length
    return sum
  }, 0)
})

const blockTypes = [
  { type: 'text', label: 'Texto', icon: 'mdi-text', desc: 'Parágrafos simples de texto' },
  { type: 'heading', label: 'Título', icon: 'mdi-format-header-1', desc: 'Título de seção' },
  { type: 'markdown', label: 'Markdown', icon: 'mdi-language-markdown', desc: 'Texto com formatação rich' },
  { type: 'code', label: 'Código', icon: 'mdi-code-tags', desc: 'Bloco de código com syntax highlight' },
  { type: 'terminal', label: 'Terminal', icon: 'mdi-console-line', desc: 'Comandos de terminal' },
  { type: 'image', label: 'Imagem', icon: 'mdi-image-outline', desc: 'Imagem por URL' },
  { type: 'gallery', label: 'Galeria', icon: 'mdi-image-multiple-outline', desc: 'Várias imagens com legenda' },
  { type: 'video', label: 'Vídeo', icon: 'mdi-video-outline', desc: 'Vídeo incorporado (YouTube/Vimeo)' },
  { type: 'embed', label: 'Embed', icon: 'mdi-web', desc: 'Iframe incorporado (CodePen, JSFiddle...)' },
  { type: 'list', label: 'Lista', icon: 'mdi-format-list-bulleted', desc: 'Lista com marcadores ou numerada' },
  { type: 'steps', label: 'Passo a Passo', icon: 'mdi-format-list-numbered', desc: 'Procedimento numerado: 01 → 02 → 03' },
  { type: 'checklist', label: 'Checklista', icon: 'mdi-format-list-checks', desc: 'Lista de requisitos com checkbox' },
  { type: 'table', label: 'Tabela', icon: 'mdi-table', desc: 'Tabela editável com linhas e colunas' },
  { type: 'quote', label: 'Citação', icon: 'mdi-format-quote-open', desc: 'Citação em destaque com autor' },
  { type: 'alert', label: 'Aviso', icon: 'mdi-alert-decagram-outline', desc: 'Caixa colorida (informação, dica, atenção...)' },
  { type: 'link', label: 'Link', icon: 'mdi-link-variant', desc: 'Link único com rótulo e descrição' },
  { type: 'links', label: 'Links Externos', icon: 'mdi-link-box-outline', desc: 'Várias referências externas' },
  { type: 'file', label: 'Download', icon: 'mdi-file-download-outline', desc: 'Arquivo para baixar (PDF, ZIP...)' },
  { type: 'accordion', label: 'Acordeão', icon: 'mdi-view-list', desc: 'Itens colapsáveis (perguntas e respostas)' },
  { type: 'divider', label: 'Divisor', icon: 'mdi-minus', desc: 'Linha separadora' },
  { type: 'question', label: 'Questão', icon: 'mdi-frequently-asked-questions', desc: 'Exercício (discursiva, múltipla escolha...)' },
]

const alertTypes = [
  { type: 'info', label: 'Informação', icon: 'mdi-information-outline' },
  { type: 'success', label: 'Dica', icon: 'mdi-lightbulb-on-outline' },
  { type: 'warning', label: 'Atenção', icon: 'mdi-alert-outline' },
  { type: 'danger', label: 'Importante', icon: 'mdi-exclamation-thick' },
  { type: 'erro', label: 'Erro comum', icon: 'mdi-alert-octagon-outline' },
]

const questionModos = [
  { value: 'discursiva', label: 'Discursiva', icon: 'mdi-text-box-outline' },
  { value: 'multipla_escolha', label: 'Múltipla Escolha', icon: 'mdi-checkbox-multiple-blank-outline' },
  { value: 'verdadeiro_falso', label: 'Verdadeiro/Falso', icon: 'mdi-toggle-switch-outline' },
  { value: 'programacao', label: 'Programação', icon: 'mdi-code-tags' },
]

function addBlock(type, afterIdx) {
  const defaults = {
    text: { content: '' },
    markdown: { content: '' },
    heading: { content: '', level: 2 },
    code: { content: '', language: 'javascript' },
    terminal: { commands: [''] },
    image: { url: '', alt: '' },
    gallery: { images: [{ url: '', caption: '' }], caption: '' },
    video: { url: '', title: '' },
    embed: { url: '', title: '', height: '400' },
    list: { items: [''], ordered: false },
    steps: { steps: [{ title: '', desc: '' }] },
    checklist: { items: [{ text: '', done: false }] },
    table: { rows: [['', ''], ['', '']], hasHeader: false },
    quote: { content: '', author: '' },
    alert: { content: '', tipo: 'info' },
    link: { url: '', label: '', desc: '' },
    links: { links: [{ title: '', url: '', desc: '' }] },
    file: { label: '', url: '', size: '', desc: '' },
    accordion: { items: [{ title: '', content: '' }] },
    divider: {},
    question: { enunciado: '', tipo: 'exercicio', modo: 'discursiva', alternativas: [{ texto: '' }, { texto: '' }], correta: 0, respostaVf: true, linguagem: 'javascript', codigoEsperado: '' },
  }

  const block = {
    id: nextId(),
    type,
    ...defaults[type],
  }

  if (afterIdx !== undefined && afterIdx !== null) {
    blocks.value.splice(afterIdx + 1, 0, block)
  } else {
    blocks.value.push(block)
  }

  showAddMenu.value = false
  addMenuIdx.value = null
}

function removeBlock(idx) {
  blocks.value.splice(idx, 1)
}

function duplicateBlock(idx) {
  const original = blocks.value[idx]
  const clone = { ...JSON.parse(JSON.stringify(original)), id: nextId() }
  blocks.value.splice(idx + 1, 0, clone)
}

function moveBlock(idx, dir) {
  const newIdx = idx + dir
  if (newIdx < 0 || newIdx >= blocks.value.length) return
  const item = blocks.value.splice(idx, 1)[0]
  blocks.value.splice(newIdx, 0, item)
}

function addListItem(block) {
  block.items.push('')
}

function removeListItem(block, idx) {
  if (block.items.length > 1) {
    block.items.splice(idx, 1)
  }
}

function addTableRow(block) {
  const len = block.rows[0]?.length || 1
  block.rows.push(Array(len).fill(''))
}

function addTableCol(block) {
  block.rows.forEach((r) => r.push(''))
}

function removeTableRow(block) {
  if (block.rows.length > 1) block.rows.pop()
}

function removeTableCol(block) {
  if ((block.rows[0]?.length || 0) > 1) block.rows.forEach((r) => r.pop())
}

function addLinkItem(block) {
  block.links.push({ title: '', url: '', desc: '' })
}

function removeLinkItem(block, idx) {
  if (block.links.length > 1) block.links.splice(idx, 1)
}

function addGalleryImage(block) {
  block.images.push({ url: '', caption: '' })
}

function removeGalleryImage(block, idx) {
  if (block.images.length > 1) block.images.splice(idx, 1)
}

function addTerminalCmd(block) {
  block.commands.push('')
}

function removeTerminalCmd(block, idx) {
  if (block.commands.length > 1) block.commands.splice(idx, 1)
}

function addStepItem(block) {
  block.steps.push({ title: '', desc: '' })
}

function removeStepItem(block, idx) {
  if (block.steps.length > 1) block.steps.splice(idx, 1)
}

function addCheckItem(block) {
  block.items.push({ text: '', done: false })
}

function removeCheckItem(block, idx) {
  if (block.items.length > 1) block.items.splice(idx, 1)
}

function addAccItem(block) {
  block.items.push({ title: '', content: '' })
}

function removeAccItem(block, idx) {
  if (block.items.length > 1) block.items.splice(idx, 1)
}

function addAlternativa(block) {
  block.alternativas.push({ texto: '' })
}

function removeAlternativa(block, idx) {
  if (block.alternativas.length > 2) block.alternativas.splice(idx, 1)
}

function getFileType(url) {
  if (!url) return ''
  const m = url.match(/\.([a-z0-9]{2,5})(?:$|\?)/i)
  return m ? m[1].toLowerCase() : ''
}

function getFileIcon(type) {
  const map = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word-box',
    docx: 'mdi-file-word-box',
    xls: 'mdi-file-excel-box',
    xlsx: 'mdi-file-excel-box',
    ppt: 'mdi-file-powerpoint-box',
    pptx: 'mdi-file-powerpoint-box',
    zip: 'mdi-folder-zip-outline',
    rar: 'mdi-folder-zip-outline',
    md: 'mdi-language-markdown-outline',
  }
  return map[type] || 'mdi-file-outline'
}

function getAlertIcon(tipo) {
  const map = {
    info: 'mdi-information-outline',
    success: 'mdi-lightbulb-on-outline',
    warning: 'mdi-alert-outline',
    danger: 'mdi-exclamation-thick',
    erro: 'mdi-alert-octagon-outline',
  }
  return map[tipo] || 'mdi-information-outline'
}

function getVideoEmbed(url) {
  if (!url) return null
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`
  m = url.match(/vimeo\.com\/(\d+)/)
  if (m) return `https://player.vimeo.com/video/${m[1]}`
  return null
}

function openAddMenu(idx) {
  addMenuIdx.value = idx
  addMenuQuery.value = ''
  showAddMenu.value = true
}

function closeAddMenu() {
  showAddMenu.value = false
  addMenuIdx.value = null
}

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const filteredBlockTypes = computed(() => {
  const q = normalizeText(addMenuQuery.value.trim())
  if (!q) return blockTypes
  return blockTypes.filter(
    (bt) => normalizeText(bt.label).includes(q) || normalizeText(bt.desc).includes(q),
  )
})

function isBlockEmpty(block) {
  switch (block.type) {
    case 'text':
    case 'markdown':
    case 'heading':
    case 'code':
    case 'quote':
    case 'alert':
      return !block.content?.trim()
    case 'image':
    case 'video':
      return !block.url?.trim()
    case 'link':
      return !block.url?.trim() || !block.label?.trim()
    case 'file':
      return !block.url?.trim() || !block.label?.trim()
    case 'question':
      return !block.enunciado?.trim()
    case 'list':
      return !block.items?.some((i) => i.trim())
    case 'terminal':
      return !block.commands?.some((c) => c.trim())
    case 'links':
      return !block.links?.some((l) => l.title?.trim() && l.url?.trim())
    case 'gallery':
      return !block.images?.some((i) => i.url?.trim())
    default:
      return false
  }
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
  blocks.value = []
  selectedAno.value = ''
  selectedDisc.value = ''
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
    ano: selectedAno.value,
    blocks: JSON.parse(JSON.stringify(blocks.value)),
    questoes,
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
  if (hasChanges.value && !confirm('Tem certeza que deseja limpar tudo? O rascunho será perdido.')) return
  clearDraft()
  resetFormState()
}

function startNewActivity() {
  resetFormState()
  savedAtividade.value = null
  savedDiscId.value = null
}

function getBlockIcon(type) {
  const map = {
    text: 'mdi-text',
    markdown: 'mdi-language-markdown',
    heading: 'mdi-format-header-1',
    code: 'mdi-code-tags',
    terminal: 'mdi-console-line',
    image: 'mdi-image-outline',
    gallery: 'mdi-image-multiple-outline',
    video: 'mdi-video-outline',
    embed: 'mdi-web',
    list: 'mdi-format-list-bulleted',
    steps: 'mdi-format-list-numbered',
    checklist: 'mdi-format-list-checks',
    table: 'mdi-table',
    quote: 'mdi-format-quote-open',
    alert: 'mdi-alert-decagram-outline',
    link: 'mdi-link-variant',
    links: 'mdi-link-box-outline',
    file: 'mdi-file-download-outline',
    accordion: 'mdi-view-list',
    divider: 'mdi-minus',
    question: 'mdi-frequently-asked-questions',
  }
  return map[type] || 'mdi-help-circle-outline'
}

function getBlockLabel(type) {
  return blockTypes.find((b) => b.type === type)?.label || type
}

function getQuestionModoLabel(modo) {
  return questionModos.find((m) => m.value === modo)?.label || 'Discursiva'
}
</script>

<template>
  <div class="createView">
    <div class="pageDeco">
      <div class="pageDecoDots"></div>
      <div class="pageDecoGrid"></div>
    </div>

    <div class="createContent">
      <div class="createHeader animate-fade-in-up">
        <button class="backBtn" @click="router.back()">
          <i class="mdi mdi-arrow-left"></i>
        </button>
        <div class="headerInfo">
          <h1 class="pageTitle">{{ isEditMode ? 'Editar Atividade' : 'Criar Atividade' }}</h1>
          <p class="pageDesc">{{ isEditMode ? 'Altere os blocos e salve as mudanças.' : 'Monte a atividade com blocos de conteúdo.' }}</p>
        </div>
        <div class="headerActions">
          <span class="blockCounter" v-if="blockCount > 0">
            <i class="mdi mdi-cube-outline"></i>
            {{ blockCount }} bloco{{ blockCount !== 1 ? 's' : '' }}
          </span>
          <div class="viewModeToggle">
            <button
              class="viewModeBtn"
              :class="{ active: viewMode === 'edit' }"
              title="Editar"
              @click="viewMode = 'edit'"
            >
              <i class="mdi mdi-pencil"></i>
              <span>Editar</span>
            </button>
            <button
              class="viewModeBtn"
              :class="{ active: viewMode === 'preview' }"
              title="Visualizar"
              @click="viewMode = 'preview'"
            >
              <i class="mdi mdi-eye-outline"></i>
              <span>Visualizar</span>
            </button>
          </div>
          <button class="saveBtn" @click="save" :disabled="isSaving">
            <i :class="isSaving ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-save-outline'"></i>
            {{ isSaving ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar') }}
          </button>
        </div>
      </div>

      <Transition name="error-banner">
        <div v-if="showDraftBanner" class="draftBanner animate-fade-in-up">
          <div class="draftBannerIcon">
            <i class="mdi mdi-file-restore-outline"></i>
          </div>
          <div class="draftBannerText">
            <strong>Encontramos um rascunho não salvo</strong>
            <p>Deseja continuar de onde parou ou começar do zero?</p>
          </div>
          <div class="draftBannerActions">
            <button class="successBtn successBtnPrimary" @click="restoreDraft">
              <i class="mdi mdi-file-restore-outline"></i>
              Restaurar
            </button>
            <button class="successBtn" @click="discardDraft">
              <i class="mdi mdi-trash-can-outline"></i>
              Descartar
            </button>
          </div>
        </div>
      </Transition>

      <Transition name="error-banner">
        <div v-if="showErrors && Object.keys(errors).length > 0" class="errorBanner animate-fade-in-up">
          <div class="errorBannerIcon">
            <i class="mdi mdi-alert-circle-outline"></i>
          </div>
          <div class="errorBannerText">
            <strong>Corrija os erros antes de salvar</strong>
            <p>{{ Object.keys(errors).length }} campo{{ Object.keys(errors).length > 1 ? 's' : '' }} precisa{{ Object.keys(errors).length === 1 ? '' : 'm' }} de atenção.</p>
          </div>
        </div>
      </Transition>

      <Transition name="error-banner">
        <div v-if="savedAtividade" class="successBanner animate-fade-in-up">
          <div class="successBannerIcon">
            <i class="mdi mdi-check-circle-outline"></i>
          </div>
          <div class="successBannerText">
            <strong>Atividade criada com sucesso!</strong>
            <p>"{{ savedAtividade.title }}" foi salva na disciplina.</p>
          </div>
          <div class="successBannerActions">
            <RouterLink
              :to="`/atividade/${savedDiscId}/${savedAtividade.id}`"
              class="successBtn successBtnPrimary"
            >
              <i class="mdi mdi-eye-outline"></i>
              Ver atividade
            </RouterLink>
            <button class="successBtn" @click="startNewActivity">
              <i class="mdi mdi-plus-circle-outline"></i>
              Criar outra
            </button>
          </div>
        </div>
      </Transition>

      <template v-if="!savedAtividade">
      <div class="formCard animate-fade-in-up delay-1">
        <div class="formBody">
          <div class="fieldGroup">
            <input
              v-model="title"
              type="text"
              class="titleInput"
              :class="{ 'hasError': showErrors && errors.title }"
              placeholder="Título da atividade"
            />
            <Transition name="field-error">
              <span v-if="showErrors && errors.title" class="fieldError">
                <i class="mdi mdi-alert-circle-outline"></i>
                {{ errors.title }}
              </span>
            </Transition>
          </div>

          <input
            v-model="description"
            type="text"
            class="descInput"
            placeholder="Descrição (opcional)"
          />

          <div class="formMeta">
            <div class="metaField">
              <label class="metaLabel">
                <i class="mdi mdi-calendar-outline"></i>
                Ano
              </label>
              <select
                v-model="selectedAno"
                class="metaSelect"
                :class="{ 'hasError': showErrors && errors.ano }"
              >
                <option value="">Selecione...</option>
                <option v-for="ano in anosList" :key="ano.id" :value="ano.id">{{ ano.label }}</option>
              </select>
              <Transition name="field-error">
                <span v-if="showErrors && errors.ano" class="fieldError">
                  <i class="mdi mdi-alert-circle-outline"></i>
                  {{ errors.ano }}
                </span>
              </Transition>
            </div>
            <div class="metaField">
              <label class="metaLabel">
                <i class="mdi mdi-book-outline"></i>
                Disciplina
              </label>
              <select
                v-model="selectedDisc"
                class="metaSelect"
                :class="{ 'hasError': showErrors && errors.disc }"
                :disabled="!selectedAno"
              >
                <option value="">Selecione...</option>
                <option v-for="disc in disciplinasDoAno" :key="disc.id" :value="disc.id">{{ disc.name }}</option>
              </select>
              <Transition name="field-error">
                <span v-if="showErrors && errors.disc" class="fieldError">
                  <i class="mdi mdi-alert-circle-outline"></i>
                  {{ errors.disc }}
                </span>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <div class="builderLayout">
      <div v-if="viewMode !== 'preview'" class="blocksSection editorPane animate-fade-in-up delay-2">
        <div v-if="showErrors && errors.blocks" class="blocksError animate-fade-in-up">
          <i class="mdi mdi-alert-circle-outline"></i>
          {{ errors.blocks }}
        </div>

        <div v-if="blocks.length === 0" class="emptyBlocks">
          <div class="emptyBlocksIcon">
            <i class="mdi mdi-cube-outline"></i>
          </div>
          <h3>Nenhum bloco ainda</h3>
          <p>Adicione blocos de texto, código, imagens e questões para montar sua atividade.</p>
          <button class="addBtnBig" @click="openAddMenu(blocks.length)">
            <i class="mdi mdi-plus-circle-outline"></i>
            Adicionar primeiro bloco
          </button>
        </div>

        <template v-else>
          <TransitionGroup name="block" tag="div" class="blocksList">
            <div
              v-for="(block, idx) in blocks"
              :key="block.id"
              class="blockWrapper"
              :class="{ isDragging: draggingIdx === idx, isDragOver: dragOverIdx === idx && draggingIdx !== idx }"
              @dragover.prevent="onBlockDragOver(idx)"
              @dragleave="dragOverIdx === idx && (dragOverIdx = null)"
              @drop.prevent="onBlockDrop(idx)"
            >
              <div class="blockActions">
                <span
                  class="blockAction dragHandle"
                  title="Arrastar para reordenar"
                  draggable="true"
                  @dragstart="onBlockDragStart(idx, $event)"
                  @dragend="resetBlockDrag"
                >
                  <i class="mdi mdi-drag-vertical"></i>
                </span>
                <button class="blockAction" title="Mover para cima" @click="moveBlock(idx, -1)" :disabled="idx === 0">
                  <i class="mdi mdi-chevron-up"></i>
                </button>
                <button class="blockAction" title="Mover para baixo" @click="moveBlock(idx, 1)" :disabled="idx === blocks.length - 1">
                  <i class="mdi mdi-chevron-down"></i>
                </button>
                <button class="blockAction" title="Duplicar" @click="duplicateBlock(idx)">
                  <i class="mdi mdi-content-copy"></i>
                </button>
                <button class="blockAction blockActionDelete" title="Remover" @click="removeBlock(idx)">
                  <i class="mdi mdi-delete-outline"></i>
                </button>
              </div>

              <div class="blockCard" :class="`block-${block.type}`">
                <div class="blockCardHeader">
                  <div class="blockTypeBadge">
                    <i :class="`mdi ${getBlockIcon(block.type)}`"></i>
                    {{ getBlockLabel(block.type) }}
                  </div>
                  <span class="blockNumber">
                    #{{ idx + 1 }}
                  </span>
                </div>

                <template v-if="block.type === 'text'">
                  <textarea
                    v-model="block.content"
                    class="blockTextarea"
                    placeholder="Escreva o texto aqui...&#10;&#10;Texto simples sem formatação."
                    rows="4"
                  ></textarea>
                  <div class="blockMeta">
                    <span class="charCount">{{ block.content?.length || 0 }} caracteres</span>
                  </div>
                </template>

                <template v-else-if="block.type === 'markdown'">
                  <textarea
                    v-model="block.content"
                    class="blockTextarea"
                    placeholder="Escreva em Markdown...&#10;&#10;**negrito**, *itálico*, `código`&#10;&#10;# Título&#10;- Lista"
                    rows="4"
                  ></textarea>
                  <div class="blockMeta">
                    <span class="charCount">{{ block.content?.length || 0 }} caracteres</span>
                  </div>
                  <div class="blockPreview" v-if="block.content">
                    <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
                  </div>
                </template>

                <template v-else-if="block.type === 'heading'">
                  <div class="headingRow">
                    <select v-model="block.level" class="headingLevel">
                      <option :value="1">H1</option>
                      <option :value="2">H2</option>
                      <option :value="3">H3</option>
                    </select>
                    <input
                      v-model="block.content"
                      class="headingInput"
                      :placeholder="`Título nível ${block.level}`"
                    />
                  </div>
                </template>

                <template v-else-if="block.type === 'code'">
                  <div class="codeHeader">
                    <select v-model="block.language" class="langSelect">
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="sql">SQL</option>
                      <option value="java">Java</option>
                      <option value="c">C</option>
                      <option value="php">PHP</option>
                      <option value="markdown">Markdown</option>
                      <option value="plaintext">Texto</option>
                    </select>
                  </div>
                  <textarea
                    v-model="block.content"
                    class="codeTextarea"
                    placeholder="// Cole ou escreva o código aqui..."
                    rows="6"
                    spellcheck="false"
                  ></textarea>
                </template>

                <template v-else-if="block.type === 'image'">
                  <input
                    v-model="block.url"
                    class="blockInput"
                    placeholder="URL da imagem (https://...)"
                  />
                  <input
                    v-model="block.alt"
                    class="blockInput blockInputSecondary"
                    placeholder="Texto alternativo (opcional)"
                  />
                  <div v-if="block.url" class="imagePreview">
                    <img :src="block.url" :alt="block.alt || 'Preview'" @error="$event.target.style.display='none'" />
                  </div>
                </template>

                <template v-else-if="block.type === 'list'">
                  <div class="listControls">
                    <button class="listTypeBtn" :class="{ active: !block.ordered }" @click="block.ordered = false">
                      <i class="mdi mdi-format-list-bulleted"></i>
                      Marcadores
                    </button>
                    <button class="listTypeBtn" :class="{ active: block.ordered }" @click="block.ordered = true">
                      <i class="mdi mdi-format-list-numbered"></i>
                      Numerada
                    </button>
                  </div>
                  <div class="listItems">
                    <div v-for="(item, i) in block.items" :key="i" class="listItemRow">
                      <span class="listMarker">{{ block.ordered ? `${i + 1}.` : '•' }}</span>
                      <input
                        v-model="block.items[i]"
                        class="listItemInput"
                        :placeholder="`Item ${i + 1}`"
                        @keydown.enter="addListItem(block)"
                      />
                      <button class="listItemRemove" @click="removeListItem(block, i)" :disabled="block.items.length <= 1">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                    <button class="addListItemBtn" @click="addListItem(block)">
                      <i class="mdi mdi-plus"></i>
                      Adicionar item
                    </button>
                  </div>
                </template>

                <template v-else-if="block.type === 'quote'">
                  <textarea
                    v-model="block.content"
                    class="blockTextarea"
                    placeholder="Escreva a citação aqui..."
                    rows="3"
                  ></textarea>
                  <input
                    v-model="block.author"
                    class="blockInput blockInputSecondary"
                    placeholder="Autor da citação (opcional)"
                  />
                </template>

                <template v-else-if="block.type === 'alert'">
                  <div class="alertTypeRow">
                    <button
                      v-for="at in alertTypes"
                      :key="at.type"
                      type="button"
                      class="alertTypeBtn"
                      :class="{ active: block.tipo === at.type }"
                      @click="block.tipo = at.type"
                    >
                      <i :class="`mdi ${at.icon}`"></i>
                      {{ at.label }}
                    </button>
                  </div>
                  <textarea
                    v-model="block.content"
                    class="blockTextarea"
                    placeholder="Texto do destaque..."
                    rows="3"
                  ></textarea>
                  <div class="blockPreview" v-if="block.content">
                    <div class="alertPreview" :class="`alert-${block.tipo}`">
                      <i :class="`mdi ${getAlertIcon(block.tipo)}`" class="alertPreviewIcon"></i>
                      <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
                    </div>
                  </div>
                </template>

                <template v-else-if="block.type === 'link'">
                  <input
                    v-model="block.url"
                    class="blockInput"
                    placeholder="URL do link (https://...)"
                  />
                  <input
                    v-model="block.label"
                    class="blockInput"
                    placeholder="Texto do link"
                  />
                  <input
                    v-model="block.desc"
                    class="blockInput blockInputSecondary"
                    placeholder="Descrição curta (opcional)"
                  />
                  <div v-if="block.url" class="blockPreview">
                    <div class="linkPreview">
                      <div class="linkPreviewIcon">
                        <i class="mdi mdi-link-variant"></i>
                      </div>
                      <div class="linkPreviewBody">
                        <span class="linkPreviewLabel">{{ block.label || block.url }}</span>
                        <span class="linkPreviewUrl">{{ block.url }}</span>
                        <span v-if="block.desc" class="linkPreviewDesc">{{ block.desc }}</span>
                      </div>
                      <i class="mdi mdi-open-in-new linkPreviewOpen"></i>
                    </div>
                  </div>
                </template>

                <template v-else-if="block.type === 'video'">
                  <input
                    v-model="block.url"
                    class="blockInput"
                    placeholder="URL do vídeo (YouTube ou Vimeo)"
                  />
                  <input
                    v-model="block.title"
                    class="blockInput blockInputSecondary"
                    placeholder="Título do vídeo (opcional)"
                  />
                  <div v-if="block.url" class="blockPreview">
                    <div v-if="getVideoEmbed(block.url)" class="videoPreview">
                      <iframe
                        :src="getVideoEmbed(block.url)"
                        title="Pré-visualização do vídeo"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        loading="lazy"
                      ></iframe>
                    </div>
                    <p v-else class="videoInvalid">
                      <i class="mdi mdi-alert-circle-outline"></i>
                      URL de vídeo não reconhecida. Use links do YouTube ou Vimeo.
                    </p>
                  </div>
                </template>

                <template v-else-if="block.type === 'table'">
                  <div class="tableControls">
                    <button type="button" class="tableControlBtn" @click="addTableRow(block)">
                      <i class="mdi mdi-table-row-plus-after"></i>
                      Linha
                    </button>
                    <button type="button" class="tableControlBtn" @click="addTableCol(block)">
                      <i class="mdi mdi-table-column-plus-after"></i>
                      Coluna
                    </button>
                    <button type="button" class="tableControlBtn" @click="removeTableRow(block)" :disabled="block.rows.length <= 1">
                      <i class="mdi mdi-table-row-remove"></i>
                      Linha
                    </button>
                    <button type="button" class="tableControlBtn" @click="removeTableCol(block)" :disabled="(block.rows[0]?.length || 0) <= 1">
                      <i class="mdi mdi-table-column-remove"></i>
                      Coluna
                    </button>
                  </div>
                  <div class="tableHeaderToggle">
                    <label class="checkToggle">
                      <input type="checkbox" v-model="block.hasHeader" />
                      <span class="checkToggleBox"><i class="mdi mdi-check"></i></span>
                      Usar primeira linha como cabeçalho
                    </label>
                  </div>
                  <div class="tableEditor">
                    <table>
                      <tbody>
                        <tr v-for="(row, ri) in block.rows" :key="ri">
                          <td v-for="(cell, ci) in row" :key="ci">
                            <input
                              v-model="block.rows[ri][ci]"
                              class="tableCellInput"
                              :class="{ tableCellHeader: block.hasHeader && ri === 0 }"
                              :placeholder="`C${ci + 1}`"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>

                <template v-else-if="block.type === 'file'">
                  <input
                    v-model="block.label"
                    class="blockInput"
                    placeholder="Nome do arquivo (ex: Lista 03 — Banco de Dados)"
                  />
                  <input
                    v-model="block.url"
                    class="blockInput"
                    placeholder="URL do arquivo (https://...)"
                  />
                  <div class="blockInputRow">
                    <input
                      v-model="block.size"
                      class="blockInput"
                      placeholder="Tamanho (ex: 2.4 MB)"
                    />
                    <span class="fileTypeBadge" v-if="getFileType(block.url)">
                      <i :class="`mdi ${getFileIcon(getFileType(block.url))}`"></i>
                      {{ getFileType(block.url).toUpperCase() }}
                    </span>
                  </div>
                  <input
                    v-model="block.desc"
                    class="blockInput blockInputSecondary"
                    placeholder="Descrição (opcional)"
                  />
                  <div v-if="block.url" class="blockPreview">
                    <div class="fileCardPreview">
                      <div class="fileCardIcon">
                        <i :class="`mdi ${getFileIcon(getFileType(block.url))}`"></i>
                      </div>
                      <div class="fileCardBody">
                        <span class="fileCardName">{{ block.label || block.url }}</span>
                        <span class="fileCardMeta">
                          {{ getFileType(block.url).toUpperCase() }}
                          <template v-if="block.size"> · {{ block.size }}</template>
                        </span>
                        <span v-if="block.desc" class="fileCardDesc">{{ block.desc }}</span>
                      </div>
                      <i class="mdi mdi-download fileCardDownload"></i>
                    </div>
                  </div>
                </template>

                <template v-else-if="block.type === 'links'">
                  <div v-for="(lk, i) in block.links" :key="i" class="linkGroup">
                    <div class="groupHead">
                      <span class="groupLabel">Referência {{ i + 1 }}</span>
                      <button class="groupRemoveBtn" @click="removeLinkItem(block, i)" :disabled="block.links.length <= 1">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                    <input
                      v-model="lk.title"
                      class="blockInput"
                      :placeholder="`Título (ex: Documentação do Vue)`"
                    />
                    <input
                      v-model="lk.url"
                      class="blockInput"
                      :placeholder="`URL (https://...)`"
                    />
                    <input
                      v-model="lk.desc"
                      class="blockInput blockInputSecondary"
                      :placeholder="`Descrição (opcional)`"
                    />
                  </div>
                  <button type="button" class="addListItemBtn" @click="addLinkItem(block)">
                    <i class="mdi mdi-plus"></i>
                    Adicionar referência
                  </button>
                </template>

                <template v-else-if="block.type === 'gallery'">
                  <input
                    v-model="block.caption"
                    class="blockInput"
                    placeholder="Legenda do conjunto (opcional)"
                  />
                  <div v-for="(img, i) in block.images" :key="i" class="galleryItem">
                    <div class="groupHead">
                      <span class="groupLabel">Imagem {{ i + 1 }}</span>
                      <button class="groupRemoveBtn" @click="removeGalleryImage(block, i)" :disabled="block.images.length <= 1">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                    <input
                      v-model="img.url"
                      class="blockInput"
                      :placeholder="`URL da imagem ${i + 1} (https://...)`"
                    />
                    <input
                      v-model="img.caption"
                      class="blockInput blockInputSecondary"
                      :placeholder="`Legenda da imagem ${i + 1} (opcional)`"
                    />
                    <img v-if="img.url" :src="img.url" :alt="img.caption || ''" class="galleryThumb" />
                  </div>
                  <button type="button" class="addListItemBtn" @click="addGalleryImage(block)">
                    <i class="mdi mdi-plus"></i>
                    Adicionar imagem
                  </button>
                </template>

                <template v-else-if="block.type === 'terminal'">
                  <div v-for="(cmd, i) in block.commands" :key="i" class="cmdRow">
                    <span class="cmdPrompt">$</span>
                    <input
                      v-model="block.commands[i]"
                      class="cmdInput"
                      :placeholder="`Comando ${i + 1} (ex: npm install)`"
                      @keydown.enter="addTerminalCmd(block)"
                    />
                    <button class="listItemRemove" @click="removeTerminalCmd(block, i)" :disabled="block.commands.length <= 1">
                      <i class="mdi mdi-close"></i>
                    </button>
                  </div>
                  <button type="button" class="addListItemBtn" @click="addTerminalCmd(block)">
                    <i class="mdi mdi-plus"></i>
                    Adicionar comando
                  </button>
                  <div v-if="block.commands.some((c) => c)" class="blockPreview">
                    <div class="terminalPreview">
                      <div class="terminalBar">
                        <span class="termDot termDotRed"></span>
                        <span class="termDot termDotYellow"></span>
                        <span class="termDot termDotGreen"></span>
                        <span class="termTitle">terminal</span>
                      </div>
                      <div class="terminalBody">
                        <div v-for="(cmd, i) in block.commands.filter(Boolean)" :key="i" class="termLine">
                          <span class="termPrompt">$</span> {{ cmd }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <template v-else-if="block.type === 'steps'">
                  <div v-for="(st, i) in block.steps" :key="i" class="stepEditor">
                    <span class="stepNumber">{{ String(i + 1).padStart(2, '0') }}</span>
                    <div class="stepEditorFields">
                      <input
                        v-model="st.title"
                        class="blockInput"
                        :placeholder="`Título do passo ${i + 1}`"
                      />
                      <textarea
                        v-model="st.desc"
                        class="blockTextarea blockTextareaSmall"
                        :placeholder="`Descrição do passo ${i + 1} (opcional)`"
                        rows="2"
                      ></textarea>
                      <button class="listItemRemove stepRemoveBtn" @click="removeStepItem(block, i)" :disabled="block.steps.length <= 1">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                  </div>
                  <button type="button" class="addListItemBtn" @click="addStepItem(block)">
                    <i class="mdi mdi-plus"></i>
                    Adicionar passo
                  </button>
                </template>

                <template v-else-if="block.type === 'checklist'">
                  <div v-for="(it, i) in block.items" :key="i" class="checkRow">
                    <label class="checkToggle">
                      <input type="checkbox" v-model="it.done" />
                      <span class="checkToggleBox"><i class="mdi mdi-check"></i></span>
                    </label>
                    <input
                      v-model="it.text"
                      class="checkInput"
                      :class="{ done: it.done }"
                      :placeholder="`Requisito ${i + 1}`"
                    />
                    <button class="listItemRemove" @click="removeCheckItem(block, i)" :disabled="block.items.length <= 1">
                      <i class="mdi mdi-close"></i>
                    </button>
                  </div>
                  <button type="button" class="addListItemBtn" @click="addCheckItem(block)">
                    <i class="mdi mdi-plus"></i>
                    Adicionar requisito
                  </button>
                </template>

                <template v-else-if="block.type === 'accordion'">
                  <div v-for="(it, i) in block.items" :key="i" class="accEditor">
                    <div class="groupHead">
                      <input
                        v-model="it.title"
                        class="blockInput accTitleInput"
                        :placeholder="`Pergunta ${i + 1} (ex: O que é Git?)`"
                      />
                      <button class="groupRemoveBtn" @click="removeAccItem(block, i)" :disabled="block.items.length <= 1">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                    <textarea
                      v-model="it.content"
                      class="blockTextarea"
                      :placeholder="`Resposta ${i + 1}...`"
                      rows="2"
                    ></textarea>
                  </div>
                  <button type="button" class="addListItemBtn" @click="addAccItem(block)">
                    <i class="mdi mdi-plus"></i>
                    Adicionar pergunta
                  </button>
                </template>

                <template v-else-if="block.type === 'embed'">
                  <input
                    v-model="block.url"
                    class="blockInput"
                    placeholder="URL do conteúdo a incorporar (https://...) — use links de embed"
                  />
                  <div class="blockInputRow">
                    <input
                      v-model="block.title"
                      class="blockInput"
                      placeholder="Título (acessibilidade)"
                    />
                    <input
                      v-model="block.height"
                      class="blockInput blockInputSmall"
                      placeholder="Altura (px)"
                    />
                  </div>
                  <div v-if="block.url" class="blockPreview">
                    <div class="embedPreviewWrap">
                      <iframe
                        :src="block.url"
                        :title="block.title || 'Conteúdo incorporado'"
                        :style="{ height: `${block.height || 400}px` }"
                        frameborder="0"
                        loading="lazy"
                        allowfullscreen
                      ></iframe>
                    </div>
                  </div>
                </template>

                <template v-else-if="block.type === 'divider'">
                  <div class="dividerPreview">
                    <hr />
                  </div>
                </template>

                <template v-else-if="block.type === 'question'">
                  <textarea
                    v-model="block.enunciado"
                    class="blockTextarea"
                    placeholder="Escreva o enunciado da questão..."
                    rows="3"
                  ></textarea>
                  <div class="blockMeta">
                    <span class="charCount">{{ block.enunciado?.length || 0 }} caracteres</span>
                  </div>
                  <div class="questionTypeRow">
                    <button
                      class="tipoBtn"
                      :class="{ active: block.tipo === 'exercicio' }"
                      @click="block.tipo = 'exercicio'"
                    >
                      <i class="mdi mdi-pencil-outline"></i>
                      Exercício
                    </button>
                    <button
                      class="tipoBtn"
                      :class="{ active: block.tipo === 'teorica' }"
                      @click="block.tipo = 'teorica'"
                    >
                      <i class="mdi mdi-text-box-outline"></i>
                      Teórica
                    </button>
                  </div>
                  <div class="questionTypeRow">
                    <button
                      v-for="qm in questionModos"
                      :key="qm.value"
                      class="tipoBtn modoBtn"
                      :class="{ active: block.modo === qm.value }"
                      @click="block.modo = qm.value"
                    >
                      <i :class="`mdi ${qm.icon}`"></i>
                      {{ qm.label }}
                    </button>
                  </div>
                  <div v-if="block.modo === 'multipla_escolha'" class="alternativasEditor">
                    <div v-for="(alt, ai) in block.alternativas" :key="ai" class="alternativaRow">
                      <label class="radioCorrect">
                        <input type="radio" name="correta" :value="ai" v-model="block.correta" />
                        <span class="radioCorrectBox"><i class="mdi mdi-check"></i></span>
                      </label>
                      <input
                        v-model="alt.texto"
                        class="blockInput"
                        :placeholder="`Alternativa ${String.fromCharCode(65 + ai)}`"
                      />
                      <button class="listItemRemove" @click="removeAlternativa(block, ai)" :disabled="block.alternativas.length <= 2">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                    <button type="button" class="addListItemBtn" @click="addAlternativa(block)">
                      <i class="mdi mdi-plus"></i>
                      Adicionar alternativa
                    </button>
                  </div>
                  <div v-else-if="block.modo === 'verdadeiro_falso'" class="vfRow">
                    <button
                      class="tipoBtn"
                      :class="{ active: block.respostaVf === true }"
                      @click="block.respostaVf = true"
                    >
                      <i class="mdi mdi-check-circle-outline"></i>
                      Verdadeiro
                    </button>
                    <button
                      class="tipoBtn"
                      :class="{ active: block.respostaVf === false }"
                      @click="block.respostaVf = false"
                    >
                      <i class="mdi mdi-close-circle-outline"></i>
                      Falso
                    </button>
                  </div>
                  <div v-else-if="block.modo === 'programacao'" class="progFields">
                    <select v-model="block.linguagem" class="blockInput">
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="sql">SQL</option>
                      <option value="bash">Bash</option>
                      <option value="java">Java</option>
                    </select>
                    <textarea
                      v-model="block.codigoEsperado"
                      class="blockTextarea"
                      placeholder="Código esperado (opcional)"
                      rows="3"
                    ></textarea>
                  </div>
                  <div class="blockPreview" v-if="block.enunciado">
                    <div class="mdRender" v-html="renderMarkdown(block.enunciado)"></div>
                    <div v-if="block.modo === 'multipla_escolha' && block.alternativas.some((a) => a.texto)" class="previewAltList">
                      <template v-for="(alt, ai) in block.alternativas" :key="ai">
                        <div v-if="alt.texto" class="previewAltItem" :class="{ correta: ai === block.correta }">
                          <span class="previewAltBadge">{{ String.fromCharCode(65 + ai) }}</span>
                          <span class="previewAltText">{{ alt.texto }}</span>
                          <i v-if="ai === block.correta" class="mdi mdi-check previewAltCorrect"></i>
                        </div>
                      </template>
                    </div>
                    <div v-if="block.modo === 'verdadeiro_falso'" class="previewVf">
                      Resposta correta: <strong>{{ block.respostaVf ? 'Verdadeiro' : 'Falso' }}</strong>
                    </div>
                    <div v-if="block.modo === 'programacao' && block.codigoEsperado" class="previewProg">
                      <span class="previewProgLang">{{ block.linguagem }}</span>
                      <pre><code>{{ block.codigoEsperado }}</code></pre>
                    </div>
                  </div>
                </template>
              </div>

              <div class="addBlockBetween">
                <button class="addBtnSmall" @click="openAddMenu(idx)" title="Adicionar bloco aqui">
                  <i class="mdi mdi-plus"></i>
                </button>
                <div class="addLine"></div>
              </div>
            </div>
          </TransitionGroup>

          <div class="addBlockEnd">
            <button class="addBtnBig" @click="openAddMenu(blocks.length)">
              <i class="mdi mdi-plus-circle-outline"></i>
              Adicionar bloco
            </button>
          </div>

          <div class="formFooter">
            <div class="formStats">
              <span><i class="mdi mdi-cube-outline"></i> {{ blockCount }} bloco{{ blockCount !== 1 ? 's' : '' }}</span>
              <span v-if="questionCount > 0"><i class="mdi mdi-frequently-asked-questions"></i> {{ questionCount }} questão{{ questionCount !== 1 ? 'ões' : '' }}</span>
              <span><i class="mdi mdi-text"></i> {{ textLength }} caracteres</span>
            </div>
            <div class="formFooterActions">
              <button class="resetBtn" @click="resetForm">
                <i class="mdi mdi-refresh"></i>
                Limpar tudo
              </button>
              <button class="saveBtn saveBtnBottom" @click="save" :disabled="isSaving">
                <i :class="isSaving ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-save-outline'"></i>
                {{ isSaving ? 'Salvando...' : 'Salvar Atividade' }}
              </button>
            </div>
          </div>
        </template>

        <Transition name="fade">
          <div v-if="showAddMenu" class="addMenuOverlay" @click.self="closeAddMenu">
            <div class="addMenu animate-scale-in">
              <div class="addMenuHeader">
                <h3>Adicionar bloco</h3>
                <button class="closeMenuBtn" @click="closeAddMenu">
                  <i class="mdi mdi-close"></i>
                </button>
              </div>
              <div class="addMenuSearch">
                <i class="mdi mdi-magnify"></i>
                <input
                  v-model="addMenuQuery"
                  type="text"
                  placeholder="Buscar tipo de bloco..."
                  autofocus
                />
              </div>
              <div v-if="!filteredBlockTypes.length" class="addMenuEmpty">
                <i class="mdi mdi-text-search"></i>
                Nenhum tipo de bloco encontrado
              </div>
              <div v-else class="addMenuGrid">
                <button
                  v-for="bt in filteredBlockTypes"
                  :key="bt.type"
                  class="addMenuItem"
                  @click="addBlock(bt.type, addMenuIdx)"
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
        </Transition>
      </div>

      <div v-if="viewMode !== 'edit'" class="previewSection previewPane animate-fade-in-up delay-2">
        <div v-if="!title && !blocks.length" class="emptyPreview">
          <div class="emptyIcon">
            <i class="mdi mdi-eye-off-outline"></i>
          </div>
          <h3>Nada para visualizar</h3>
          <p>Adicione blocos para ver a pré-visualização.</p>
        </div>

        <div v-else class="previewCard">
          <div class="previewBody">
            <h1 v-if="title" class="previewTitle">{{ title }}</h1>
            <p v-if="description" class="previewDesc">{{ description }}</p>
            <div v-if="selectedAno || selectedDisc" class="previewMeta">
              <span v-if="selectedAno" class="previewTag">
                {{ anos[selectedAno]?.label }}
              </span>
              <span v-if="selectedDisc" class="previewTag previewTagDisc">
                {{ disciplinasDoAno.find(d => d.id === selectedDisc)?.name }}
              </span>
            </div>

            <div class="previewBlocks">
              <template v-for="block in blocks" :key="block.id">
                <div v-if="block.type === 'text'" class="previewBlock">
                  <p class="previewPlainText">{{ block.content }}</p>
                </div>

                <div v-else-if="block.type === 'markdown'" class="previewBlock">
                  <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
                </div>

                <div v-else-if="block.type === 'heading'" class="previewBlock">
                  <component :is="`h${block.level}`">{{ block.content }}</component>
                </div>

                <div v-else-if="block.type === 'code'" class="previewBlock">
                  <div class="previewCodeBlock">
                    <div class="previewCodeLang">{{ block.language }}</div>
                    <pre class="previewCode"><code>{{ block.content }}</code></pre>
                  </div>
                </div>

                <div v-else-if="block.type === 'image' && block.url" class="previewBlock">
                  <img :src="block.url" :alt="block.alt || ''" class="previewImage" />
                  <p v-if="block.alt" class="previewImageAlt">{{ block.alt }}</p>
                </div>

                <div v-else-if="block.type === 'list'" class="previewBlock">
                  <component :is="block.ordered ? 'ol' : 'ul'" class="previewList">
                    <li v-for="(item, i) in block.items.filter(Boolean)" :key="i">{{ item }}</li>
                  </component>
                </div>

                <div v-else-if="block.type === 'quote'" class="previewBlock">
                  <blockquote class="previewQuote">
                    <i class="mdi mdi-format-quote-open previewQuoteIcon"></i>
                    <p>{{ block.content }}</p>
                    <footer v-if="block.author" class="previewQuoteAuthor">— {{ block.author }}</footer>
                  </blockquote>
                </div>

                <div v-else-if="block.type === 'alert'" class="previewBlock">
                  <div class="previewAlert" :class="`alert-${block.tipo}`">
                    <i :class="`mdi ${getAlertIcon(block.tipo)}`" class="previewAlertIcon"></i>
                    <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
                  </div>
                </div>

                <div v-else-if="block.type === 'link'" class="previewBlock">
                  <a :href="block.url" class="previewLink" target="_blank" rel="noopener">
                    <div class="previewLinkIcon">
                      <i class="mdi mdi-link-variant"></i>
                    </div>
                    <div class="previewLinkBody">
                      <span class="previewLinkLabel">{{ block.label || block.url }}</span>
                      <span class="previewLinkUrl">{{ block.url }}</span>
                      <span v-if="block.desc" class="previewLinkDesc">{{ block.desc }}</span>
                    </div>
                    <i class="mdi mdi-open-in-new previewLinkOpen"></i>
                  </a>
                </div>

                <div v-else-if="block.type === 'video'" class="previewBlock">
                  <div v-if="getVideoEmbed(block.url)" class="previewVideoWrap">
                    <iframe
                      :src="getVideoEmbed(block.url)"
                      title="Vídeo"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                      loading="lazy"
                    ></iframe>
                  </div>
                  <p v-if="block.title" class="previewVideoTitle">{{ block.title }}</p>
                </div>

                <div v-else-if="block.type === 'table'" class="previewBlock">
                  <div class="previewTableWrap">
                    <table class="previewTable">
                      <thead v-if="block.hasHeader && block.rows.length">
                        <tr>
                          <th v-for="(cell, ci) in block.rows[0]" :key="ci">{{ cell }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, ri) in block.hasHeader ? block.rows.slice(1) : block.rows" :key="ri">
                          <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div v-else-if="block.type === 'file' && block.url" class="previewBlock">
                  <div class="fileCardPreview">
                    <div class="fileCardIcon">
                      <i :class="`mdi ${getFileIcon(getFileType(block.url))}`"></i>
                    </div>
                    <div class="fileCardBody">
                      <span class="fileCardName">{{ block.label || block.url }}</span>
                      <span class="fileCardMeta">
                        {{ getFileType(block.url).toUpperCase() }}
                        <template v-if="block.size"> · {{ block.size }}</template>
                      </span>
                      <span v-if="block.desc" class="fileCardDesc">{{ block.desc }}</span>
                    </div>
                    <i class="mdi mdi-download fileCardDownload"></i>
                  </div>
                </div>

                <div v-else-if="block.type === 'links'" class="previewBlock">
                  <div class="previewExtLinks">
                    <a
                      v-for="(lk, i) in block.links.filter((l) => l.title || l.url)"
                      :key="i"
                      :href="lk.url"
                      class="previewExtLink"
                      target="_blank"
                      rel="noopener"
                    >
                      <div class="previewExtLinkIcon">
                        <i class="mdi mdi-link-variant"></i>
                      </div>
                      <div class="previewExtLinkBody">
                        <span class="previewExtLinkTitle">{{ lk.title || lk.url }}</span>
                        <span v-if="lk.desc" class="previewExtLinkDesc">{{ lk.desc }}</span>
                        <span class="previewExtLinkUrl">{{ lk.url }}</span>
                      </div>
                      <i class="mdi mdi-open-in-new previewExtLinkOpen"></i>
                    </a>
                  </div>
                </div>

                <div v-else-if="block.type === 'gallery'" class="previewBlock">
                  <div class="previewGallery">
                    <figure v-for="(img, i) in block.images.filter((g) => g.url)" :key="i" class="previewGalleryFig">
                      <img :src="img.url" :alt="img.caption || ''" loading="lazy" />
                      <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
                    </figure>
                  </div>
                  <p v-if="block.caption" class="previewImageAlt">{{ block.caption }}</p>
                </div>

                <div v-else-if="block.type === 'terminal'" class="previewBlock">
                  <div class="terminalPreview">
                    <div class="terminalBar">
                      <span class="termDot termDotRed"></span>
                      <span class="termDot termDotYellow"></span>
                      <span class="termDot termDotGreen"></span>
                      <span class="termTitle">terminal</span>
                    </div>
                    <div class="terminalBody">
                      <div v-for="(cmd, i) in block.commands.filter(Boolean)" :key="i" class="termLine">
                        <span class="termPrompt">$</span> {{ cmd }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="block.type === 'steps'" class="previewBlock">
                  <ol class="previewSteps">
                    <li v-for="(st, i) in block.steps.filter((s) => s.title)" :key="i" class="previewStep">
                      <span class="previewStepNum">{{ String(i + 1).padStart(2, '0') }}</span>
                      <div class="previewStepBody">
                        <span class="previewStepTitle">{{ st.title }}</span>
                        <span v-if="st.desc" class="previewStepDesc">{{ st.desc }}</span>
                      </div>
                    </li>
                  </ol>
                </div>

                <div v-else-if="block.type === 'checklist'" class="previewBlock">
                  <ul class="previewChecklist">
                    <li v-for="(it, i) in block.items.filter((x) => x.text)" :key="i" class="previewCheckItem" :class="{ done: it.done }">
                      <i :class="it.done ? 'mdi mdi-checkbox-marked' : 'mdi mdi-checkbox-blank-outline'"></i>
                      <span>{{ it.text }}</span>
                    </li>
                  </ul>
                </div>

                <div v-else-if="block.type === 'accordion'" class="previewBlock">
                  <div v-for="(it, i) in block.items.filter((x) => x.title)" :key="i" class="previewAcc">
                    <details :open="i === 0">
                      <summary>
                        <span>{{ it.title }}</span>
                        <i class="mdi mdi-chevron-down previewAccChevron"></i>
                      </summary>
                      <div class="previewAccBody mdRender" v-html="renderMarkdown(it.content)"></div>
                    </details>
                  </div>
                </div>

                <div v-else-if="block.type === 'embed' && block.url" class="previewBlock">
                  <div class="embedPreviewWrap">
                    <iframe
                      :src="block.url"
                      :title="block.title || 'Conteúdo incorporado'"
                      :style="{ height: `${block.height || 400}px` }"
                      frameborder="0"
                      loading="lazy"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>

                <div v-else-if="block.type === 'divider'" class="previewBlock">
                  <hr class="previewHr" />
                </div>

                <div v-else-if="block.type === 'question'" class="previewBlock previewQuestion">
                  <div class="previewQuestionBadge" :class="block.tipo">
                    {{ block.tipo === 'exercicio' ? 'Exercício' : 'Teórica' }} · {{ getQuestionModoLabel(block.modo) }}
                  </div>
                  <div class="mdRender" v-html="renderMarkdown(block.enunciado)"></div>
                  <div v-if="block.modo === 'multipla_escolha'" class="previewAltList">
                    <template v-for="(alt, ai) in block.alternativas" :key="ai">
                      <div
                        v-if="alt.texto"
                        class="previewAltItem"
                        :class="{ correta: ai === block.correta }"
                      >
                        <span class="previewAltBadge">{{ String.fromCharCode(65 + ai) }}</span>
                        <span class="previewAltText">{{ alt.texto }}</span>
                        <i v-if="ai === block.correta" class="mdi mdi-check previewAltCorrect"></i>
                      </div>
                    </template>
                  </div>
                  <div v-if="block.modo === 'verdadeiro_falso'" class="previewVf">
                    Resposta correta: <strong>{{ block.respostaVf ? 'Verdadeiro' : 'Falso' }}</strong>
                  </div>
                  <div v-if="block.modo === 'programacao'" class="previewProg">
                    <span v-if="block.linguagem" class="previewProgLang">{{ block.linguagem }}</span>
                    <pre v-if="block.codigoEsperado"><code>{{ block.codigoEsperado }}</code></pre>
                  </div>
                  <p v-if="block.modo === 'discursiva'" class="previewDiscursiva">Resposta livre em texto.</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      </div>
      </template>
    </div>
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
  max-width: 780px;
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.createHeader {
  position: sticky;
  top: var(--header-h);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin: 0 calc(-1 * var(--sp-6)) var(--sp-6);
  padding: var(--sp-4) var(--sp-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-1);
  box-shadow: var(--shadow-sm);
}

.headerInfo {
  flex: 1;
  min-width: 0;
}

.pageTitle {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-1);
}

.pageDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.headerActions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.blockCounter {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 600;
}

.viewModeToggle {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
}

.viewModeBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-4);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.viewModeBtn:hover {
  color: var(--color-navy-accent);
}

.viewModeBtn.active {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.saveBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-5);
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.saveBtn:hover:not(:disabled) {
  background: var(--color-navy-accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.saveBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.errorBanner {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-danger-muted);
  border: 1px solid rgba(248, 113, 113, 0.2);
  margin-bottom: var(--sp-4);
}

.errorBannerIcon {
  flex-shrink: 0;
}

.errorBannerIcon i {
  font-size: 1.5rem;
  color: var(--color-danger);
}

.errorBannerText strong {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-danger);
}

.errorBannerText p {
  font-size: var(--text-xs);
  color: var(--color-text-4);
  margin-top: 2px;
}

.draftBanner {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-info-muted);
  border: 1px solid var(--color-info);
  margin-bottom: var(--sp-4);
}

.draftBannerIcon {
  flex-shrink: 0;
}

.draftBannerIcon i {
  font-size: 1.6rem;
  color: var(--color-info);
}

.draftBannerText {
  flex: 1;
  min-width: 0;
}

.draftBannerText strong {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  display: block;
  margin-bottom: 2px;
}

.draftBannerText p {
  font-size: var(--text-xs);
  color: var(--color-text-4);
}

.draftBannerActions {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}

@media (max-width: 560px) {
  .draftBanner {
    flex-wrap: wrap;
  }

  .draftBannerActions {
    width: 100%;
  }

  .draftBannerActions .successBtn {
    flex: 1;
    justify-content: center;
  }
}

.successBanner {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  background: var(--color-success-muted, rgba(34, 197, 94, 0.1));
  border: 1px solid rgba(34, 197, 94, 0.2);
  margin-bottom: var(--sp-4);
}

.successBannerIcon {
  flex-shrink: 0;
}

.successBannerIcon i {
  font-size: 1.8rem;
  color: var(--color-success, #22c55e);
}

.successBannerText {
  flex: 1;
}

.successBannerText strong {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-success, #22c55e);
  display: block;
  margin-bottom: 2px;
}

.successBannerText p {
  font-size: var(--text-xs);
  color: var(--color-text-4);
}

.successBannerActions {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.successBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  color: var(--color-text-3);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
  white-space: nowrap;
}

.successBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
  transform: translateY(-1px);
}

.successBtnPrimary {
  background: var(--color-success, #22c55e);
  border-color: var(--color-success, #22c55e);
  color: #ffffff;
}

.successBtnPrimary:hover {
  background: var(--color-success-hover, #16a34a);
  border-color: var(--color-success-hover, #16a34a);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
}

.fieldGroup {
  margin-bottom: var(--sp-3);
}

.fieldError {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-danger);
  margin-top: var(--sp-1);
}

.fieldError i {
  font-size: 0.85rem;
}

.hasError {
  border-color: var(--color-danger) !important;
}

.hasError:focus {
  box-shadow: 0 0 0 3px var(--color-danger-muted) !important;
}

.blocksError {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-danger-muted);
  color: var(--color-danger);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--sp-4);
}

.emptyBlocks {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  text-align: center;
  padding: var(--sp-16) var(--sp-6);
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 2px dashed var(--color-border-2);
}

.emptyBlocksIcon {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.emptyBlocksIcon i {
  font-size: 2rem;
  color: var(--color-text-5);
}

.emptyBlocks h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
}

.emptyBlocks p {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  max-width: 380px;
}

.toast {
  position: fixed;
  bottom: var(--sp-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-lg);
  background: var(--color-success);
  color: #ffffff;
  font-size: var(--text-sm);
  font-weight: 600;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}

.toast i {
  font-size: 1.2rem;
}

.formCard {
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  overflow: hidden;
  margin-bottom: var(--sp-6);
  position: relative;
}

.formBody {
  padding: var(--sp-6);
}

.titleInput {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-1);
  font-family: var(--font-sans);
  padding: var(--sp-2) 0;
  border-bottom: 2px solid var(--color-border-1);
  transition: border-color var(--duration-fast) var(--ease-out);
  margin-bottom: var(--sp-1);
}

.titleInput:focus {
  border-bottom-color: var(--color-navy-accent);
}

.titleInput::placeholder {
  color: var(--color-text-5);
}

.descInput {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-base);
  color: var(--color-text-3);
  font-family: var(--font-sans);
  padding: var(--sp-2) 0;
  margin-bottom: var(--sp-4);
}

.descInput::placeholder {
  color: var(--color-text-5);
}

.formMeta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-4);
}

.metaField {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.metaLabel {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-4);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.metaLabel i {
  font-size: 0.95rem;
  color: var(--color-navy-accent);
}

.metaSelect {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%239ca3af'%3E%3Cpath d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: var(--sp-8);
}

.metaSelect:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.metaSelect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.blocksSection {
  position: relative;
}

.blocksList {
  display: flex;
  flex-direction: column;
}

.blockWrapper {
  position: relative;
}

.blockActions {
  position: absolute;
  left: -52px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.blockWrapper:hover .blockActions,
.blockWrapper:focus-within .blockActions {
  opacity: 1;
}

.blockAction {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  color: var(--color-text-4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-size: 1rem;
}

.blockAction:hover {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.blockAction:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.blockActionDelete:hover {
  background: var(--color-danger-muted);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.dragHandle {
  cursor: grab;
}

.dragHandle:active {
  cursor: grabbing;
}

.dragHandle:hover {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.blockWrapper.isDragging {
  opacity: 0.4;
}

.blockWrapper.isDragging .blockCard {
  border-style: dashed;
}

.blockWrapper.isDragOver .blockCard {
  border-color: var(--color-navy-accent);
  box-shadow: 0 -3px 0 var(--color-navy-accent);
}

/* Em telas estreitas ou touch (sem :hover confiável), as ações do bloco viram
   uma barra de ferramentas normal acima do card, em vez de flutuar por cima. */
@media (max-width: 900px), (hover: none) and (pointer: coarse) {
  .blockWrapper {
    display: flex;
    flex-direction: column;
    gap: var(--sp-2);
  }

  .blockActions {
    position: static;
    align-self: flex-end;
    transform: none;
    flex-direction: row;
    opacity: 1;
  }

  .blockAction {
    width: 40px;
    height: 40px;
  }
}

.blockCard {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  padding: var(--sp-6);
  transition: all var(--duration-fast) var(--ease-out);
}

.blockCard:hover {
  border-color: var(--color-border-2);
  box-shadow: var(--shadow-md);
}

.blockCard:focus-within {
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.blockCardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.blockTypeBadge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: var(--text-xs);
  font-weight: 600;
}

.blockTypeBadge i {
  font-size: 0.85rem;
}

.blockNumber {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  font-weight: 600;
}

.blockMeta {
  display: flex;
  justify-content: flex-end;
}

.charCount {
  font-size: 0.7rem;
  color: var(--color-text-5);
}

.blockTextarea,
.blockInput {
  width: 100%;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  padding: var(--sp-3) var(--sp-4);
  resize: vertical;
  transition: all var(--duration-fast) var(--ease-out);
  line-height: var(--leading-relaxed);
}

.blockTextarea:focus,
.blockInput:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.blockTextarea::placeholder,
.blockInput::placeholder {
  color: var(--color-text-5);
}

.blockPreview {
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border-1);
}

.headingRow {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.headingLevel {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-navy-accent);
  font-size: var(--text-sm);
  font-weight: 700;
  font-family: var(--font-sans);
  cursor: pointer;
}

.headingInput {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-1);
  font-family: var(--font-sans);
  padding: var(--sp-2) 0;
  border-bottom: 2px solid var(--color-border-1);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.headingInput:focus {
  border-bottom-color: var(--color-navy-accent);
}


.langSelect {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-2);
  font-size: var(--text-xs);
  font-family: var(--font-sans);
  cursor: pointer;
}

.codeTextarea {
  width: 100%;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-navy);
  color: #e2e8f0;
  font-size: var(--text-sm);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  padding: var(--sp-4);
  resize: vertical;
  line-height: 1.6;
  tab-size: 2;
}

.codeTextarea:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.imagePreview {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-1);
}

.imagePreview img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

/* ── Quote / Alert / Link / Video / Table (editor) ── */
.alertTypeRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.alertTypeBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.alertTypeBtn i {
  font-size: 1rem;
}

.alertTypeBtn.active {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.alertPreview,
.previewAlert {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
}

.alertPreview .mdRender,
.previewAlert .mdRender {
  flex: 1;
  min-width: 0;
}

.alertPreview .mdRender :deep(p:last-child),
.previewAlert .mdRender :deep(p:last-child) {
  margin-bottom: 0;
}

.alertPreviewIcon,
.previewAlertIcon {
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.alertPreview.alert-info,
.previewAlert.alert-info {
  background: var(--color-info-muted);
  border-color: var(--color-info);
}

.alertPreview.alert-info .alertPreviewIcon,
.previewAlert.alert-info .previewAlertIcon {
  color: var(--color-info);
}

.alertPreview.alert-success,
.previewAlert.alert-success {
  background: var(--color-success-muted);
  border-color: var(--color-success);
}

.alertPreview.alert-success .alertPreviewIcon,
.previewAlert.alert-success .previewAlertIcon {
  color: var(--color-success);
}

.alertPreview.alert-warning,
.previewAlert.alert-warning {
  background: var(--color-warning-muted);
  border-color: var(--color-warning);
}

.alertPreview.alert-warning .alertPreviewIcon,
.previewAlert.alert-warning .previewAlertIcon {
  color: var(--color-warning);
}

.alertPreview.alert-danger,
.previewAlert.alert-danger {
  background: var(--color-danger-muted);
  border-color: var(--color-danger);
}

.alertPreview.alert-danger .alertPreviewIcon,
.previewAlert.alert-danger .previewAlertIcon {
  color: var(--color-danger);
}

.alertPreview.alert-erro,
.previewAlert.alert-erro {
  background: var(--color-purple-muted);
  border-color: var(--color-purple);
}

.alertPreview.alert-erro .alertPreviewIcon,
.previewAlert.alert-erro .previewAlertIcon {
  color: var(--color-purple);
}

.linkPreview,
.previewLink {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.previewLink:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.linkPreviewIcon,
.previewLinkIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.linkPreviewBody,
.previewLinkBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.linkPreviewLabel,
.previewLinkLabel {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.linkPreviewUrl,
.previewLinkUrl {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.linkPreviewDesc,
.previewLinkDesc {
  font-size: var(--text-xs);
  color: var(--color-text-4);
}

.linkPreviewOpen,
.previewLinkOpen {
  font-size: 1.1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
}

.videoPreview,
.previewVideoWrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.videoPreview iframe,
.previewVideoWrap iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.videoInvalid {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--text-sm);
  color: var(--color-warning);
}

.tableControls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.tableControlBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.tableControlBtn:hover:not(:disabled) {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.tableControlBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tableEditor {
  overflow-x: auto;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
}

.tableEditor table {
  width: 100%;
  border-collapse: collapse;
}

.tableEditor td {
  padding: var(--sp-1);
  border: 1px solid var(--color-border-1);
  min-width: 80px;
}

.tableCellInput {
  width: 100%;
  border: none;
  outline: none;
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.tableCellInput:focus {
  background: var(--color-surface-2);
  box-shadow: inset 0 0 0 1px var(--color-navy-accent);
}

.tableCellInput.tableCellHeader {
  font-weight: 700;
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.blockInputRow {
  display: flex;
  gap: var(--sp-2);
}

.blockInputRow .blockInput {
  flex: 1;
}

.blockInputSmall {
  max-width: 110px;
}

.fileTypeBadge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 0 var(--sp-2);
  border-radius: var(--radius-sm);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: var(--text-xs);
  font-weight: 600;
  flex-shrink: 0;
}

.fileCardPreview {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
}

.fileCardIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.4rem;
  flex-shrink: 0;
}

.fileCardBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.fileCardName {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fileCardMeta {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  font-weight: 500;
}

.fileCardDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.fileCardDownload {
  font-size: 1.3rem;
  color: var(--color-navy-accent);
  flex-shrink: 0;
}

.linkGroup,
.galleryItem,
.accEditor {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-3);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.groupHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.groupLabel {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-5);
}

.groupRemoveBtn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.groupRemoveBtn:hover:not(:disabled) {
  background: var(--color-danger-muted);
  color: var(--color-danger);
}

.groupRemoveBtn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.galleryThumb {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
}

.cmdRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.cmdPrompt {
  font-family: var(--font-mono);
  color: var(--color-success);
  font-weight: 700;
  flex-shrink: 0;
}

.cmdInput {
  flex: 1;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  padding: var(--sp-2) var(--sp-3);
  transition: all var(--duration-fast) var(--ease-out);
}

.cmdInput:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.terminalPreview {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  background: var(--color-navy);
}

.terminalBar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  background: var(--color-surface-3);
  border-bottom: 1px solid var(--color-border-2);
}

.termDot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.termDotRed {
  background: #f87171;
}

.termDotYellow {
  background: #fbbf24;
}

.termDotGreen {
  background: #4ade80;
}

.termTitle {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-5);
}

.terminalBody {
  padding: var(--sp-4);
}

.termLine {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  white-space: pre-wrap;
  word-break: break-word;
}

.termPrompt {
  color: var(--color-success);
  font-weight: 700;
}

.stepEditor {
  display: flex;
  gap: var(--sp-3);
}

.stepNumber {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.stepEditorFields {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.stepRemoveBtn {
  position: absolute;
  top: 0;
  right: 0;
}

.blockTextareaSmall {
  font-size: var(--text-sm);
}

.checkRow {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.checkToggle {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.checkToggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkToggleBox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border-3);
  color: transparent;
  font-size: 0.9rem;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.checkToggle input:checked + .checkToggleBox {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #ffffff;
}

.checkInput {
  flex: 1;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  padding: var(--sp-2) var(--sp-3);
  transition: all var(--duration-fast) var(--ease-out);
}

.checkInput:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.checkInput.done {
  text-decoration: line-through;
  color: var(--color-text-5);
}

.accTitleInput {
  flex: 1;
}

.embedPreviewWrap {
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-navy);
}

.embedPreviewWrap iframe {
  display: block;
  width: 100%;
  border: none;
}

.alternativasEditor {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.alternativaRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.radioCorrect {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.radioCorrect input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radioCorrectBox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-3);
  color: transparent;
  font-size: 0.8rem;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.radioCorrect input:checked + .radioCorrectBox {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #ffffff;
}

.vfRow {
  display: flex;
  gap: var(--sp-2);
}

.progFields {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.modoBtn {
  font-size: var(--text-xs);
}

.previewAltList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin-top: var(--sp-3);
}

.previewAltItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.previewAltItem.correta {
  border-color: var(--color-success);
  background: var(--color-success-muted);
}

.previewAltBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 700;
  flex-shrink: 0;
}

.previewAltItem.correta .previewAltBadge {
  background: var(--color-success);
  color: #ffffff;
}

.previewAltText {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.previewAltCorrect {
  color: var(--color-success);
  flex-shrink: 0;
}

.previewVf {
  margin-top: var(--sp-3);
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.previewVf strong {
  color: var(--color-success);
}

.previewProg {
  margin-top: var(--sp-3);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.previewProgLang {
  display: block;
  padding: var(--sp-1) var(--sp-3);
  background: var(--color-surface-3);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.previewProg pre {
  margin: 0;
  padding: var(--sp-3);
  background: var(--color-navy);
  overflow-x: auto;
}

.previewProg pre code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.previewDiscursiva {
  margin-top: var(--sp-3);
  padding: var(--sp-3);
  border: 1px dashed var(--color-border-3);
  border-radius: var(--radius-md);
  color: var(--color-text-5);
  font-size: var(--text-sm);
  font-style: italic;
}

.listControls {
  display: flex;
  gap: var(--sp-2);
}

.listTypeBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.listTypeBtn.active {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.listItems {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.listItemRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.listMarker {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.listItemInput {
  flex: 1;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  padding: var(--sp-2) var(--sp-3);
  transition: all var(--duration-fast) var(--ease-out);
}

.listItemInput:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.listItemRemove {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.listItemRemove:hover:not(:disabled) {
  background: var(--color-danger-muted);
  color: var(--color-danger);
}

.listItemRemove:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.addListItemBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border: 1px dashed var(--color-border-2);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-5);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.addListItemBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.dividerPreview {
  padding: var(--sp-2) 0;
}

.dividerPreview hr {
  border: none;
  height: 1px;
  background: var(--color-border-2);
}

.questionTypeRow {
  display: flex;
  gap: var(--sp-2);
}

.tipoBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.tipoBtn.active {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.addBlockBetween {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-2) 0;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.blockWrapper:hover + .blockWrapper .addBlockBetween,
.addBlockBetween:hover {
  opacity: 1;
}

.addBtnSmall {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: 1px dashed var(--color-border-2);
  background: var(--color-surface-2);
  color: var(--color-text-5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1;
  transition: all var(--duration-fast) var(--ease-out);
}

.addBtnSmall:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
  transform: scale(1.1);
}

.addLine {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: var(--color-border-1);
  pointer-events: none;
}

.addBlockEnd {
  display: flex;
  justify-content: center;
  padding: var(--sp-6) 0 var(--sp-2);
}

.addBtnBig {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-full);
  border: 2px dashed var(--color-border-2);
  background: transparent;
  color: var(--color-text-4);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-spring);
}

.addBtnBig:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.addBtnBig i {
  font-size: 1.2rem;
}

.formFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-5) 0;
  border-top: 1px solid var(--color-border-1);
  margin-top: var(--sp-4);
}

.formStats {
  display: flex;
  gap: var(--sp-4);
}

.formStats span {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--text-xs);
  color: var(--color-text-5);
  font-weight: 500;
}

.formStats i {
  font-size: 0.85rem;
  color: var(--color-navy-accent);
}

.formFooterActions {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.resetBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: transparent;
  color: var(--color-text-4);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.resetBtn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-muted);
}

.saveBtnBottom {
  padding: var(--sp-3) var(--sp-6);
}

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
  max-width: 640px;
  max-height: min(640px, calc(100vh - 2 * var(--sp-6)));
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

.addMenuGrid {
  padding: var(--sp-3);
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
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

.emptyPreview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  text-align: center;
  padding: var(--sp-16) var(--sp-6);
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
}

.emptyIcon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px dashed var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.emptyIcon i {
  font-size: 1.8rem;
  color: var(--color-text-5);
}

.emptyPreview h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
}

.emptyPreview p {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.previewCard {
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  overflow: hidden;
}

.previewBody {
  padding: var(--sp-8) var(--sp-8);
}

.previewTitle {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-2);
}

.previewDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  margin-bottom: var(--sp-4);
}

.previewMeta {
  display: flex;
  gap: var(--sp-2);
  margin-bottom: var(--sp-6);
}

.previewTag {
  display: inline-flex;
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: var(--text-xs);
  font-weight: 600;
}

.previewBlocks {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.previewBlock {
  font-size: var(--text-base);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
}

.previewPlainText {
  white-space: pre-wrap;
}

.previewCodeBlock {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.previewCodeLang {
  padding: var(--sp-2) var(--sp-4);
  background: var(--color-navy);
  color: var(--color-text-5);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.previewCode {
  margin: 0;
  padding: var(--sp-4);
  background: var(--color-surface);
  overflow-x: auto;
}

.previewCode code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: 1.6;
}

.previewImage {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-1);
}

.previewImageAlt {
  font-size: var(--text-sm);
  color: var(--color-text-5);
  text-align: center;
  margin-top: var(--sp-2);
  font-style: italic;
}

.previewList {
  padding-left: var(--sp-6);
}

.previewList li {
  margin-bottom: var(--sp-2);
}

.previewHr {
  border: none;
  height: 1px;
  background: var(--color-border-2);
  margin: var(--sp-4) 0;
}

.previewQuote {
  margin: 0;
  padding: var(--sp-5) var(--sp-6);
  border-left: 3px solid var(--color-navy-accent);
  background: var(--color-surface-3);
  border-radius: var(--radius-md);
}

.previewQuoteIcon {
  font-size: 1.4rem;
  color: var(--color-navy-accent);
  opacity: 0.5;
  display: block;
  margin-bottom: var(--sp-2);
}

.previewQuote p {
  font-size: var(--text-lg);
  font-style: italic;
  line-height: var(--leading-relaxed);
  color: var(--color-text-2);
  margin: 0;
}

.previewQuoteAuthor {
  margin-top: var(--sp-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-4);
}

.previewTableWrap {
  overflow-x: auto;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
}

.previewTable {
  width: 100%;
  border-collapse: collapse;
}

.previewTable td {
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--color-border-1);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  white-space: pre-wrap;
}

.previewTable th {
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--color-border-1);
  background: var(--color-surface-3);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  text-align: left;
  white-space: pre-wrap;
}

.previewQuestion {
  padding: var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface-3);
  border-left: 3px solid var(--color-navy-accent);
}

.previewQuestionBadge {
  display: inline-flex;
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  margin-bottom: var(--sp-3);
}

.previewQuestionBadge.exercicio {
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
}

.previewQuestionBadge.teorica {
  background: var(--color-surface-4);
  color: var(--color-text-3);
}

.previewVideoTitle {
  margin-top: var(--sp-2);
  font-size: var(--text-sm);
  color: var(--color-text-4);
  text-align: center;
}

.previewExtLinks {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.previewExtLink {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.previewExtLink:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-1px);
}

.previewExtLinkIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.previewExtLinkBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.previewExtLinkTitle {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
}

.previewExtLinkDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.previewExtLinkUrl {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.previewExtLinkOpen {
  font-size: 1.1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
}

.previewGallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--sp-4);
}

.previewGalleryFig {
  margin: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.previewGalleryFig img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}

.previewGalleryFig figcaption {
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--text-xs);
  color: var(--color-text-4);
  font-style: italic;
  background: var(--color-surface-2);
}

.previewSteps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.previewStep {
  display: flex;
  gap: var(--sp-4);
}

.previewStepNum {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.previewStepBody {
  display: flex;
  flex-direction: column;
  padding-top: var(--sp-1);
}

.previewStepTitle {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
}

.previewStepDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
}

.previewChecklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.previewCheckItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.previewCheckItem i {
  color: var(--color-text-5);
  flex-shrink: 0;
}

.previewCheckItem.done {
  opacity: 0.6;
}

.previewCheckItem.done i {
  color: var(--color-success);
}

.previewCheckItem.done span {
  text-decoration: line-through;
}

.previewAcc {
  margin-bottom: var(--sp-3);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-2);
}

.previewAcc summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
  list-style: none;
}

.previewAcc summary::-webkit-details-marker {
  display: none;
}

.previewAccChevron {
  color: var(--color-text-5);
  transition: transform var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.previewAcc[open] .previewAccChevron {
  transform: rotate(180deg);
}

.previewAccBody {
  padding: 0 var(--sp-4) var(--sp-3);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
}

.mdRender :deep(h1) {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(h2) {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(h3) {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(p) {
  margin-bottom: var(--sp-2);
  line-height: var(--leading-relaxed);
}

.mdRender :deep(strong) {
  font-weight: 700;
  color: var(--color-text-1);
}

.mdRender :deep(em) {
  font-style: italic;
}

.mdRender :deep(del) {
  text-decoration: line-through;
  color: var(--color-text-5);
}

.mdRender :deep(.md-code) {
  display: block;
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: var(--sp-3) 0;
}

.mdRender :deep(.md-inline) {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-sm);
  background: var(--color-surface-4);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
}

.mdRender :deep(a) {
  color: var(--color-navy-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 600;
}

.mdRender :deep(a:hover) {
  color: var(--color-navy-accent-hover);
}

.mdRender :deep(ul),
.mdRender :deep(ol) {
  padding-left: var(--sp-6);
  margin: var(--sp-2) 0;
}

.mdRender :deep(li) {
  margin-bottom: var(--sp-1);
}

.error-banner-enter-active {
  transition: all 0.3s var(--ease-spring);
}

.error-banner-leave-active {
  transition: all 0.2s var(--ease-out);
}

.error-banner-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.error-banner-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.field-error-enter-active {
  transition: all 0.25s var(--ease-spring);
}

.field-error-leave-active {
  transition: all 0.15s var(--ease-out);
}

.field-error-enter-from {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}

.field-error-leave-to {
  opacity: 0;
  max-height: 0;
}

.block-enter-active {
  transition: all 0.4s var(--ease-spring);
}

.block-leave-active {
  transition: all 0.25s var(--ease-out);
}

.block-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}

.block-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.block-move {
  transition: transform 0.3s var(--ease-spring);
}

@media (max-width: 768px) {
  .createHeader {
    flex-wrap: wrap;
  }

  .headerActions {
    width: 100%;
    justify-content: flex-end;
  }

  .formMeta {
    grid-template-columns: 1fr;
  }

  .previewBody {
    padding: var(--sp-5);
  }

  .formFooter {
    flex-direction: column;
    gap: var(--sp-4);
    align-items: stretch;
  }

  .formStats {
    justify-content: center;
  }

  .formFooterActions {
    justify-content: stretch;
  }

  .saveBtnBottom {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pageTitle {
    font-size: var(--text-xl);
  }

  .previewTitle {
    font-size: var(--text-2xl);
  }
}
</style>
