export const dificuldadeOptions = [
  { value: 'facil', label: 'Fácil', icon: 'mdi-emoticon-happy-outline' },
  { value: 'medio', label: 'Médio', icon: 'mdi-emoticon-neutral-outline' },
  { value: 'dificil', label: 'Difícil', icon: 'mdi-emoticon-devil-outline' },
]

export const categoriaOptions = [
  { value: 'questao', label: 'Questão', icon: 'mdi-help-circle-outline' },
  { value: 'atividade', label: 'Atividade', icon: 'mdi-file-document-outline' },
  { value: 'tutorial', label: 'Tutorial', icon: 'mdi-school-outline' },
]

export const statusOptions = [
  { value: 'rascunho', label: 'Rascunho', icon: 'mdi-file-edit-outline' },
  { value: 'publicada', label: 'Publicada', icon: 'mdi-check-circle-outline' },
  { value: 'arquivada', label: 'Arquivada', icon: 'mdi-archive-outline' },
]

export const blockCategories = [
  { id: 'texto', label: 'Texto', icon: 'mdi-format-text' },
  { id: 'codigo', label: 'Código', icon: 'mdi-code-braces' },
  { id: 'midia', label: 'Mídia', icon: 'mdi-multimedia' },
  { id: 'estrutura', label: 'Estrutura', icon: 'mdi-view-grid-outline' },
  { id: 'interativo', label: 'Interativo', icon: 'mdi-cursor-default-click-outline' },
]

export const blockTypes = [
  { type: 'text', label: 'Texto', icon: 'mdi-text', desc: 'Parágrafos simples de texto', category: 'texto' },
  { type: 'heading', label: 'Título', icon: 'mdi-format-header-1', desc: 'Título de seção', category: 'texto' },
  { type: 'markdown', label: 'Markdown', icon: 'mdi-language-markdown', desc: 'Texto com formatação rich', category: 'texto' },
  { type: 'quote', label: 'Citação', icon: 'mdi-format-quote-open', desc: 'Citação em destaque com autor', category: 'texto' },
  { type: 'code', label: 'Código', icon: 'mdi-code-tags', desc: 'Bloco de código com syntax highlight', category: 'codigo' },
  { type: 'terminal', label: 'Terminal', icon: 'mdi-console-line', desc: 'Comandos de terminal', category: 'codigo' },
  { type: 'image', label: 'Imagem', icon: 'mdi-image-outline', desc: 'Envie uma imagem ou cole uma URL', category: 'midia' },
  { type: 'gallery', label: 'Galeria', icon: 'mdi-image-multiple-outline', desc: 'Várias imagens com legenda', category: 'midia' },
  { type: 'video', label: 'Vídeo', icon: 'mdi-video-outline', desc: 'Envie um arquivo ou incorpore YouTube/Vimeo', category: 'midia' },
  { type: 'file', label: 'Download', icon: 'mdi-file-download-outline', desc: 'Arquivo para baixar (PDF, ZIP...)', category: 'midia' },
  { type: 'embed', label: 'Embed', icon: 'mdi-web', desc: 'Iframe incorporado (CodePen, JSFiddle...)', category: 'midia' },
  { type: 'list', label: 'Lista', icon: 'mdi-format-list-bulleted', desc: 'Lista com marcadores ou numerada', category: 'estrutura' },
  { type: 'steps', label: 'Passo a Passo', icon: 'mdi-format-list-numbered', desc: 'Procedimento numerado: 01 → 02 → 03', category: 'estrutura' },
  { type: 'checklist', label: 'Checklista', icon: 'mdi-format-list-checks', desc: 'Lista de requisitos com checkbox', category: 'estrutura' },
  { type: 'table', label: 'Tabela', icon: 'mdi-table', desc: 'Tabela editável com linhas e colunas', category: 'estrutura' },
  { type: 'accordion', label: 'Acordeão', icon: 'mdi-view-list', desc: 'Itens colapsáveis (perguntas e respostas)', category: 'estrutura' },
  { type: 'divider', label: 'Divisor', icon: 'mdi-minus', desc: 'Linha separadora', category: 'estrutura' },
  { type: 'alert', label: 'Aviso', icon: 'mdi-alert-decagram-outline', desc: 'Caixa colorida (informação, dica, atenção...)', category: 'interativo' },
  { type: 'link', label: 'Link', icon: 'mdi-link-variant', desc: 'Link único com rótulo e descrição', category: 'interativo' },
  { type: 'links', label: 'Links Externos', icon: 'mdi-link-box-outline', desc: 'Várias referências externas', category: 'interativo' },
  { type: 'question', label: 'Questão', icon: 'mdi-frequently-asked-questions', desc: 'Exercício (discursiva, múltipla escolha...)', category: 'interativo' },
]

