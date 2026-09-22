import { ref } from 'vue'
import { useToast } from './useToast.js'
import { compressImage } from '../utils/compressImage.js'

const MAX_UPLOAD_BYTES = 950 * 1024

export function useBlockUpload() {
  const toast = useToast()
  const uploading = ref({})

  function isUploading(key) {
    return !!uploading.value[key]
  }

  async function runUpload(key, uploadFn, file, onSuccess) {
    if (!file) return
    uploading.value = { ...uploading.value, [key]: true }
    try {
      const isImage = file.type?.startsWith('image/')
      const toSend = isImage ? await compressImage(file) : file
      if (isImage && toSend.size > MAX_UPLOAD_BYTES) {
        toast.error('Essa imagem é muito grande, mesmo depois de compactada. Tente uma imagem menor.')
        return
      }
      const result = await uploadFn(toSend)
      onSuccess(result)
    } catch (err) {
      toast.error(err.message || 'Falha ao enviar o arquivo.')
    } finally {
      uploading.value = { ...uploading.value, [key]: false }
    }
  }

  return { uploading, isUploading, runUpload }
}
