import { reactive } from 'vue'
import {
  fetchAnos,
  fetchAtividades,
  createAtividade as apiCreateAtividade,
  updateAtividade as apiUpdateAtividade,
  deleteAtividade as apiDeleteAtividade,
  duplicarAtividade as apiDuplicarAtividade,
} from '../api/catalog.js'

const staticAnos = {
  1: {
    label: '1º Ano',
    desc: 'Fundamentos da programação, lógica, introdução à computação e primeiros passos no desenvolvimento web.',
    disciplinas: [
      { id: 'logica', name: 'Lógica de Programação', icon: 'mdi-language-javascript' },
      { id: 'web1', name: 'Desenvolvimento Web I', icon: 'mdi-vuejs' },
      { id: 'intro', name: 'Introdução à Computação', icon: 'mdi-laptop' },
      { id: 'projeto1', name: 'Projeto Integrador I', icon: 'mdi-folder-star-outline' },
    ],
  },
  2: {
    label: '2º Ano',
    desc: 'Banco de dados, engenharia de software, desenvolvimento web avançado e projetos integrados.',
    disciplinas: [
      { id: 'banco', name: 'Banco de Dados', icon: 'mdi-database' },
      { id: 'software', name: 'Projeto de Software', icon: 'mdi-cog-outline' },
      { id: 'web2', name: 'Desenvolvimento Web II', icon: 'mdi-vuejs' },
      { id: 'projeto2', name: 'Projeto Integrador II', icon: 'mdi-folder-star-outline' },
    ],
  },
  3: {
    label: '3º Ano',
    desc: 'Desenvolvimento web avançado, mobile, redes de computadores e projeto final integrador.',
    disciplinas: [
      { id: 'web3', name: 'Desenvolvimento Web III', icon: 'mdi-language-python' },
      { id: 'mobile', name: 'Desenvolvimento Web Mobile', icon: 'mdi-cellphone' },
      { id: 'projeto3', name: 'Projeto Integrador', icon: 'mdi-folder-star-outline' },
      { id: 'redes', name: 'Redes de Computadores', icon: 'mdi-network' },
    ],
  },
}

export const disciplinaNomes = {
  logica: 'Lógica de Programação',
  web1: 'Desenvolvimento Web I',
  intro: 'Introdução à Computação',
  projeto1: 'Projeto Integrador I',
  banco: 'Banco de Dados',
  software: 'Projeto de Software',
  web2: 'Desenvolvimento Web II',
  projeto2: 'Projeto Integrador II',
  web3: 'Desenvolvimento Web III',
  mobile: 'Desenvolvimento Web Mobile',
  projeto3: 'Projeto Integrador',
  redes: 'Redes de Computadores',
}

export const disciplinaDescricoes = {
  logica: 'Desenvolvimento do raciocínio lógico, algoritmos e fundamentos da programação.',
  web1: 'Estruturação de páginas web com HTML, CSS e introdução ao JavaScript.',
  intro: 'Conceitos fundamentais de computação, hardware, software e sistemas operacionais.',
  projeto1: 'Primeiro projeto integrador aplicando os conhecimentos do primeiro ano.',
  banco: 'Modelagem de dados, consultas SQL, normalização e gestão de bancos de dados relacionais.',
  software: 'Metodologias de desenvolvimento de software, UML, requisitos e gestão de projetos.',
  web2: 'Desenvolvimento back-end e front-end com foco em aplicações web completas.',
  projeto2: 'Projeto integrador combinando banco de dados, web e engenharia de software.',
  web3: 'Frameworks modernos, APIs, autenticação e arquiteturas avançadas de web apps.',
  mobile: 'Desenvolvimento de aplicações web responsivas e híbridas para dispositivos móveis.',
  projeto3: 'Projeto final integrador aplicando todas as competências do curso.',
  redes: 'Fundamentos de redes, protocolos TCP/IP, configuração de roteadores e segurança de rede.',
}

export const anos = reactive(staticAnos)
export const atividades = reactive({})

function collectDisciplinaSlugs() {
  const slugs = new Set()
  for (const ano of Object.values(anos)) {
    for (const disc of ano.disciplinas) {
      slugs.add(disc.id)
    }
  }
  return [...slugs]
}

