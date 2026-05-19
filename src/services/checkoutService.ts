import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

export type DailySnapshot = Database['public']['Tables']['daily_snapshots']['Row']

export interface CheckoutData {
  mood_evening: 1 | 2 | 3 | 4 | 5
  emotion_primary: 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur' | 'neutre'
  emotion_intensity: 1 | 2 | 3 | 4 | 5
  decharge_text?: string
  decharge_length?: number
  tomorrow_todo_1?: string
  tomorrow_todo_2?: string
  joy_note?: string
  checkout_done: true
  checkout_time: string // HH:MM:SS
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function nowTime(): string {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':')
}

export async function saveCheckout(userId: string, data: CheckoutData): Promise<void> {
  const payload: Database['public']['Tables']['daily_snapshots']['Insert'] = {
    user_id: userId,
    date: todayISO(),
    mood_evening: data.mood_evening,
    emotion_primary: data.emotion_primary,
    emotion_intensity: data.emotion_intensity,
    checkout_done: true,
    checkout_time: data.checkout_time || nowTime(),
    decharge_text: data.decharge_text?.slice(0, 500) ?? null,
    decharge_length: data.decharge_text ? data.decharge_text.length : null,
    tomorrow_todo_1: data.tomorrow_todo_1?.slice(0, 200) ?? null,
    tomorrow_todo_2: data.tomorrow_todo_2?.slice(0, 200) ?? null,
    joy_note: data.joy_note?.slice(0, 300) ?? null,
  }

  const { error } = await supabase
    .from('daily_snapshots')
    .upsert(payload, { onConflict: 'user_id,date' })

  if (error) throw new Error(`Checkout save failed: ${error.message}`)
}

export async function getTodaySnapshot(userId: string): Promise<DailySnapshot | null> {
  const { data, error } = await supabase
    .from('daily_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('date', todayISO())
    .single()

  if (error?.code === 'PGRST116') return null // no rows
  if (error) throw new Error(`Snapshot fetch failed: ${error.message}`)
  return data
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
        user_id: userId,
        date: todayISO(),
        tomorrow_todo_1: todo1?.slice(0, 200) ?? null,
        tomorrow_todo_2: todo2?.slice(0, 200) ?? null,
      },
      { onConflict: 'user_id,date' },
    )

  if (error) throw new Error(`Todos save failed: ${error.message}`)
}
