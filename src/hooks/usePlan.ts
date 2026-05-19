export type Plan = 'free' | 'plus'

export interface PlanLimits {
  maxTrackers: number
  maxObjectives: number
  maxJournalEntries: number
  insightsPerWeek: number
  hasFluxMode: boolean
  hasAnnualCharts: boolean
  hasExport: boolean
  hasAllThemes: boolean
}

const FREE_LIMITS: PlanLimits = {
  maxTrackers: 3,
  maxObjectives: 2,
  maxJournalEntries: 5,
  insightsPerWeek: 1,
  hasFluxMode: false,
  hasAnnualCharts: false,
  hasExport: false,
  hasAllThemes: false,
}

const PLUS_LIMITS: PlanLimits = {
  maxTrackers: Infinity,
  maxObjectives: Infinity,
  maxJournalEntries: Infinity,
  insightsPerWeek: Infinity,
  hasFluxMode: true,
  hasAnnualCharts: true,
  hasExport: true,
  hasAllThemes: true,
}

export function usePlan(isPlus: boolean) {
  const plan: Plan = isPlus ? 'plus' : 'free'
  const limits: PlanLimits = isPlus ? PLUS_LIMITS : FREE_LIMITS

  return {
    plan,
    limits,
    isPlus,
    canAddTracker: (count: number) => count < limits.maxTrackers,
    canAddObjective: (count: number) => count < limits.maxObjectives,
    canAddJournalEntry: (count: number) => count < limits.maxJournalEntries,
  }
}
