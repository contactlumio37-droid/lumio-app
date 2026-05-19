import { useState, useCallback } from 'react'
import {
  saveCheckout,
  getTodaySnapshot,
  isStrongEmotion,
  type CheckoutData,
  type DailySnapshot,
  type MoodScore,
  type EmotionType,
} from '../services/checkoutService'

export type CheckoutStep = 1 | 2 | 3 | 4

interface CheckoutState {
  step:          CheckoutStep
  data:          Partial<CheckoutData>
  todaySnapshot: DailySnapshot | null
  submitting:    boolean
  error:         string | null
  completed:     boolean
}

export function useCheckout(userId: string) {
  const [state, setState] = useState<CheckoutState>({
    step:          1,
    data:          {},
    todaySnapshot: null,
    submitting:    false,
    error:         null,
    completed:     false,
  })

  const nextStep = useCallback(() => {
    setState(s => ({ ...s, step: Math.min(4, s.step + 1) as CheckoutStep }))
  }, [])

  const prevStep = useCallback(() => {
    setState(s => ({ ...s, step: Math.max(1, s.step - 1) as CheckoutStep }))
  }, [])

  const goToStep = useCallback((step: CheckoutStep) => {
    setState(s => ({ ...s, step }))
  }, [])

  const setMood = useCallback(
    (mood: MoodScore, emotion: EmotionType, intensity: MoodScore) => {
      setState(s => ({
        ...s,
        data: { ...s.data, mood_evening: mood, emotion_primary: emotion, emotion_intensity: intensity },
      }))
    },
    [],
  )

  const setDecharge = useCallback((text: string) => {
    const sliced = text.slice(0, 500)
    setState(s => ({
      ...s,
      data: { ...s.data, decharge_text: sliced, decharge_length: sliced.length },
    }))
  }, [])

  const setJoyNote = useCallback((note: string) => {
    setState(s => ({ ...s, data: { ...s.data, joy_note: note } }))
  }, [])

  const setTodos = useCallback((todo1: string, todo2: string) => {
    setState(s => ({
      ...s,
      data: {
        ...s.data,
        tomorrow_todo_1: todo1.slice(0, 200),
        tomorrow_todo_2: todo2.slice(0, 200),
      },
    }))
  }, [])

  const checkIsEmotionStrong = useCallback((): boolean => {
    const { emotion_primary, emotion_intensity } = state.data
    if (!emotion_primary || !emotion_intensity) return false
    return isStrongEmotion(emotion_primary, emotion_intensity)
  }, [state.data])

  const submit = useCallback(async (): Promise<void> => {
    const { data } = state
    if (!data.mood_evening || !data.emotion_primary || !data.emotion_intensity) {
      setState(s => ({ ...s, error: 'Humeur requise pour terminer le checkout.' }))
      return
    }

    setState(s => ({ ...s, submitting: true, error: null }))
    try {
      const now = new Date()
      const checkoutTime = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2, '0'))
        .join(':')

      await saveCheckout(userId, {
        ...(data as CheckoutData),
        checkout_done: true,
        checkout_time: checkoutTime,
      })

      const snapshot = await getTodaySnapshot(userId)
      setState(s => ({ ...s, submitting: false, completed: true, todaySnapshot: snapshot }))
    } catch (err) {
      setState(s => ({
        ...s,
        submitting: false,
        error: err instanceof Error ? err.message : 'Erreur lors du checkout.',
      }))
    }
  }, [state, userId])

  const reset = useCallback(() => {
    setState({ step: 1, data: {}, todaySnapshot: null, submitting: false, error: null, completed: false })
  }, [])

  return {
    step:           state.step,
    checkoutData:   state.data,
    todaySnapshot:  state.todaySnapshot,
    submitting:     state.submitting,
    error:          state.error,
    completed:      state.completed,
    nextStep,
    prevStep,
    goToStep,
    setMood,
    setDecharge,
    setJoyNote,
    setTodos,
    isEmotionStrong: checkIsEmotionStrong,
    submit,
    reset,
  }
}
