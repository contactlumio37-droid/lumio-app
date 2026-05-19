import { useState, useCallback } from 'react'
import { markOnboardingDone } from '../services/onboardingService'

export function useOnboarding(userId: string) {
  const [completing, setCompleting] = useState(false)

  const complete = useCallback(async () => {
    setCompleting(true)
    try {
      await markOnboardingDone(userId)
    } finally {
      setCompleting(false)
    }
  }, [userId])

  return { completing, complete }
}
