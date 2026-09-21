<script setup>
import { computed, ref } from 'vue'
import { categoriaOptions, dificuldadeOptions, statusOptions, getBlockIcon, getBlockLabel } from '../../utils/activityBlocks.js'
import './createActivityShared.css'

const categoria = defineModel('categoria', { type: String, default: 'atividade' })
const selectedAno = defineModel('selectedAno', { type: String, default: '' })
const selectedDisc = defineModel('selectedDisc', { type: String, default: '' })
const dificuldade = defineModel('dificuldade', { type: String, default: '' })
const tempoEstimado = defineModel('tempoEstimado', { type: String, default: '' })
const tags = defineModel('tags', { type: Array, default: () => [] })
const preRequisitos = defineModel('preRequisitos', { type: String, default: '' })
const status = defineModel('status', { type: String, default: 'rascunho' })
const prazoRecomendado = defineModel('prazoRecomendado', { type: String, default: '' })
const fixada = defineModel('fixada', { type: Boolean, default: false })

const props = defineProps({
  anosList: { type: Array, required: true },
  blocks: { type: Array, required: true },
  showErrors: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['scroll-to-block'])

const tagInput = ref('')

const disciplinasDoAno = computed(() => {
  if (!selectedAno.value) return []
  const ano = props.anosList.find((a) => a.id === selectedAno.value)
  return ano ? ano.disciplinas : []
})

function addTag() {
  const value = tagInput.value.trim().replace(/,$/, '')
  if (value && !tags.value.includes(value)) {
    tags.value = [...tags.value, value]
  }
  tagInput.value = ''
}

function removeTag(idx) {
  tags.value = tags.value.filter((_, i) => i !== idx)
}

function onTagKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

function toggleDificuldade(value) {
  dificuldade.value = dificuldade.value === value ? '' : value
}
</script>

<template>
  <aside class="sidebarPanel animate-fade-in-up delay-2">
    <div class="sidebarCard">
      <h3 class="sidebarCardTitle">
        <i class="mdi mdi-book-education-outline"></i>
        Organização
      </h3>
      <div class="metaField">
        <label class="metaLabel">Categoria</label>
        <div class="segmentedGroup">
          <button
            v-for="opt in categoriaOptions"
            :key="opt.value"
            type="button"
            class="segmentedBtn"
            :class="{ active: categoria === opt.value }"
            @click="categoria = opt.value"
          >
            <i :class="`mdi ${opt.icon}`"></i>
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="metaField">
        <label class="metaLabel">Ano</label>
        <select
          v-model="selectedAno"
          class="metaSelect"
          :class="{ hasError: showErrors && errors.ano }"
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
        <label class="metaLabel">Disciplina</label>
        <select
          v-model="selectedDisc"
          class="metaSelect"
          :class="{ hasError: showErrors && errors.disc }"
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

    <div class="sidebarCard">
      <h3 class="sidebarCardTitle">
        <i class="mdi mdi-tune-variant"></i>
        Detalhes
      </h3>
      <div class="metaField">
        <label class="metaLabel">Dificuldade</label>
        <div class="segmentedGroup">
          <button
            v-for="opt in dificuldadeOptions"
            :key="opt.value"
            type="button"
            class="segmentedBtn"
            :class="{ active: dificuldade === opt.value }"
            @click="toggleDificuldade(opt.value)"
          >
            <i :class="`mdi ${opt.icon}`"></i>
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="metaField">
        <label class="metaLabel">Tempo estimado</label>
        <input
          v-model="tempoEstimado"
          class="metaInput"
          placeholder="ex: 45 min"
        />
      </div>
      <div class="metaField">
        <label class="metaLabel">Tags</label>
        <div class="tagInputRow">
          <input
            v-model="tagInput"
            class="metaInput"
            placeholder="Digite e pressione Enter"
            @keydown="onTagKeydown"
          />
        </div>
        <div v-if="tags.length" class="tagList">
          <span v-for="(tag, i) in tags" :key="tag" class="tagChip">
            {{ tag }}
            <button type="button" @click="removeTag(i)"><i class="mdi mdi-close"></i></button>
          </span>
        </div>
      </div>
      <div class="metaField">
        <label class="metaLabel">Pré-requisitos</label>
        <textarea
          v-model="preRequisitos"
          class="metaTextarea"
          placeholder="O que o aluno precisa saber antes (opcional)"
          rows="2"
        ></textarea>
      </div>
    </div>

    <div class="sidebarCard">
      <h3 class="sidebarCardTitle">
        <i class="mdi mdi-send-outline"></i>
        Publicação
      </h3>
      <div class="metaField">
        <label class="metaLabel">Status</label>
        <div class="segmentedGroup segmentedGroupCol">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            type="button"
            class="segmentedBtn"
            :class="{ active: status === opt.value }"
            @click="status = opt.value"
          >
            <i :class="`mdi ${opt.icon}`"></i>
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="metaField">
        <label class="metaLabel">Prazo recomendado</label>
        <input v-model="prazoRecomendado" type="date" class="metaInput" />
      </div>
      <label class="fixToggle" :class="{ disabled: status !== 'publicada' }">
        <input type="checkbox" v-model="fixada" :disabled="status !== 'publicada'" />
        <span class="fixToggleBox"><i class="mdi mdi-check"></i></span>
        <span>
          Fixar atividade
          <small v-if="status !== 'publicada'">Disponível apenas para atividades publicadas</small>
        </span>
      </label>
    </div>

    <div v-if="blocks.length" class="sidebarCard">
      <h3 class="sidebarCardTitle">
        <i class="mdi mdi-format-list-bulleted-square"></i>
        Sumário
      </h3>
      <div class="outlineList">
        <button
          v-for="(block, idx) in blocks"
          :key="block.id"
          type="button"
          class="outlineItem"
          @click="emit('scroll-to-block', block.id)"
        >
          <i :class="`mdi ${getBlockIcon(block.type)}`"></i>
          <span class="outlineLabel">{{ getBlockLabel(block.type) }}</span>
          <span class="outlineNumber">{{ idx + 1 }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
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

.metaInput,
.metaTextarea {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  transition: all var(--duration-fast) var(--ease-out);
  width: 100%;
}

.metaTextarea {
  resize: vertical;
  line-height: var(--leading-normal);
}

.metaInput:focus,
.metaTextarea:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.metaInput::placeholder,
.metaTextarea::placeholder {
  color: var(--color-text-5);
}

.segmentedGroup {
  display: flex;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.segmentedGroupCol {
  flex-direction: column;
}

.segmentedBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  flex: 1;
  min-width: 0;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-3);
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.segmentedGroupCol .segmentedBtn {
  justify-content: flex-start;
}

.segmentedBtn i {
  font-size: 1rem;
}

.segmentedBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.segmentedBtn.active {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.tagInputRow {
  display: flex;
  gap: var(--sp-2);
}

.fixToggle {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-text-2);
  font-weight: 600;
}

.fixToggle.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fixToggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.fixToggleBox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: transparent;
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.fixToggleBox i {
  font-size: 0.85rem;
}

.fixToggle input:checked + .fixToggleBox {
  background: var(--color-navy-accent);
  border-color: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.fixToggle small {
  display: block;
  font-weight: 400;
  color: var(--color-text-5);
  font-size: var(--text-xs);
  margin-top: 2px;
}

.sidebarPanel {
  position: sticky;
  top: calc(var(--header-h, 64px) + var(--sp-4));
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
  max-height: calc(100vh - var(--header-h, 64px) - var(--sp-8));
  overflow-y: auto;
  overscroll-behavior: contain;
}

.sidebarCard {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-5);
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  flex-shrink: 0;
}

.sidebarCardTitle {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
}

.sidebarCardTitle i {
  color: var(--color-navy-accent);
  font-size: 1.1rem;
}

.outlineList {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
}

.outlineItem {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-2);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-3);
  font-size: var(--text-xs);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.outlineItem:hover {
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
}

.outlineItem i {
  font-size: 0.95rem;
  flex-shrink: 0;
  color: var(--color-text-5);
}

.outlineItem:hover i {
  color: var(--color-navy-accent);
}

.outlineLabel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.outlineNumber {
  font-size: 0.65rem;
  color: var(--color-text-5);
  flex-shrink: 0;
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

@media (max-width: 1080px) {
  .sidebarPanel {
    position: static;
    max-height: none;
  }

  .sidebarPanel:not(:has(.sidebarCard)) {
    display: none;
  }
}
</style>
