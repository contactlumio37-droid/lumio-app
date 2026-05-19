// AUTO-GENERATED — ne pas éditer manuellement
// Regénérer avec : supabase gen types typescript --project-id $VITE_SUPABASE_PROJECT_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          language: 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'
          gender: 'm' | 'f' | 'n' | null
          companion_animal: 'otter' | 'hedgehog' | 'fox' | 'koala' | 'axolotl' | null
          plan: 'free' | 'plus'
          revenuecat_id: string | null
          onboarding_done: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          language?: 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'
          gender?: 'm' | 'f' | 'n' | null
          companion_animal?: 'otter' | 'hedgehog' | 'fox' | 'koala' | 'axolotl' | null
          plan?: 'free' | 'plus'
          revenuecat_id?: string | null
          onboarding_done?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          language?: 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'
          gender?: 'm' | 'f' | 'n' | null
          companion_animal?: 'otter' | 'hedgehog' | 'fox' | 'koala' | 'axolotl' | null
          plan?: 'free' | 'plus'
          revenuecat_id?: string | null
          onboarding_done?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      daily_snapshots: {
        Row: {
          id: string
          user_id: string
          date: string
          mood_morning: number | null
          mood_evening: number | null
          emotion_primary: 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur' | 'neutre' | null
          emotion_intensity: number | null
          sleep_quality: number | null
          sleep_hours: number | null
          checkout_done: boolean
          checkout_time: string | null
          tomorrow_todo_1: string | null
          tomorrow_todo_2: string | null
          decharge_text: string | null
          decharge_length: number | null
          pulse_triggered: boolean
          pulse_type: string | null
          joy_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mood_morning?: number | null
          mood_evening?: number | null
          emotion_primary?: 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur' | 'neutre' | null
          emotion_intensity?: number | null
          sleep_quality?: number | null
          sleep_hours?: number | null
          checkout_done?: boolean
          checkout_time?: string | null
          tomorrow_todo_1?: string | null
          tomorrow_todo_2?: string | null
          decharge_text?: string | null
          decharge_length?: number | null
          pulse_triggered?: boolean
          pulse_type?: string | null
          joy_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mood_morning?: number | null
          mood_evening?: number | null
          emotion_primary?: 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur' | 'neutre' | null
          emotion_intensity?: number | null
          sleep_quality?: number | null
          sleep_hours?: number | null
          checkout_done?: boolean
          checkout_time?: string | null
          tomorrow_todo_1?: string | null
          tomorrow_todo_2?: string | null
          decharge_text?: string | null
          decharge_length?: number | null
          pulse_triggered?: boolean
          pulse_type?: string | null
          joy_note?: string | null
          created_at?: string
        }
      }
      trackers: {
        Row: {
          id: string
          user_id: string
          slug: string
          label: string
          icon: string | null
          type: 'bool' | 'scale3' | 'scale5' | 'counter'
          active: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          label: string
          icon?: string | null
          type: 'bool' | 'scale3' | 'scale5' | 'counter'
          active?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          label?: string
          icon?: string | null
          type?: 'bool' | 'scale3' | 'scale5' | 'counter'
          active?: boolean
          order_index?: number
          created_at?: string
        }
      }
      tracker_entries: {
        Row: {
          id: string
          snapshot_id: string
          user_id: string
          tracker_id: string
          value_bool: boolean | null
          value_int: number | null
          date: string
        }
        Insert: {
          id?: string
          snapshot_id: string
          user_id: string
          tracker_id: string
          value_bool?: boolean | null
          value_int?: number | null
          date: string
        }
        Update: {
          id?: string
          snapshot_id?: string
          user_id?: string
          tracker_id?: string
          value_bool?: boolean | null
          value_int?: number | null
          date?: string
        }
      }
      objectives: {
        Row: {
          id: string
          user_id: string
          title: string
          type: 'checklist' | 'value' | 'counter'
          target: number | null
          current: number
          unit: string | null
          active: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: 'checklist' | 'value' | 'counter'
          target?: number | null
          current?: number
          unit?: string | null
          active?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: 'checklist' | 'value' | 'counter'
          target?: number | null
          current?: number
          unit?: string | null
          active?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      pulse_log: {
        Row: {
          id: string
          user_id: string
          trigger_type: string
          notif_sent_at: string
          notif_text: string | null
          user_opened: boolean | null
          user_responded: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          trigger_type: string
          notif_sent_at?: string
          notif_text?: string | null
          user_opened?: boolean | null
          user_responded?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          trigger_type?: string
          notif_sent_at?: string
          notif_text?: string | null
          user_opened?: boolean | null
          user_responded?: boolean | null
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          mode: 'journal' | 'flux'
          content: string | null
          emotion_context: string | null
          word_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          mode: 'journal' | 'flux'
          content?: string | null
          emotion_context?: string | null
          word_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          mode?: 'journal' | 'flux'
          content?: string | null
          emotion_context?: string | null
          word_count?: number | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
