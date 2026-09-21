<script setup>
import { useBlockUpload } from '../../../composables/useBlockUpload.js'
import { uploadImage } from '../../../api/uploader.js'
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

const { isUploading, runUpload } = useBlockUpload()

function addGalleryImage() {
  block.value.images.push({ url: '', caption: '' })
}

function removeGalleryImage(idx) {
  if (block.value.images.length > 1) block.value.images.splice(idx, 1)
}

function onFileSelected(img, idx, event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  runUpload(idx, uploadImage, file, (result) => {
    img.url = result.url
  })
}
</script>

<template>
  <input
    v-model="block.caption"
    class="blockInput"
    placeholder="Legenda do conjunto (opcional)"
  />
  <div v-for="(img, i) in block.images" :key="i" class="galleryItem">
    <div class="groupHead">
      <span class="groupLabel">Imagem {{ i + 1 }}</span>
      <button class="groupRemoveBtn" @click="removeGalleryImage(i)" :disabled="block.images.length <= 1">
        <i class="mdi mdi-close"></i>
      </button>
    </div>
    <div class="blockInputRow">
      <input
        v-model="img.url"
        class="blockInput"
        :placeholder="`URL da imagem ${i + 1} (https://...)`"
      />
      <label class="uploadBtn" :class="{ uploading: isUploading(i) }">
        <input type="file" accept="image/*" hidden @change="onFileSelected(img, i, $event)" :disabled="isUploading(i)" />
        <i :class="`mdi ${isUploading(i) ? 'mdi-loading mdi-spin' : 'mdi-upload'}`"></i>
        Enviar
      </label>
    </div>
    <input
      v-model="img.caption"
      class="blockInput blockInputSecondary"
      :placeholder="`Legenda da imagem ${i + 1} (opcional)`"
    />
    <img v-if="img.url" :src="img.url" :alt="img.caption || ''" class="galleryThumb" />
  </div>
  <button type="button" class="addListItemBtn" @click="addGalleryImage()">
    <i class="mdi mdi-plus"></i>
    Adicionar imagem
  </button>
</template>

<style scoped>
.galleryThumb {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
}
</style>