function upsertAnos(anosApi) {
  const keep = new Set()
  for (const anoApi of anosApi) {
    const key = String(anoApi.numero)
    keep.add(key)
    if (anos[key]) {
      anos[key].desc = anoApi.desc
      anos[key].disciplinas.splice(0, anos[key].disciplinas.length, ...anoApi.disciplinas)
    } else {
      anos[key] = {
        label: anoApi.label,
        desc: anoApi.desc,
        disciplinas: anoApi.disciplinas,
      }
    }
  }
  for (const key of Object.keys(anos)) {
    if (!keep.has(key)) delete anos[key]
  }
}

export async function refreshAtividades() {
  const slugs = collectDisciplinaSlugs()
  if (!slugs.length) return false
  try {
    const results = await Promise.all(
      slugs.map(async (slug) => {
        const list = await fetchAtividades({ disciplina: slug })
        return { slug, list }
      }),
    )
    for (const { slug, list } of results) {
      atividades[slug] = list
    }
    return true
  } catch {
    return false
  }
}

export async function initCatalog() {
  try {
    const anosApi = await fetchAnos()
    upsertAnos(anosApi)
    await refreshAtividades()
  } catch {
    // sem acesso à API; o catálogo permanece vazio
  }
}

export async function addAtividade(disciplinaId, atividade) {
  const criada = await apiCreateAtividade({ ...atividade, disciplina: disciplinaId })
  if (!atividades[disciplinaId]) atividades[disciplinaId] = []
  atividades[disciplinaId].push(criada)
  return criada
}

export async function deleteAtividade(disciplinaId, atividadeId) {
  const numero = Number(atividadeId)
  await apiDeleteAtividade(numero)
  const lista = atividades[disciplinaId]
  if (!lista) return false
  const idx = lista.findIndex((a) => a.id === numero)
  if (idx === -1) return false
  lista.splice(idx, 1)
  return true
}

export async function duplicarAtividade(disciplinaId, atividadeId) {
  const copia = await apiDuplicarAtividade(atividadeId)
  if (!atividades[disciplinaId]) atividades[disciplinaId] = []
  atividades[disciplinaId].push(copia)
  return copia
}

export async function editAtividade(disciplinaId, atividadeId, updates) {
  const numero = Number(atividadeId)
  const editada = await apiUpdateAtividade(numero, { ...updates, disciplina: disciplinaId })
  const lista = atividades[disciplinaId] || []
  const idx = lista.findIndex((a) => a.id === numero)
  if (idx !== -1) lista[idx] = editada
  else atividades[disciplinaId].push(editada)
  return editada
}

export function getAno(anoId) {
  return anos[anoId] || null
}

export function getDisciplina(anoId, disciplinaId) {
  const ano = getAno(anoId)
  if (!ano) return null
  return ano.disciplinas.find((d) => d.id === disciplinaId) || null
}

export function getAnoIdByDisciplina(disciplinaId) {
  for (const [anoId, ano] of Object.entries(anos)) {
    if (ano.disciplinas.some((d) => d.id === disciplinaId)) {
      return anoId
    }
  }
  return null
}

export function getAtividades(disciplinaId) {
  return atividades[disciplinaId] || []
}

export function getAtividade(disciplinaId, atividadeId) {
  const lista = getAtividades(disciplinaId)
  return lista.find((a) => a.id === Number(atividadeId)) || null
}

const normalizeText = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export function searchAtividades(query, filters = {}) {
  const { anoId, disciplinaId } = filters
  const q = normalizeText(query)
  const results = []

  for (const [anoKey, ano] of Object.entries(anos)) {
    if (anoId && String(anoId) !== String(anoKey)) continue
    for (const disc of ano.disciplinas) {
      if (disciplinaId && disc.id !== disciplinaId) continue
      const lista = getAtividades(disc.id)
      for (const ativ of lista) {
        if (q) {
          const titleMatch = normalizeText(ativ.title).includes(q)
          const descMatch = normalizeText(ativ.desc).includes(q)
          const questMatch = (ativ.questoes || []).some((qst) =>
            normalizeText(qst.enunciado).includes(q),
          )
          if (!titleMatch && !descMatch && !questMatch) continue
        }
        results.push({
          anoId: Number(anoKey),
          anoLabel: ano.label,
          disciplina: disc,
          atividade: ativ,
        })
      }
    }
  }
  return results
}
