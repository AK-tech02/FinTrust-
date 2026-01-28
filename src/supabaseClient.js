
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// Mock Supabase client for development
const createMockClient = () => {
  let mockUser = null
  let mockSession = null
  const authListeners = []

  return {
    auth: {
      signInWithPassword: async ({ email, password }) => {
        // Mock successful login
        mockUser = {
          id: 'mock-user-' + Date.now(),
          email: email,
          user_metadata: { name: 'Demo User' }
        }
        mockSession = {
          user: mockUser,
          access_token: 'mock-token'
        }

        // Notify listeners
        authListeners.forEach(listener => {
          listener('SIGNED_IN', mockSession)
        })

        return { data: { user: mockUser, session: mockSession }, error: null }
      },
      signUp: async ({ email, password, options }) => {
        // Mock successful signup
        mockUser = {
          id: 'mock-user-' + Date.now(),
          email: email,
          user_metadata: options?.data || {}
        }
        mockSession = {
          user: mockUser,
          access_token: 'mock-token'
        }

        return {
          data: { user: mockUser, session: mockSession },
          error: null
        }
      },
      signOut: async () => {
        mockUser = null
        mockSession = null

        // Notify listeners
        authListeners.forEach(listener => {
          listener('SIGNED_OUT', null)
        })

        return { error: null }
      },
      getSession: async () => {
        return { data: { session: mockSession }, error: null }
      },
      onAuthStateChange: (callback) => {
        authListeners.push(callback)

        // Immediately call with current state
        callback(mockSession ? 'SIGNED_IN' : 'SIGNED_OUT', mockSession)

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const index = authListeners.indexOf(callback)
                if (index > -1) authListeners.splice(index, 1)
              }
            }
          }
        }
      }
    },
    from: (table) => ({
      select: () => ({
        order: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        }),
        single: () => Promise.resolve({ data: null, error: null }),
        then: (resolve) => resolve({ data: [], error: null })
      }),
      insert: (data) => ({
        select: () => ({
          single: () => Promise.resolve({
            data: { id: 'mock-' + Date.now(), ...data[0] },
            error: null
          })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    })
  }
}

// Check if we should use mock client
const shouldUseMock = useMockAuth || !supabaseUrl || !supabaseKey ||
  supabaseKey.includes('publishable') || supabaseKey.length < 100

if (shouldUseMock) {
  console.warn('🔧 Using MOCK authentication for development. Sign in with any email/password.')
}

export const supabase = shouldUseMock
  ? createMockClient()
  : createClient(supabaseUrl, supabaseKey)

export const isMockMode = shouldUseMock

