import type { Animal, CompanionState, CompanionConfig } from '../../services/companionService'
import { getCompanionConfig } from '../../services/companionService'
import { CompanionAvatar }  from './CompanionAvatar'
import { CompanionMessage } from './CompanionMessage'

interface Props {
  animal:    Animal
  state:     CompanionState
  message:   string
  assetPath: string  // conservé pour compatibilité ascendante
  streak:    number
  accent:    string  // conservé pour compatibilité ascendante
  userId?:   string
  lang?:     string
}

export function CompanionDisplay({
  animal,
  state,
  message,
  streak,
  userId,
  lang = 'fr',
}: Props) {
  const config: CompanionConfig = getCompanionConfig(animal, state, lang, streak, userId)
  // Override message avec celui passé en prop (déjà calculé par useCompanion)
  const displayConfig: CompanionConfig = { ...config, message }

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:             16,
        padding:        '20px 16px',
      }}
    >
      <CompanionAvatar config={displayConfig} size="lg" />
      <CompanionMessage config={displayConfig} />

      {streak > 0 && (
        <div
          style={{
            display:    'inline-flex',
            alignItems: 'center',
            gap:         6,
            padding:    '4px 12px',
            borderRadius: 50,
            background:  'rgba(245,158,11,0.1)',
            border:      '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <span style={{ fontSize: 14 }}>🔥</span>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize:   12,
              color:     '#F59E0B',
            }}
          >
            {streak} jour{streak > 1 ? 's' : ''} de suite
          </span>
        </div>
      )}
    </div>
  )
}
