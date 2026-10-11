export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  DASHBOARD: {
    HOME: '/dashboard/home',
  },
  DISCOVERY: {
    SEARCH: '/scholarships',
    FEATURED: '/scholarships/featured',
    RECOMMENDED: '/scholarships/recommended',
    BOOKMARKED: '/scholarships/bookmarked',
    DETAILS: (id: string) => `/scholarships/${id}`,
    TOGGLE_SAVE: (id: string) => `/scholarships/${id}/bookmark`,
  },
  AI: {
    CHAT: '/ai/chat',
    CONVERSATIONS: '/ai/conversations',
    CONVERSATION: (id: string) => `/ai/conversations/${id}`,
    MESSAGES: (id: string) => `/ai/conversations/${id}/messages`,
  },
  TRACKER: {
    APPLICATIONS: '/applications',
    CREATE: '/applications',
    UPDATE_STATUS: (id: string) => `/applications/${id}/status`,
    UPDATE: (id: string) => `/applications/${id}`,
    DELETE: (id: string) => `/applications/${id}`,
  },
  CALENDAR: {
    EVENTS: '/calendar/events',
  },
  NOTIFICATIONS: {
    ALL: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  PROFILE: {
    ME: '/profile',
    UPDATE: '/profile',
    COMPLETION: '/profile/completion',
  },
  DOCUMENTS: {
    ALL: '/documents',
    UPLOAD: '/documents/upload',
    DELETE: (id: string) => `/documents/${id}`,
  },
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
}
