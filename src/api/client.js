const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function getToken() {
  try {
    const raw = localStorage.getItem('sio-user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token || null
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body } = options
  const headers = { ...options.headers }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let resp
  try {
    resp = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('network')
  }

  if (resp.status === 204) return null

  let data = null
  const text = await resp.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!resp.ok) {
    const detail = data?.detail || data?.message || JSON.stringify(data)
    const error = new Error(detail || `HTTP ${resp.status}`)
    error.status = resp.status
    error.data = data
    throw error
  }

  return data
}

async function uploadFile(path, file, extra = {}) {
  const form = new FormData()
  form.append('file', file)
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, value)
    }
  }

  const headers = {}
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let resp
  try {
    resp = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: form })
  } catch {
    throw new Error('network')
  }

  const text = await resp.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!resp.ok) {
    const detail = data?.file?.[0] || data?.detail || data?.message || JSON.stringify(data)
    const error = new Error(detail || `HTTP ${resp.status}`)
    error.status = resp.status
    error.data = data
    throw error
  }

  return data
}

function toQueryString(params = {}) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.append(key, value)
    }
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

function unwrapPaged(data) {
  if (data && Array.isArray(data.results)) return data.results
  if (Array.isArray(data)) return data
  return []
}

export { BASE_URL, request, uploadFile, toQueryString, unwrapPaged }
