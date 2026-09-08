import { request, toQueryString, unwrapPaged } from './client.js'

function stripMetaFields(data) {
  const copy = { ...data }
  delete copy.id
  delete copy.type
  delete copy.ordem
  return copy
}

function mapBloco(bloco) {
  const { tipo, ordem, dados, id } = bloco
  return {
    id,
    type: tipo,
    ordem,
    ...(dados && typeof dados === 'object' ? dados : {}),
  }
}

function mapAtividade(a) {
  const blocos = (a.blocos || []).map(mapBloco)
  const questoes = blocos
    .filter((b) => b.type === 'question')
    .map((b) => ({ enunciado: b.enunciado, tipo: b.tipo }))
  return {
    id: a.id,
    title: a.titulo,
    desc: a.descricao || '',
    ano: a.ano_numero,
    anoId: a.ano,
    disciplinaId: a.disciplina,
    disciplinaSlug: a.disciplina_slug,
    autorId: a.autor,
    autorNome: a.autor_nome,
    status: a.status,
    fixada: a.fixada,
    dificuldade: a.dificuldade,
    tempoEstimado: a.tempo_estimado,
    tags: a.tags || [],
    preRequisitos: a.pre_requisitos,
    dataPublicacao: a.data_publicacao,
    prazoRecomendado: a.prazo_recomendado,
    criadoEm: a.criado_em,
    atualizadoEm: a.atualizado_em,
    blocks: blocos,
    questoes,
  }
}

function mapAno(a) {
  return {
    numero: a.numero,
    label: `${a.numero}º Ano`,
    desc: a.descricao || '',
    disciplinas: (a.disciplinas || []).map((d) => ({
      id: d.slug,
      slug: d.slug,
      name: d.nome,
      icon: d.icone || '',
      descricao: d.descricao || '',
    })),
  }
}

function mapPayload({ title, desc, blocks, ...rest }) {
  return {
    titulo: title,
    descricao: desc || '',
    blocos: (blocks || []).map((b) => ({
      tipo: b.type,
      dados: stripMetaFields(b),
    })),
    ...rest,
  }
}

export async function fetchAnos() {
  const data = await request('/api/anos/')
  return unwrapPaged(data).map(mapAno)
}

export async function fetchAtividades({ disciplina, ano, autor, status } = {}) {
  const data = await request(`/api/atividades/${toQueryString({ disciplina, ano, autor, status })}`)
  return unwrapPaged(data).map(mapAtividade)
}

export async function fetchAtividade(id) {
  const data = await request(`/api/atividades/${id}/`)
  return mapAtividade(data)
}

export async function createAtividade(payload) {
  const data = await request('/api/atividades/', { method: 'POST', body: mapPayload(payload) })
  return mapAtividade(data)
}

export async function updateAtividade(id, payload) {
  const data = await request(`/api/atividades/${id}/`, { method: 'PUT', body: mapPayload(payload) })
  return mapAtividade(data)
}

export async function deleteAtividade(id) {
  await request(`/api/atividades/${id}/`, { method: 'DELETE' })
}

export async function duplicarAtividade(id) {
  const data = await request(`/api/atividades/${id}/duplicar/`, { method: 'POST', body: {} })
  return mapAtividade(data)
}

export { mapAno, mapAtividade }
