function loadImageBitmap(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('canvas-empty'))), mimeType, quality)
  })
}

/**
 * Redimensiona e recomprime uma imagem no navegador antes do upload, para
 * caber no limite de tamanho de requisição do servidor. GIFs (podem ser
 * animados) e arquivos que não são imagem passam direto, sem alteração.
 */
export async function compressImage(file, { maxDimension = 1920, minQuality = 0.5 } = {}) {
  if (!file?.type?.startsWith('image/') || file.type === 'image/gif') return file

  let img
  try {
    img = await loadImageBitmap(file)
  } catch {
    return file
  }

  let { naturalWidth: width, naturalHeight: height } = img
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  URL.revokeObjectURL(img.src)

  const isPng = file.type === 'image/png'
  const mimeType = isPng ? 'image/png' : 'image/jpeg'

  try {
    let blob = await canvasToBlob(canvas, mimeType, isPng ? undefined : 0.85)
    if (!isPng) {
      let quality = 0.85
      while (blob.size > 900 * 1024 && quality > minQuality) {
        quality -= 0.1
        blob = await canvasToBlob(canvas, mimeType, quality)
      }
    }

    if (blob.size >= file.size) return file

    const ext = isPng ? 'png' : 'jpg'
    const name = file.name.replace(/\.[^.]+$/, '') + '.' + ext
    return new File([blob], name, { type: mimeType })
  } catch {
    return file
  }
}
