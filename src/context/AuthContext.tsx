import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  useSession,
  useProfile,
  signIn,
  signInWithGoogle,
  signUp,
  signOut,
  resetPassword,
  deleteAccount,
} from '../hooks/useAuth'
import type { Profile, Session, User } from '../hooks/useAuth'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  isPaid: boolean
  isAdmin: boolean
  setProfile: (profile: Profile | null) => void
  signIn: typeof signIn
  signInWithGoogle: typeof signInWithGoogle
  signUp: typeof signUp
  signOut: typeof signOut
  resetPassword: typeof resetPassword
  deleteAccount: (userId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProviderSupabase({ children }: { children: ReactNode }) {
  const { session, loading: sessionLoading } = useSession()
  const user = session?.user ?? null
  const { profile, loading: profileLoading, setProfile } = useProfile(user?.id)

  const loading = sessionLoading || (!!user && profileLoading)
  const isPaid = profile?.plan === 'plus'
  const isAdmin = profile?.is_admin ?? false

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    profile,
    loading,
    isPaid,
    isAdmin,
    setProfile,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    deleteAccount,
  }), [session, user, profile, loading, isPaid, setProfile])

  if (loading) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthSupabase() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthSupabase doit être utilisé dans AuthProviderSupabase')
  return ctx
}
