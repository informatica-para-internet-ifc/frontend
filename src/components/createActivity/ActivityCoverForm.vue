<script setup>
import { useBlockUpload } from '../../composables/useBlockUpload.js'
import { uploadImage } from '../../api/uploader.js'
import './createActivityShared.css'

const title = defineModel('title', { type: String, default: '' })
const description = defineModel('description', { type: String, default: '' })
const capa = defineModel('capa', { type: String, default: '' })

defineProps({
  showTitleError: { type: Boolean, default: false },
  titleError: { type: String, default: '' },
})

const { isUploading, runUpload } = useBlockUpload()

function onCoverFileSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  runUpload('capa', uploadImage, file, (result) => {
    capa.value = result.url
  })
}

function removeCover() {
  capa.value = ''
}

async function downloadCover() {
  try {
    const resp = await fetch(capa.value)
    if (!resp.ok) throw new Error('network')
    const blob = await resp.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `capa-${title.value || 'atividade'}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(capa.value, '_blank', 'noopener')
  }
}
</script>

<template>
  <div class="formCard animate-fade-in-up delay-1">
    <div class="coverBanner" :class="{ hasCover: capa, uploading: isUploading('capa') }">
      <img v-if="capa" :src="capa" alt="Capa da atividade" class="coverImg" />
      <label class="coverUploadBtn">
        <input type="file" accept="image/*" hidden @change="onCoverFileSelected" :disabled="isUploading('capa')" />
        <i :class="`mdi ${isUploading('capa') ? 'mdi-loading mdi-spin' : (capa ? 'mdi-image-edit-outline' : 'mdi-image-plus-outline')}`"></i>
        {{ isUploading('capa') ? 'Enviando...' : (capa ? 'Trocar capa' : 'Adicionar capa') }}
      </label>
      <button v-if="capa" type="button" class="coverDownloadBtn" title="Baixar capa" @click="downloadCover">
        <i class="mdi mdi-download"></i>
      </button>
      <button v-if="capa" type="button" class="coverRemoveBtn" title="Remover capa" @click="removeCover">
        <i class="mdi mdi-close"></i>
      </button>
    </div>
    <div class="formBody">
      <div class="fieldGroup">
        <input
          v-model="title"
          type="text"
          class="titleInput"
          :class="{ hasError: showTitleError && titleError }"
          placeholder="Título da atividade"
        />
        <Transition name="field-error">
          <span v-if="showTitleError && titleError" class="fieldError">
            <i class="mdi mdi-alert-circle-outline"></i>
            {{ titleError }}
          </span>
        </Transition>
      </div>

      <textarea
        v-model="description"
        class="descInput"
        placeholder="Descrição (opcional) — um resumo curto do que o aluno vai encontrar aqui"
        rows="2"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
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

.coverBanner {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(135deg, var(--color-navy-accent-muted), transparent),
    var(--color-surface-3);
  border-bottom: 1px solid var(--color-border-1);
  overflow: hidden;
}

.coverBanner.hasCover {
  height: 200px;
}

.coverImg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coverBanner.hasCover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.35));
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.coverBanner.hasCover:hover::after {
  opacity: 1;
}

.coverUploadBtn {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-2);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  opacity: 1;
  transition: all var(--duration-fast) var(--ease-out);
}

.coverBanner.hasCover .coverUploadBtn {
  opacity: 0;
}

.coverBanner.hasCover:hover .coverUploadBtn {
  opacity: 1;
}

.coverUploadBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.coverDownloadBtn,
.coverRemoveBtn {
  position: absolute;
  top: var(--sp-3);
  z-index: 1;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.coverDownloadBtn {
  right: calc(var(--sp-3) + 28px + var(--sp-2));
}

.coverRemoveBtn {
  right: var(--sp-3);
}

.coverBanner.hasCover:hover .coverDownloadBtn,
.coverBanner.hasCover:hover .coverRemoveBtn {
  opacity: 1;
}

.coverDownloadBtn:hover {
  background: var(--color-navy-accent);
}

.coverRemoveBtn:hover {
  background: var(--color-danger);
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
  resize: vertical;
  line-height: var(--leading-normal);
}

.descInput::placeholder {
  color: var(--color-text-5);
}

.fieldGroup {
  margin-bottom: var(--sp-3);
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
</style>
