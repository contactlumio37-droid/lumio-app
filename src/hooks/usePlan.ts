export type Plan = 'free' | 'plus'
export type FeatureKey = 'trackers' | 'objectives' | 'journal' | 'insights'

export interface PlanLimits {
  maxTrackers:                   number
  maxObjectives:                 number
  maxJournalEntries:             number
  insightsPerWeek:               number
  hasFluxMode:                   boolean
  hasAnnualCharts:               boolean
  hasExport:                     boolean
  hasAllThemes:                  boolean
  hasUnlimitedCompanionMessages: boolean
}

const FEATURE_MAX: Record<FeatureKey, 'maxTrackers' | 'maxObjectives' | 'maxJournalEntries' | 'insightsPerWeek'> = {
  trackers:   'maxTrackers',
  objectives: 'maxObjectives',
  journal:    'maxJournalEntries',
  insights:   'insightsPerWeek',
}

const FREE_LIMITS: PlanLimits = {
  maxTrackers:                   3,
  maxObjectives:                 2,
  maxJournalEntries:             5,
  insightsPerWeek:               1,
  hasFluxMode:                   false,
  hasAnnualCharts:               false,
  hasExport:                     false,
  hasAllThemes:                  false,
  hasUnlimitedCompanionMessages: false,
}

const PLUS_LIMITS: PlanLimits = {
  maxTrackers:                   Infinity,
  maxObjectives:                 Infinity,
  maxJournalEntries:             Infinity,
  insightsPerWeek:               Infinity,
  hasFluxMode:                   true,
  hasAnnualCharts:               true,
  hasExport:                     true,
  hasAllThemes:                  true,
  hasUnlimitedCompanionMessages: true,
}

export function usePlan(isPlus: boolean) {
  const plan: Plan = isPlus ? 'plus' : 'free'
  const limits: PlanLimits = isPlus ? PLUS_LIMITS : FREE_LIMITS

  function canAdd(feature: FeatureKey, currentCount: number): boolean {
    return currentCount < limits[FEATURE_MAX[feature]]
  }

  return {
    plan,
    limits,
    isPlus,
    canAdd,
    // Backward-compat aliases
    canAddTracker:      (count: number) => canAdd('trackers', count),
    canAddObjective:    (count: number) => canAdd('objectives', count),
    canAddJournalEntry: (count: number) => canAdd('journal', count),
  }
}
