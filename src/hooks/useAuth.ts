import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })
  }, [userId])

  return { profile, loading, setProfile }
}

export function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google' })
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error || !data.user) return { data, error }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
  })
  if (profileError) console.error('Erreur création profil :', profileError)

  return { data, error }
}

export function signOut() {
  return supabase.auth.signOut()
}

export function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email)
}

export async function deleteAccount(userId: string) {
  // Suppression dans l'ordre pour respecter les FK
  const tables = [
    'journal_entries',
    'tracker_entries',
    'trackers',
    'objectives',
    'pulse_log',
    'daily_snapshots',
    'profiles',
  ] as const

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) throw new Error(`Erreur suppression ${table}: ${error.message}`)
  }

  // Supprime auth.users via Edge Function (nécessite service_role)
  const { error } = await supabase.functions.invoke('delete-user', {
    body: { userId },
  })
  if (error) throw new Error(`Erreur suppression auth: ${error.message}`)
}

export type { User, Session, Profile }
