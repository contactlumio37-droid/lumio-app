import { useState } from 'react'
import type { MoodScore, EmotionType } from '../../services/checkoutService'

// ─── Données ───────────────────────────────────────────────────────────────────

const MOODS: { value: MoodScore; emoji: string; label: Record<string, string> }[] = [
  { value: 1, emoji: '😣', label: { fr: 'Mauvais',  en: 'Bad',     es: 'Mal',     de: 'Schlecht', it: 'Male',    pt: 'Mal' } },
  { value: 2, emoji: '😟', label: { fr: 'Difficile',en: 'Hard',    es: 'Difícil', de: 'Schwer',   it: 'Difficile',pt:'Difícil' } },
  { value: 3, emoji: '😐', label: { fr: 'Neutre',   en: 'Neutral', es: 'Neutro',  de: 'Neutral',  it: 'Neutro',  pt: 'Neutro' } },
  { value: 4, emoji: '🙂', label: { fr: 'Bien',     en: 'Good',    es: 'Bien',    de: 'Gut',      it: 'Bene',    pt: 'Bem' } },
  { value: 5, emoji: '😄', label: { fr: 'Super !',  en: 'Great!',  es: '¡Genial!',de: 'Super!',   it: 'Ottimo!', pt: 'Ótimo!' } },
]

const EMOTIONS: {
  value: EmotionType
  emoji: string
  color: string
  label: Record<string, string>
}[] = [
  { value: 'neutre',    emoji: '😶', color: '#6B7280', label: { fr: 'Neutre',    en: 'Neutral',  es: 'Neutro',   de: 'Neutral',    it: 'Neutro',    pt: 'Neutro'   } },
  { value: 'joie',      emoji: '✨', color: '#F59E0B', label: { fr: 'Joie',      en: 'Joy',      es: 'Alegría',  de: 'Freude',     it: 'Gioia',     pt: 'Alegria'  } },
  { value: 'stress',    emoji: '⚡', color: '#7C3AED', label: { fr: 'Stress',    en: 'Stress',   es: 'Estrés',   de: 'Stress',     it: 'Stress',    pt: 'Stress'   } },
  { value: 'tristesse', emoji: '💧', color: '#4F46E5', label: { fr: 'Tristesse', en: 'Sadness',  es: 'Tristeza', de: 'Traurigkeit',it: 'Tristezza', pt: 'Tristeza' } },
  { value: 'colere',    emoji: '🔥', color: '#F43F5E', label: { fr: 'Colère',    en: 'Anger',    es: 'Enfado',   de: 'Ärger',      it: 'Rabbia',    pt: 'Raiva'    } },
  { value: 'peur',      emoji: '🌀', color: '#C4B5FD', label: { fr: 'Peur',      en: 'Fear',     es: 'Miedo',    de: 'Angst',      it: 'Paura',     pt: 'Medo'     } },
]

interface Props {
  lang:     string
  onSelect: (mood: MoodScore, emotion: EmotionType, intensity: MoodScore) => void
}

