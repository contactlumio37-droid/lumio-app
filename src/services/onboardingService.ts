import { supabase } from '../lib/supabase'

export async function markOnboardingDone(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_done: true })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}