export const alertTypes = [
  { type: 'info', label: 'Informação', icon: 'mdi-information-outline' },
  { type: 'success', label: 'Dica', icon: 'mdi-lightbulb-on-outline' },
  { type: 'warning', label: 'Atenção', icon: 'mdi-alert-outline' },
  { type: 'danger', label: 'Importante', icon: 'mdi-exclamation-thick' },
  { type: 'erro', label: 'Erro comum', icon: 'mdi-alert-octagon-outline' },
]

export const questionModos = [
  { value: 'discursiva', label: 'Discursiva', icon: 'mdi-text-box-outline' },
  { value: 'multipla_escolha', label: 'Múltipla Escolha', icon: 'mdi-checkbox-multiple-blank-outline' },
  { value: 'verdadeiro_falso', label: 'Verdadeiro/Falso', icon: 'mdi-toggle-switch-outline' },
  { value: 'programacao', label: 'Programação', icon: 'mdi-code-tags' },
]

export const blockDefaults = {
  text: { content: '' },
  markdown: { content: '' },
  heading: { content: '', level: 2 },
  code: { content: '', language: 'javascript' },
  terminal: { commands: [''] },
  image: { url: '', alt: '' },
  gallery: { images: [{ url: '', caption: '' }], caption: '' },
  video: { url: '', title: '' },
  embed: { url: '', title: '', height: '400' },
  list: { items: [''], ordered: false },
  steps: { steps: [{ title: '', desc: '' }] },
  checklist: { items: [{ text: '', done: false }] },
  table: { rows: [['', ''], ['', '']], hasHeader: false },
  quote: { content: '', author: '' },
  alert: { content: '', tipo: 'info' },
  link: { url: '', label: '', desc: '' },
  links: { links: [{ title: '', url: '', desc: '' }] },
  file: { label: '', url: '', size: '', desc: '' },
  accordion: { items: [{ title: '', content: '' }] },
  divider: {},
  question: { enunciado: '', tipo: 'exercicio', modo: 'discursiva', alternativas: [{ texto: '' }, { texto: '' }], correta: 0, respostaVf: true, linguagem: 'javascript', codigoEsperado: '' },
}

export function getBlockIcon(type) {
  const map = {
    text: 'mdi-text',
    markdown: 'mdi-language-markdown',
    heading: 'mdi-format-header-1',
    code: 'mdi-code-tags',
    terminal: 'mdi-console-line',
    image: 'mdi-image-outline',
    gallery: 'mdi-image-multiple-outline',
    video: 'mdi-video-outline',
    embed: 'mdi-web',
    list: 'mdi-format-list-bulleted',
    steps: 'mdi-format-list-numbered',
    checklist: 'mdi-format-list-checks',
    table: 'mdi-table',
    quote: 'mdi-format-quote-open',
    alert: 'mdi-alert-decagram-outline',
    link: 'mdi-link-variant',
    links: 'mdi-link-box-outline',
    file: 'mdi-file-download-outline',
    accordion: 'mdi-view-list',
    divider: 'mdi-minus',
    question: 'mdi-frequently-asked-questions',
  }
  return map[type] || 'mdi-help-circle-outline'
}

export function getBlockLabel(type) {
  return blockTypes.find((b) => b.type === type)?.label || type
}

export function getQuestionModoLabel(modo) {
  return questionModos.find((m) => m.value === modo)?.label || 'Discursiva'
}

export function getFileType(url) {
  if (!url) return ''
  const m = url.match(/\.([a-z0-9]{2,5})(?:$|\?)/i)
  return m ? m[1].toLowerCase() : ''
}