export function MoodPicker({ lang, onSelect }: Props) {
  const [mood,      setMood]      = useState<MoodScore | null>(null)
  const [emotion,   setEmotion]   = useState<EmotionType>('neutre')
  const [intensity, setIntensity] = useState<MoodScore>(3)

  const l = lang as keyof (typeof MOODS)[0]['label']

  const selectedEmotion = EMOTIONS.find(e => e.value === emotion)
  const trackColor = selectedEmotion?.color ?? '#7C3AED'

  const handleConfirm = () => {
    if (!mood) return
    onSelect(mood, emotion, emotion === 'neutre' ? 1 : intensity)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Humeur ─────────────────────────────────────────────────── */}
      <div>
        <div
          style={{
            fontFamily:    'Syne, sans-serif',
            fontWeight:    700,
            fontSize:      13,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color:         '#6B7280',
            marginBottom:  14,
          }}
        >
          Comment tu te sens ce soir ?
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {MOODS.map(m => {
            const active = mood === m.value
            return (
              <button
                key={m.value}
                aria-label={m.label[l] ?? m.label.fr}
                onClick={() => setMood(m.value)}
                style={{
                  flex:           1,
                  height:         52,
                  borderRadius:   14,
                  border:         active
                    ? '1px solid rgba(124,58,237,0.5)'
                    : '1px solid rgba(255,255,255,0.07)',
                  background:     active
                    ? 'rgba(124,58,237,0.2)'
                    : 'rgba(255,255,255,0.03)',
                  cursor:         'pointer',
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            4,
                  transform:      active ? 'scale(1.08)' : 'scale(1)',
                  boxShadow:      active ? '0 0 20px rgba(124,58,237,0.35)' : 'none',
                  transition:     'all 200ms cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <span style={{ fontSize: active ? 28 : 22, lineHeight: 1, transition: 'font-size 200ms' }}>
                  {m.emoji}
                </span>
                <span
                  style={{
                    fontFamily:    'Syne, sans-serif',
                    fontWeight:    700,
                    fontSize:      8,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color:         active ? '#C4B5FD' : '#6B7280',
                    lineHeight:    1,
                  }}
                >
                  {m.label[l] ?? m.label.fr}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Émotion (grille 2×3) — apparaît après sélection humeur ─── */}
      {mood !== null && (
        <div className="lumio-fade-up">
          <div
            style={{
              fontFamily:    'Syne, sans-serif',
              fontWeight:    700,
              fontSize:      13,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         '#6B7280',
              marginBottom:  12,
            }}
          >
            Quelle émotion domine ?
          </div>

          <div
            style={{
              display:             'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:                 8,
            }}
          >
            {EMOTIONS.map(e => {
              const active = emotion === e.value
              return (
                <button
                  key={e.value}
                  aria-label={e.label[l] ?? e.label.fr}
                  onClick={() => setEmotion(e.value)}
                  style={{
                    padding:        '10px 12px',
                    borderRadius:   12,
                    border:         active
                      ? `1px solid ${e.color}55`
                      : '1px solid rgba(255,255,255,0.07)',
                    background:     active
                      ? `${e.color}22`
                      : 'rgba(255,255,255,0.03)',
                    color:          active ? e.color : '#9CA3AF',
                    cursor:         'pointer',
                    display:        'flex',
                    alignItems:     'center',
                    gap:            8,
                    fontFamily:     'DM Sans, sans-serif',
                    fontSize:       13,
                    fontWeight:     active ? 700 : 400,
                    transition:     'all 200ms cubic-bezier(0.4,0,0.2,1)',
                    textAlign:      'left',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{e.emoji}</span>
                  <span>{e.label[l] ?? e.label.fr}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Intensité — apparaît si émotion non neutre ─────────────── */}
      {mood !== null && emotion !== 'neutre' && (
        <div className="lumio-fade-up">
          <div
            style={{
              fontFamily:    'Syne, sans-serif',
              fontWeight:    700,
              fontSize:      13,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         '#6B7280',
              marginBottom:  14,
            }}
          >
            Intensité
          </div>

          <input
            type="range"
            min={1}
            max={5}
            value={intensity}
            aria-label="Intensité de l'émotion"
            onChange={e => setIntensity(Number(e.target.value) as MoodScore)}
            className="lumio-range"
            style={{
              background: `linear-gradient(to right, ${trackColor} 0%, ${trackColor} ${(intensity - 1) * 25}%, rgba(255,255,255,0.12) ${(intensity - 1) * 25}%, rgba(255,255,255,0.12) 100%)`,
            }}
          />

          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              marginTop:      8,
              fontFamily:     'DM Sans, sans-serif',
              fontSize:       11,
              color:          '#6B7280',
            }}
          >
            <span>Légère</span>
            <span>Intense</span>
          </div>
        </div>
      )}

      {/* ── Confirmer ──────────────────────────────────────────────── */}
      {mood !== null && (
        <button
          aria-label="Valider et continuer"
          onClick={handleConfirm}
          style={{
            padding:       '14px 24px',
            borderRadius:  16,
            border:        'none',
            background:    'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color:         '#fff',
            fontFamily:    'Syne, sans-serif',
            fontWeight:    700,
            fontSize:      14,
            letterSpacing: '0.05em',
            boxShadow:     '0 8px 24px rgba(124,58,237,0.4)',
            cursor:        'pointer',
          }}
        >
          Continuer →
        </button>
      )}
    </div>
  )
}
