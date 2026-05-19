import type { Animal } from '../../services/companionService'
import { getCompanionAssetPath } from '../../services/companionService'

interface Props {
  triggerType: string
  animal: Animal
  accent: string
  lang: string
  onTalk: () => void
  onDismiss: () => void
}

const MESSAGES: Record<string, Record<string, string>> = {
  bad_sleep: {
    fr: "Ton sommeil mérite attention. Comment puis-je t'aider ce soir ?",
    en: "Your sleep deserves attention. How can I help you tonight?",
  },
  low_mood: {
    fr: "Ces derniers jours semblent lourds. Tu veux en parler ?",
    en: "The last few days seem heavy. Want to talk about it?",
  },
  absence: {
    fr: "Ça fait un moment. Comment tu vas ?",
    en: "It's been a while. How are you?",
  },
  streak_7: {
    fr: "7 jours de suite ! Ton compagnon est tellement fier de toi 🌟",
    en: "7 days in a row! Your companion is so proud of you 🌟",
  },
  rebound: {
    fr: "Tu remontes la pente. Belle résilience 🌱",
    en: "You're bouncing back. Beautiful resilience 🌱",
  },
  anger_repeat: {
    fr: "La colère revient souvent cette semaine. On explore ça ensemble ?",
    en: "Anger keeps coming back this week. Shall we explore that together?",
  },
  alert_threshold: {
    fr: "Lumio s'inquiète pour toi 💙 Parler à quelqu'un peut vraiment aider.",
    en: "Lumio is worried about you 💙 Talking to someone can really help.",
  },
}

const POSITIVE_TRIGGERS = new Set(['streak_7', 'rebound'])

export function PulseNotice({ triggerType, animal, accent, lang, onTalk, onDismiss }: Props) {
  const langKey = ['fr','en'].includes(lang) ? lang : 'fr'
  const message = MESSAGES[triggerType]?.[langKey] ?? MESSAGES[triggerType]?.fr ?? ''
  const isPositive = POSITIVE_TRIGGERS.has(triggerType)
  const assetPath = getCompanionAssetPath(animal, isPositive ? 'proud' : 'attentive')

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        marginBottom: 16,
        borderRadius: 16,
        background: isPositive
          ? `${accent}18`
          : 'rgba(255,255,255,0.06)',
        border: `1px solid ${isPositive ? accent + '44' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <img
        src={assetPath}
        alt={animal}
        width={44}
        height={44}
        onError={e => { ;(e.target as HTMLImageElement).style.display = 'none' }}
        style={{ objectFit: 'contain', flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.9 }}>
          {message}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {!isPositive && (
            <button
              onClick={onTalk}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                border: 'none',
                background: accent,
                color: '#fff',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Je veux en parler
            </button>
          )}
          <button
            onClick={onDismiss}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              opacity: 0.45,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {isPositive ? 'Merci ✨' : 'Ça va, merci'}
          </button>
        </div>
      </div>
    </div>
  )
}
