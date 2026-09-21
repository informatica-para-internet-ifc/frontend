<script setup>
import { useBlockUpload } from '../../../composables/useBlockUpload.js'
import { uploadVideo } from '../../../api/uploader.js'
import { getVideoEmbed, isDirectVideoUrl } from '../../../utils/activityBlocks.js'
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

const { isUploading, runUpload } = useBlockUpload()

function onFileSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  runUpload('main', uploadVideo, file, (result) => {
    block.value.url = result.url
  })
}
</script>

<template>
  <label class="uploadDropzone" :class="{ uploading: isUploading('main') }">
    <input type="file" accept="video/*" hidden @change="onFileSelected" :disabled="isUploading('main')" />
    <i :class="`mdi ${isUploading('main') ? 'mdi-loading mdi-spin' : 'mdi-cloud-upload-outline'}`"></i>
    <span>{{ isUploading('main') ? 'Enviando...' : (block.url ? 'Trocar vídeo' : 'Clique para enviar um vídeo') }}</span>
  </label>
  <input
    v-model="block.url"
    class="blockInput blockInputSecondary"
    placeholder="ou cole o link do YouTube/Vimeo"
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
    <div v-else-if="isDirectVideoUrl(block.url)" class="videoPreview">
      <video :src="block.url" controls preload="metadata"></video>
    </div>
    <p v-else class="videoInvalid">
      <i class="mdi mdi-alert-circle-outline"></i>
      URL de vídeo não reconhecida. Use links do YouTube, Vimeo ou envie um arquivo.
    </p>
  </div>
</template>
