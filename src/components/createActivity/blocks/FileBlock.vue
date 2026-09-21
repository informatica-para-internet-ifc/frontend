<script setup>
import { useBlockUpload } from '../../../composables/useBlockUpload.js'
import { uploadDocument } from '../../../api/uploader.js'
import { getFileType, getFileIcon, formatFileSize } from '../../../utils/activityBlocks.js'
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

const { isUploading, runUpload } = useBlockUpload()

function onFileSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  runUpload('main', uploadDocument, file, (result) => {
    block.value.url = result.url
    if (!block.value.label) block.value.label = file.name.replace(/\.[^.]+$/, '')
    if (file.size) block.value.size = formatFileSize(file.size)
  })
}
</script>

<template>
  <label class="uploadDropzone" :class="{ uploading: isUploading('main') }">
    <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt" hidden @change="onFileSelected" :disabled="isUploading('main')" />
    <i :class="`mdi ${isUploading('main') ? 'mdi-loading mdi-spin' : 'mdi-cloud-upload-outline'}`"></i>
    <span>{{ isUploading('main') ? 'Enviando...' : (block.url ? 'Trocar arquivo' : 'Clique para enviar um arquivo (PDF, DOCX, ZIP...)') }}</span>
  </label>
  <input
    v-model="block.label"
    class="blockInput"
    placeholder="Nome do arquivo (ex: Lista 03 — Banco de Dados)"
  />
  <input
    v-model="block.url"
    class="blockInput blockInputSecondary"
    placeholder="ou cole a URL do arquivo (https://...)"
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
    <a :href="block.url" target="_blank" rel="noopener" class="fileCardPreview" title="Abrir/baixar arquivo">
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
    </a>
  </div>
</template>
