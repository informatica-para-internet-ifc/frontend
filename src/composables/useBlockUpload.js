import { ref } from 'vue'
import { useToast } from './useToast.js'

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
      const result = await uploadFn(file)
      onSuccess(result)
    } catch (err) {
      toast.error(err.message || 'Falha ao enviar o arquivo.')
    } finally {
      uploading.value = { ...uploading.value, [key]: false }
    }
  }

  return { uploading, isUploading, runUpload }
}
