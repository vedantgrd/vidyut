const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'
let _accessToken: string | null = null

export const setAccessToken = (t: string | null) => { _accessToken = t }
export const getAccessToken = () => _accessToken

export function normalizeErrorMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.'
  if (typeof err === 'string') return err

  if (typeof err === 'object') {
    const obj = err as Record<string, any>

    // Zod validator error format from hono: { error: { issues: [{ path, message }] } }
    if (obj.error && typeof obj.error === 'object') {
      if (Array.isArray(obj.error.issues) && obj.error.issues.length > 0) {
        return obj.error.issues.map((i: any) => i.message || `${i.path.join('.')}: Invalid input`).join('; ')
      }
      if (typeof obj.error.message === 'string') {
        return obj.error.message
      }
    }

    // Direct message property
    if (typeof obj.message === 'string' && obj.message && obj.message !== '[object Object]') {
      return obj.message
    }

    // Direct error string property
    if (typeof obj.error === 'string' && obj.error && obj.error !== '[object Object]') {
      return obj.error
    }

    // If there is an issues array directly on the object
    if (Array.isArray(obj.issues) && obj.issues.length > 0) {
      return obj.issues.map((i: any) => i.message || 'Validation error').join('; ')
    }
  }

  return 'Request could not be completed. Please check your details and try again.'
}

async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    _accessToken = data.accessToken
    return data.accessToken
  } catch { return null }
}

export async function apiRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`

  let res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' })
  if (res.status === 401 && _accessToken) {
    const newToken = await refreshToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' })
    }
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const normalizedMessage = normalizeErrorMessage(data)
    const err: Error & { status?: number; code?: string; raw?: unknown } = new Error(normalizedMessage)
    err.status = res.status
    err.code = data?.code || data?.error?.code
    err.raw = data
    throw err
  }
  return data as T
}

export async function apiBlobRequest(path: string, options: RequestInit = {}): Promise<{ blob: Blob; mimeType: string; fileName: string; isFallback: boolean }> {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) }
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`

  let res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' })
  if (res.status === 401 && _accessToken) {
    const newToken = await refreshToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' })
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const normalizedMessage = normalizeErrorMessage(data)
    const err: Error & { status?: number; code?: string; raw?: unknown } = new Error(normalizedMessage)
    err.status = res.status
    err.code = data?.code || data?.error?.code
    err.raw = data
    throw err
  }

  const mimeType = res.headers.get('content-type') || 'application/octet-stream'
  const disposition = res.headers.get('content-disposition') || ''
  const isFallback = res.headers.get('x-vidyut-fallback') === 'true'
  let fileName = 'document'
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
  if (match && match[1]) {
    fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
  }

  const blob = await res.blob()
  return { blob, mimeType, fileName, isFallback }
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => apiRequest<T>(path, { method: 'POST', body: formData }),
  getBlob: (path: string) => apiBlobRequest(path, { method: 'GET' }),
}

