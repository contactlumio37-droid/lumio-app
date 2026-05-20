import type { CompanionConfig } from '../../services/companionService'
import { CompanionAvatar } from '../companion/CompanionAvatar'

// ─── Couleur et état compagnon par trigger ─────────────────────────────────────
const TRIGGER_ACCENT: Record<string, string> = {
  bad_sleep:       '#4F46E5', // indigo
  low_mood:        '#F43F5E', // rose
  absence:         '#C4B5FD', // lavender
  streak_7:        '#F59E0B', // amber
  rebound:         '#14B8A6', // teal
  anger_repeat:    '#F43F5E', // rose
  alert_threshold: '#F43F5E', // rose
}

const POSITIVE = new Set(['streak_7', 'rebound'])

// Messages fallback affichés si pulse_log.notif_text est absent
const FALLBACK: Record<string, Record<string, string>> = {
  bad_sleep:       { fr: "Ton sommeil mérite attention. Comment puis-je t'aider ce soir ?",
                     en: "Your sleep deserves attention. How can I help tonight?" },
  low_mood:        { fr: "Ces derniers jours semblent lourds. Tu veux en parler ?",
                     en: "The last few days seem heavy. Want to talk about it?" },
  absence:         { fr: "Ça fait un moment. Comment tu vas ?",
                     en: "It's been a while. How are you?" },
  streak_7:        { fr: "7 jours de suite ! Ton compagnon est fier de toi 🌟",
                     en: "7 days in a row! Your companion is proud of you 🌟" },
  rebound:         { fr: "Tu remontes la pente. Belle résilience 🌱",
                     en: "You're bouncing back. Beautiful resilience 🌱" },
  anger_repeat:    { fr: "La colère revient souvent cette semaine. On explore ça ensemble ?",
                     en: "Anger keeps coming back this week. Shall we explore together?" },
  alert_threshold: { fr: "Lumio s'inquiète pour toi 💙 Parler à quelqu'un peut vraiment aider.",
                     en: "Lumio is worried about you 💙 Talking to someone can really help." },
}

interface Props {
  triggerType:  string
  config:       CompanionConfig
  lang:         string
  pulseMessage?: string | null  // texte depuis pulse_log (prioritaire)
  onTalk:       () => void
  onDismiss:    () => void
  dismissing?:  boolean         // déclenche fadeOut depuis parent
}

export function PulseNotice({
  triggerType, config, lang, pulseMessage, onTalk, onDismiss, dismissing = false,
}: Props) {
  const langKey   = ['fr','en','es','de','it','pt'].includes(lang) ? lang : 'fr'
  const accent    = TRIGGER_ACCENT[triggerType] ?? config.accentColor
  const isPositive = POSITIVE.has(triggerType)
  const message   = pulseMessage
    ?? FALLBACK[triggerType]?.[langKey]
    ?? FALLBACK[triggerType]?.fr
    ?? ''

  // Config spécifique au trigger (état visuel du compagnon dans la notice)
  const triggerConfig: CompanionConfig = {
    ...config,
    state:       isPositive ? 'proud' : 'attentive',
    accentColor: accent,
  }

  return (
    <div
      className={dismissing ? 'lumio-fade-out' : 'lumio-slide-down'}
      style={{
        margin:       '0 0 16px',
        borderRadius: 16,
        background:   `${accent}0f`,       // ~6% opacity
        borderLeft:   `3px solid ${accent}`,
        border:       `1px solid ${accent}22`,
        borderLeftWidth: 3,
        padding:      '14px 16px',
        display:      'flex',
        alignItems:   'flex-start',
        gap:           12,
      }}
    >
      <CompanionAvatar config={triggerConfig} size="sm" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize:   13,
            lineHeight: 1.5,
            color:      '#EDE9FE',
            marginBottom: 10,
          }}
        >
          {message}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!isPositive && (
            <button
              aria-label="Je veux en parler"
              onClick={onTalk}
              style={{
                padding:       '6px 14px',
                borderRadius:  10,
                border:        'none',
                background:    `linear-gradient(135deg, #7C3AED, #4F46E5)`,
                color:         '#fff',
                fontFamily:    'Syne, sans-serif',
                fontWeight:    700,
                fontSize:      12,
                cursor:        'pointer',
                letterSpacing: '0.04em',
              }}
            >
              Je veux en parler
            </button>
          )}
          <button
            aria-label={isPositive ? 'Merci' : 'Ça va, merci'}
            onClick={onDismiss}
            style={{
              padding:    '6px 12px',
              borderRadius: 10,
              border:     'none',
              background: 'transparent',
              color:      '#6B7280',
              fontFamily: 'DM Sans, sans-serif',
              fontSize:   12,
              cursor:     'pointer',
            }}
          >
            {isPositive ? 'Merci ✨' : 'Ça va, merci'}
          </button>
        </div>
      </div>
    </div>
  )
}
