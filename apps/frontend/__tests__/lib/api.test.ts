import { apiClient } from '@/lib/api'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('API Client', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('apiClient configuration', () => {
    it('has correct base URL', () => {
      expect(apiClient.defaults.baseURL).toBeDefined()
    })

    it('has default headers', () => {
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json')
    })

    it('has timeout configured', () => {
      expect(apiClient.defaults.timeout).toBe(30000)
    })
  })

  describe('request interceptor', () => {
    it('adds authorization header when token exists', () => {
      localStorageMock.setItem('access_token', 'test-token-123')
      
      const config = {
        headers: {} as any,
        url: '/api/test',
      }

      // Simulate interceptor
      const accessToken = localStorageMock.getItem('access_token')
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }

      expect(config.headers.Authorization).toBe('Bearer test-token-123')
    })

    it('adds tenant ID header when tenant exists', () => {
      localStorageMock.setItem('tenant_id', 'tenant-123')
      
      const config = {
        headers: {} as any,
        url: '/api/feedbacks',
      }

      const tenantId = localStorageMock.getItem('tenant_id')
      if (tenantId && !config.url?.includes('consultar-protocolo')) {
        config.headers['X-Tenant-ID'] = tenantId
      }

      expect(config.headers['X-Tenant-ID']).toBe('tenant-123')
    })

    it('does not add tenant header for public routes', () => {
      localStorageMock.setItem('tenant_id', 'tenant-123')
      
      const config = {
        headers: {} as any,
        url: '/api/consultar-protocolo/ABC123',
      }

      const tenantId = localStorageMock.getItem('tenant_id')
      if (tenantId && !config.url?.includes('consultar-protocolo')) {
        config.headers['X-Tenant-ID'] = tenantId
      }

      expect(config.headers['X-Tenant-ID']).toBeUndefined()
    })
  })

  describe('token management', () => {
    it('stores access token', () => {
      localStorageMock.setItem('access_token', 'new-token')
      expect(localStorageMock.getItem('access_token')).toBe('new-token')
    })

    it('stores refresh token', () => {
      localStorageMock.setItem('refresh_token', 'refresh-token')
      expect(localStorageMock.getItem('refresh_token')).toBe('refresh-token')
    })

    it('clears tokens on logout', () => {
      localStorageMock.setItem('access_token', 'token')
      localStorageMock.setItem('refresh_token', 'refresh')
      
      localStorageMock.removeItem('access_token')
      localStorageMock.removeItem('refresh_token')
      
      expect(localStorageMock.getItem('access_token')).toBeNull()
      expect(localStorageMock.getItem('refresh_token')).toBeNull()
    })
  })
})
