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

function drawAtSize(img, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  return canvas
}

/**
 * Redimensiona e recomprime uma imagem no navegador antes do upload, para
 * caber no limite de tamanho de requisição do servidor. Tenta primeiro
 * preservar o formato original (PNG mantém transparência); se ainda assim
 * o resultado ficar grande demais, reduz a resolução progressivamente e,
 * como último recurso, converte para JPEG (perde transparência, mas evita
 * bloquear o envio). GIFs (podem ser animados) e arquivos que não são
 * imagem passam direto, sem alteração.
 */
export async function compressImage(file, { targetBytes = 900 * 1024, minDimension = 800 } = {}) {
  if (!file?.type?.startsWith('image/') || file.type === 'image/gif') return file

  let img
  try {
    img = await loadImageBitmap(file)
  } catch {
    return file
  }

  const isPng = file.type === 'image/png'
  const { naturalWidth, naturalHeight } = img
  const longSide = Math.max(naturalWidth, naturalHeight)

  const candidateSteps = [1920, 1600, 1280, 1024, minDimension].filter((d) => d <= longSide)
  const dimensionSteps = candidateSteps.length ? candidateSteps : [longSide]
  const qualitySteps = [0.85, 0.7, 0.55, 0.4]

  let best = null

  for (const maxDimension of dimensionSteps) {
    const scale = Math.min(1, maxDimension / longSide)
    const width = Math.round(naturalWidth * scale)
    const height = Math.round(naturalHeight * scale)
    const canvas = drawAtSize(img, width, height)

    if (isPng) {
      try {
        const blob = await canvasToBlob(canvas, 'image/png')
        if (!best || blob.size < best.blob.size) best = { blob, mimeType: 'image/png', ext: 'png' }
        if (blob.size <= targetBytes) break
      } catch {
        // segue para tentar JPEG como alternativa
      }
    }

    for (const quality of qualitySteps) {
      try {
        const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
        if (!best || blob.size < best.blob.size) best = { blob, mimeType: 'image/jpeg', ext: 'jpg' }
        if (blob.size <= targetBytes) break
      } catch {
        // tenta o próximo passo
      }
    }
    if (best && best.blob.size <= targetBytes) break
  }

  URL.revokeObjectURL(img.src)

  if (!best || best.blob.size >= file.size) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.' + best.ext
  return new File([best.blob], name, { type: best.mimeType })
}
