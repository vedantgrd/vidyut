import { API_BASE_URL } from './endpoints'

// In-memory access token (never persisted to localStorage)
let _accessToken: string | null = null

export const tokenStore = {
  get: () => _accessToken,
  set: (token: string | null) => { _accessToken = token },
  clear: () => { _accessToken = null },
}

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
  skipAuth?: boolean
}

const pendingRequests = new Map<string, Promise<any>>()

let isRefreshing = false
let refreshSubscribers: ((token: string | null) => void)[] = []

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshSubscribers.push(resolve)
    })
  }

  isRefreshing = true
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      tokenStore.clear()
      onRefreshed(null)
      return null
    }

    const data = await response.json()
    const newToken: string = data.accessToken
    tokenStore.set(newToken)
    onRefreshed(newToken)
    return newToken
  } catch {
    tokenStore.clear()
    onRefreshed(null)
    return null
  } finally {
    isRefreshing = false
  }
}

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, skipAuth, ...customConfig } = options

    let url = `${API_BASE_URL}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const qs = searchParams.toString()
      if (qs) url += `?${qs}`
    }

    const headers = new Headers(customConfig.headers)
    if (!headers.has('Content-Type') && !(customConfig.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    if (!skipAuth) {
      const token = tokenStore.get()
      if (token) headers.set('Authorization', `Bearer ${token}`)
    }

    const config: RequestInit = {
      ...customConfig,
      headers,
      credentials: 'include',
    }

    const requestKey = `${config.method ?? 'GET'}:${url}`
    if ((!config.method || config.method === 'GET') && pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey) as Promise<T>
    }

    const fetchPromise = (async () => {
      try {
        let response = await fetch(url, config)

        if (response.status === 401 && !skipAuth) {
          const newToken = await refreshAccessToken()
          if (newToken) {
            headers.set('Authorization', `Bearer ${newToken}`)
            response = await fetch(url, { ...config, headers })
          } else {
            // Session expired — redirect to login
            tokenStore.clear()
            const { useAuthStore } = await import('@/features/auth/store/authStore')
            useAuthStore.getState().clearSession()
            throw new ApiError(401, 'Session expired. Please log in again.')
          }
        }

        let body: any
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          body = await response.json()
        }

        if (!response.ok) {
          let message = `Request failed with status ${response.status}`
          if (body) {
            message = body.error?.message ?? body.error ?? body.message ?? message
          }
          throw new ApiError(response.status, message)
        }

        if (body && typeof body === 'object' && 'success' in body) {
          if (body.success) {
            return body.data as T
          } else {
            throw new ApiError(response.status, body.error?.message ?? body.message ?? 'API Request Failed')
          }
        }

        if (body !== undefined) {
          return body as T
        }
        return await response.text() as unknown as T
      } finally {
        pendingRequests.delete(requestKey)
      }
    })()

    if (!config.method || config.method === 'GET') {
      pendingRequests.set(requestKey, fetchPromise)
    }

    return fetchPromise
  }

  static get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  static post<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  static put<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  static patch<T>(endpoint: string, data?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  static delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
