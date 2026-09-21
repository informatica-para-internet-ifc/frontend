<script setup>
import { useBlockUpload } from '../../../composables/useBlockUpload.js'
import { uploadImage } from '../../../api/uploader.js'
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

const { isUploading, runUpload } = useBlockUpload()

function onFileSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  runUpload('main', uploadImage, file, (result) => {
    block.value.url = result.url
  })
}
</script>

<template>
  <label class="uploadDropzone" :class="{ uploading: isUploading('main') }">
    <input type="file" accept="image/*" hidden @change="onFileSelected" :disabled="isUploading('main')" />
    <i :class="`mdi ${isUploading('main') ? 'mdi-loading mdi-spin' : 'mdi-cloud-upload-outline'}`"></i>
    <span>{{ isUploading('main') ? 'Enviando...' : (block.url ? 'Trocar imagem' : 'Clique para enviar uma imagem') }}</span>
  </label>
  <input
    v-model="block.url"
    class="blockInput blockInputSecondary"
    placeholder="ou cole a URL da imagem (https://...)"
  />
  <input
    v-model="block.alt"
    class="blockInput blockInputSecondary"
    placeholder="Texto alternativo (opcional)"
  />
  <div v-if="block.url" class="imagePreview">
    <img :src="block.url" :alt="block.alt || 'Preview'" @error="$event.target.style.display = 'none'" />
  </div>
</template>

<style scoped>
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
</style>
