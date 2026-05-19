import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

// ─── Types exportés ────────────────────────────────────────────────────────────

export type DailySnapshot = Database['public']['Tables']['daily_snapshots']['Row']
export type MoodScore   = 1 | 2 | 3 | 4 | 5
export type EmotionType = 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur' | 'neutre'

export interface CheckoutData {
  mood_evening:      MoodScore
  emotion_primary:   EmotionType
  emotion_intensity: MoodScore
  decharge_text?:    string    // max 500 chars, validé avant envoi
  decharge_length?:  number
  tomorrow_todo_1?:  string    // max 200 chars
  tomorrow_todo_2?:  string    // max 200 chars
  joy_note?:         string    // max 300 chars
  checkout_done:     true
  checkout_time:     string    // HH:MM:SS local
}

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CheckoutError'
  }
}

// ─── Utilitaires internes ──────────────────────────────────────────────────────

function localDateISO(d: Date = new Date()): string {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function nowTimeLocal(): string {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':')
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastErr: Error = new CheckoutError('Erreur inconnue')
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, attempt * 500))
      }
    }
  }
  throw new CheckoutError(`Échec après ${maxAttempts} tentatives : ${lastErr.message}`)
}

// ─── Fonctions publiques ───────────────────────────────────────────────────────

export async function saveCheckout(userId: string, data: CheckoutData): Promise<void> {
  const payload: Database['public']['Tables']['daily_snapshots']['Insert'] = {
    user_id:          userId,
    date:             localDateISO(),
    mood_evening:     data.mood_evening,
    emotion_primary:  data.emotion_primary,
    emotion_intensity: data.emotion_intensity,
    checkout_done:    true,
    checkout_time:    data.checkout_time || nowTimeLocal(),
    decharge_text:    data.decharge_text?.slice(0, 500) ?? null,
    decharge_length:  data.decharge_text ? data.decharge_text.length : null,
    tomorrow_todo_1:  data.tomorrow_todo_1?.slice(0, 200) ?? null,
    tomorrow_todo_2:  data.tomorrow_todo_2?.slice(0, 200) ?? null,
    joy_note:         data.joy_note?.slice(0, 300) ?? null,
  }

  await withRetry(async () => {
    const { error } = await supabase
      .from('daily_snapshots')
      .upsert(payload, { onConflict: 'user_id,date' })
    if (error) throw new Error(error.message)
  })

  // Notif matinale J+1 — fire & forget
  void scheduleMorningNotification(userId, data.mood_evening)
}

async function scheduleMorningNotification(
  userId: string,
  moodEvening: MoodScore,
): Promise<void> {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(8, 0, 0, 0)

  const body =
    moodEvening >= 4
      ? "Belle nuit ! Comment tu attaques cette journée ?"
      : moodEvening >= 2
        ? "Pas le repos idéal. Prends soin de toi aujourd'hui."
        : "Nuit difficile... Tes deux choses pour aujourd'hui t'attendent."

  await supabase.from('scheduled_notifications').insert({
    user_id: userId,
    send_at: tomorrow.toISOString(),
    title:   'Lumio 🌅',
    body,
  })
}

export async function getTodaySnapshot(userId: string): Promise<DailySnapshot | null> {
  const { data, error } = await supabase
    .from('daily_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('date', localDateISO())
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw new CheckoutError(`Snapshot fetch failed: ${error.message}`)
  return data
}

/** Compte les jours consécutifs checkout_done = true (max 60 jours). */
export async function getStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('daily_snapshots')
    .select('date')
    .eq('user_id', userId)
    .eq('checkout_done', true)
    .order('date', { ascending: false })
    .limit(60)

  if (error || !data || data.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0

  for (let i = 0; i < data.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    if (data[i].date === localDateISO(expected)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

/** Retourne true si l'émotion mérite un flow d'exploration. */
export function isStrongEmotion(emotion: EmotionType, intensity: MoodScore): boolean {
  return emotion !== 'neutre' && intensity >= 3
}

export async function saveTodos(
  userId: string,
  todo1?: string,
  todo2?: string,
): Promise<void> {
  const { error } = await supabase
    .from('daily_snapshots')
    .upsert(
      {
        user_id:         userId,
        date:            localDateISO(),
        tomorrow_todo_1: todo1?.slice(0, 200) ?? null,
        tomorrow_todo_2: todo2?.slice(0, 200) ?? null,
      },
      { onConflict: 'user_id,date' },
    )

  if (error) throw new CheckoutError(`Todos save failed: ${error.message}`)
}
