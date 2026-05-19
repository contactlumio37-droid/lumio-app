import { useState } from 'react'
import type { CheckoutData } from '../../services/checkoutService'

type Emotion = CheckoutData['emotion_primary']

const MOODS: { value: 1 | 2 | 3 | 4 | 5; emoji: string }[] = [
  { value: 1, emoji: '😣' },
  { value: 2, emoji: '😟' },
  { value: 3, emoji: '😐' },
  { value: 4, emoji: '🙂' },
  { value: 5, emoji: '😄' },
]

const EMOTIONS: { value: Emotion; label: Record<string, string> }[] = [
  { value: 'neutre',    label: { fr: 'Neutre',    en: 'Neutral',  es: 'Neutro',   de: 'Neutral',   it: 'Neutro',    pt: 'Neutro'   } },
  { value: 'joie',      label: { fr: 'Joie',      en: 'Joy',      es: 'Alegría',  de: 'Freude',    it: 'Gioia',     pt: 'Alegria'  } },
  { value: 'stress',    label: { fr: 'Stress',    en: 'Stress',   es: 'Estrés',   de: 'Stress',    it: 'Stress',    pt: 'Stress'   } },
  { value: 'tristesse', label: { fr: 'Tristesse', en: 'Sadness',  es: 'Tristeza', de: 'Traurigkeit', it: 'Tristezza', pt: 'Tristeza' } },
  { value: 'colere',    label: { fr: 'Colère',    en: 'Anger',    es: 'Enfado',   de: 'Ärger',     it: 'Rabbia',    pt: 'Raiva'    } },
  { value: 'peur',      label: { fr: 'Peur',      en: 'Fear',     es: 'Miedo',    de: 'Angst',     it: 'Paura',     pt: 'Medo'     } },
]

interface Props {
  accent: string
  lang: string
  onSelect: (mood: 1 | 2 | 3 | 4 | 5, emotion: Emotion, intensity: 1 | 2 | 3 | 4 | 5) => void
}

export function MoodPicker({ accent, lang, onSelect }: Props) {
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [emotion, setEmotion] = useState<Emotion>('neutre')
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3)

  const l = lang as keyof typeof EMOTIONS[0]['label']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Mood scale */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, opacity: 0.7 }}>
          Comment tu te sens ce soir ?
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              style={{
                flex: 1,
                fontSize: 32,
                padding: '12px 0',
                borderRadius: 16,
                border: `2px solid ${mood === m.value ? accent : 'transparent'}`,
                background: mood === m.value ? accent + '22' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                transform: mood === m.value ? 'scale(1.12)' : 'scale(1)',
              }}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Emotion */}
      {mood !== null && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, opacity: 0.7 }}>
            Quelle émotion domine ?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOTIONS.map(e => (
              <button
                key={e.value}
                onClick={() => setEmotion(e.value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  border: `2px solid ${emotion === e.value ? accent : 'transparent'}`,
                  background: emotion === e.value ? accent + '22' : 'rgba(255,255,255,0.06)',
                  color: emotion === e.value ? accent : 'inherit',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {e.label[l] ?? e.label.fr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Intensity */}
      {mood !== null && emotion !== 'neutre' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, opacity: 0.7 }}>
            Intensité : {intensity} / 5
          </div>
          <input
            type="range"
            min={1}
            max={5}
            value={intensity}
            onChange={e => setIntensity(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
            style={{ width: '100%', accentColor: accent }}
          />
        </div>
      )}

      {/* Confirm */}
      {mood !== null && (
        <button
          onClick={() => onSelect(mood, emotion, emotion === 'neutre' ? 1 : intensity)}
          style={{
            padding: '14px',
            borderRadius: 16,
            border: 'none',
            background: accent,
            color: '#fff',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Continuer →
        </button>
      )}
    </div>
  )
}