export function getFileIcon(type) {
  const map = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word-box',
    docx: 'mdi-file-word-box',
    xls: 'mdi-file-excel-box',
    xlsx: 'mdi-file-excel-box',
    ppt: 'mdi-file-powerpoint-box',
    pptx: 'mdi-file-powerpoint-box',
    zip: 'mdi-folder-zip-outline',
    rar: 'mdi-folder-zip-outline',
    md: 'mdi-language-markdown-outline',
  }
  return map[type] || 'mdi-file-outline'
}

export function getAlertIcon(tipo) {
  const map = {
    info: 'mdi-information-outline',
    success: 'mdi-lightbulb-on-outline',
    warning: 'mdi-alert-outline',
    danger: 'mdi-exclamation-thick',
    erro: 'mdi-alert-octagon-outline',
  }
  return map[tipo] || 'mdi-information-outline'
}

export function getVideoEmbed(url) {
  if (!url) return null
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`
  m = url.match(/vimeo\.com\/(\d+)/)
  if (m) return `https://player.vimeo.com/video/${m[1]}`
  return null
}

export function isDirectVideoUrl(url) {
  if (!url) return false
  return /\.(mp4|webm|mov|ogg|mkv)(?:$|\?)/i.test(url)
}

export function formatFileSize(bytes) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIdx = 0
  while (value >= 1024 && unitIdx < units.length - 1) {
    value /= 1024
    unitIdx++
  }
  return `${value.toFixed(unitIdx === 0 ? 0 : 1)} ${units[unitIdx]}`
}

export function isBlockEmpty(block) {
  switch (block.type) {
    case 'text':
    case 'markdown':
    case 'heading':
    case 'code':
    case 'quote':
    case 'alert':
      return !block.content?.trim()
    case 'image':
    case 'video':
      return !block.url?.trim()
    case 'link':
      return !block.url?.trim() || !block.label?.trim()
    case 'file':
      return !block.url?.trim() || !block.label?.trim()
    case 'question':
      return !block.enunciado?.trim()
    case 'list':
      return !block.items?.some((i) => i.trim())
    case 'terminal':
      return !block.commands?.some((c) => c.trim())
    case 'links':
      return !block.links?.some((l) => l.title?.trim() && l.url?.trim())
    case 'gallery':
      return !block.images?.some((i) => i.url?.trim())
    default:
      return false
  }
}

export function getBlockSummary(block) {
  const truncate = (s, n = 60) => {
    const clean = String(s || '').trim().replace(/\s+/g, ' ')
    return clean.length > n ? `${clean.slice(0, n)}…` : clean
  }
  switch (block.type) {
    case 'text':
    case 'markdown':
    case 'quote':
      return truncate(block.content) || 'Vazio'
    case 'heading':
      return truncate(block.content) || 'Vazio'
    case 'code':
    case 'terminal':
      return block.language || 'Sem código'
    case 'image':
      return block.alt || truncate(block.url) || 'Sem imagem'
    case 'gallery':
      return `${block.images?.filter((i) => i.url).length || 0} imagem(ns)`
    case 'video':
      return block.title || truncate(block.url) || 'Sem vídeo'
    case 'file':
      return block.label || truncate(block.url) || 'Sem arquivo'
    case 'link':
      return block.label || truncate(block.url) || 'Sem link'
    case 'links':
      return `${block.links?.filter((l) => l.title || l.url).length || 0} link(s)`
    case 'embed':
      return truncate(block.url) || 'Sem embed'
    case 'list':
      return `${block.items?.filter((i) => i).length || 0} item(ns)`
    case 'steps':
      return `${block.steps?.filter((s) => s.title).length || 0} passo(s)`
    case 'checklist':
      return `${block.items?.filter((i) => i.text).length || 0} item(ns)`
    case 'table':
      return `${block.rows?.length || 0} linha(s)`
    case 'accordion':
      return `${block.items?.filter((i) => i.title).length || 0} item(ns)`
    case 'alert':
      return truncate(block.content) || 'Vazio'
    case 'question':
      return truncate(block.enunciado) || 'Sem enunciado'
    case 'divider':
      return ''
    default:
      return ''
  }
}
