<script setup>
import { computed, nextTick, ref } from 'vue'
import { getBlockIcon, getBlockLabel, getBlockSummary, blockDefaults } from '../../utils/activityBlocks.js'
import AddBlockMenu from './AddBlockMenu.vue'
import TextBlock from './blocks/TextBlock.vue'
import MarkdownBlock from './blocks/MarkdownBlock.vue'
import HeadingBlock from './blocks/HeadingBlock.vue'
import CodeBlock from './blocks/CodeBlock.vue'
import TerminalBlock from './blocks/TerminalBlock.vue'
import ImageBlock from './blocks/ImageBlock.vue'
import GalleryBlock from './blocks/GalleryBlock.vue'
import VideoBlock from './blocks/VideoBlock.vue'
import FileBlock from './blocks/FileBlock.vue'
import EmbedBlock from './blocks/EmbedBlock.vue'
import ListBlock from './blocks/ListBlock.vue'
import StepsBlock from './blocks/StepsBlock.vue'
import ChecklistBlock from './blocks/ChecklistBlock.vue'
import TableBlock from './blocks/TableBlock.vue'
import QuoteBlock from './blocks/QuoteBlock.vue'
import AlertBlock from './blocks/AlertBlock.vue'
import LinkBlock from './blocks/LinkBlock.vue'
import LinksBlock from './blocks/LinksBlock.vue'
import AccordionBlock from './blocks/AccordionBlock.vue'
import DividerBlock from './blocks/DividerBlock.vue'
import QuestionBlock from './blocks/QuestionBlock.vue'
import './createActivityShared.css'

const blockComponents = {
  text: TextBlock,
  markdown: MarkdownBlock,
  heading: HeadingBlock,
  code: CodeBlock,
  terminal: TerminalBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  video: VideoBlock,
  file: FileBlock,
  embed: EmbedBlock,
  list: ListBlock,
  steps: StepsBlock,
  checklist: ChecklistBlock,
  table: TableBlock,
  quote: QuoteBlock,
  alert: AlertBlock,
  link: LinkBlock,
  links: LinksBlock,
  accordion: AccordionBlock,
  divider: DividerBlock,
  question: QuestionBlock,
}

const props = defineProps({
  nextId: { type: Function, required: true },
  collapsedBlocks: { type: Set, required: true },
  showErrors: { type: Boolean, default: false },
  blocksError: { type: String, default: '' },
  isSaving: { type: Boolean, default: false },
})

const blocks = defineModel('blocks', { type: Array, required: true })

const emit = defineEmits(['toggle-block-collapse', 'save', 'reset'])

const showAddMenu = ref(false)
const addMenuIdx = ref(null)
const draggingIdx = ref(null)
const dragOverIdx = ref(null)

const blockCount = computed(() => blocks.value.length)
const questionCount = computed(() => blocks.value.filter((b) => b.type === 'question').length)
const textLength = computed(() => {
  return blocks.value.reduce((sum, b) => {
    if (b.content) return sum + b.content.length
    if (b.enunciado) return sum + b.enunciado.length
    return sum
  }, 0)
})

function isCollapsed(id) {
  return props.collapsedBlocks.has(id)
}

function toggleCollapse(id) {
  emit('toggle-block-collapse', id)
}

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

function removeBlock(idx) {
  blocks.value.splice(idx, 1)
}

function duplicateBlock(idx) {
  const original = blocks.value[idx]
  const clone = { ...JSON.parse(JSON.stringify(original)), id: props.nextId() }
  blocks.value.splice(idx + 1, 0, clone)
}

function moveBlock(idx, dir) {
  const newIdx = idx + dir
  if (newIdx < 0 || newIdx >= blocks.value.length) return
  const item = blocks.value.splice(idx, 1)[0]
  blocks.value.splice(newIdx, 0, item)
}

function openAddMenu(idx) {
  addMenuIdx.value = idx
  showAddMenu.value = true
}

function closeAddMenu() {
  showAddMenu.value = false
  addMenuIdx.value = null
}

async function addBlock(type) {
  const block = {
    id: props.nextId(),
    type,
    ...JSON.parse(JSON.stringify(blockDefaults[type])),
  }

  const afterIdx = addMenuIdx.value
  if (afterIdx !== undefined && afterIdx !== null) {
    blocks.value.splice(afterIdx + 1, 0, block)
  } else {
    blocks.value.push(block)
  }

  closeAddMenu()

  await nextTick()
  document.getElementById(`block-anchor-${block.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="blocksSection editorPane animate-fade-in-up delay-2">
    <div v-if="showErrors && blocksError" class="blocksError animate-fade-in-up">
      <i class="mdi mdi-alert-circle-outline"></i>
      {{ blocksError }}
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
          :id="`block-anchor-${block.id}`"
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

          <div class="blockCard" :class="[`block-${block.type}`, { isCollapsed: isCollapsed(block.id) }]">
            <div class="blockCardHeader">
              <button class="collapseToggle" title="Recolher/expandir" @click="toggleCollapse(block.id)">
                <i class="mdi" :class="isCollapsed(block.id) ? 'mdi-chevron-right' : 'mdi-chevron-down'"></i>
              </button>
              <div class="blockTypeBadge">
                <i :class="`mdi ${getBlockIcon(block.type)}`"></i>
                {{ getBlockLabel(block.type) }}
              </div>
              <span v-if="isCollapsed(block.id)" class="blockSummary">{{ getBlockSummary(block) }}</span>
              <span class="blockNumber">
                #{{ idx + 1 }}
              </span>
            </div>

            <component
              v-if="!isCollapsed(block.id) && blockComponents[block.type]"
              :is="blockComponents[block.type]"
              :block="block"
            />
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
          <button class="resetBtn" @click="emit('reset')">
            <i class="mdi mdi-refresh"></i>
            Limpar tudo
          </button>
          <button class="saveBtn saveBtnBottom" @click="emit('save')" :disabled="isSaving">
            <i :class="isSaving ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-save-outline'"></i>
            {{ isSaving ? 'Salvando...' : 'Salvar Atividade' }}
          </button>
        </div>
      </div>
    </template>

    <AddBlockMenu :show="showAddMenu" @close="closeAddMenu" @select="addBlock" />
  </div>
</template>

<style scoped>
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

.blockCard.isCollapsed {
  padding: var(--sp-3) var(--sp-6);
  gap: 0;
}

.blockCardHeader {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.collapseToggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-4);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.collapseToggle:hover {
  background: var(--color-surface-3);
  color: var(--color-text-1);
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
  flex-shrink: 0;
}

.blockTypeBadge i {
  font-size: 0.85rem;
}

.blockSummary {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.blockNumber {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  font-weight: 600;
  margin-left: auto;
  flex-shrink: 0;
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
</style>
