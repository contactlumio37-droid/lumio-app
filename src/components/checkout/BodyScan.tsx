import { useEffect, useState } from 'react'

const STEPS = [
  { zone: 'Tête', emoji: '🧠', cue: 'Détends le front, les mâchoires, les yeux...' },
  { zone: 'Épaules', emoji: '💆', cue: 'Laisse tomber les épaules, relâche la nuque...' },
  { zone: 'Thorax', emoji: '🫀', cue: 'Sens ta respiration, ton cœur qui bat doucement...' },
  { zone: 'Ventre', emoji: '🌊', cue: 'Relâche les abdominaux, respire dans le ventre...' },
  { zone: 'Jambes', emoji: '🦵', cue: 'Sens le poids de tes jambes, elles se détendent...' },
]

const STEP_DURATION = 20 // seconds

interface Props {
  accent: string
  lang?:  string
  onDone: () => void
}

const BS_LABELS: Record<string, { cont: string; finish: string }> = {
  fr: { cont: 'Continuer →', finish: 'Terminer' },
  en: { cont: 'Continue →',  finish: 'Done' },
  es: { cont: 'Continuar →', finish: 'Terminar' },
  de: { cont: 'Weiter →',    finish: 'Beenden' },
  it: { cont: 'Continua →',  finish: 'Termina' },
  pt: { cont: 'Continuar →', finish: 'Terminar' },
}

export function BodyScan({ accent, lang = 'fr', onDone }: Props) {
  const bs = BS_LABELS[lang] ?? BS_LABELS.en
  const [stepIdx, setStepIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (stepIdx >= STEPS.length) return
    const t = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= STEP_DURATION) {
          setStepIdx(i => i + 1)
          return 0
        }
        return e + 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [stepIdx])

  const done = stepIdx >= STEPS.length
  const step = done ? null : STEPS[stepIdx]
  const pct = done ? 1 : elapsed / STEP_DURATION

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ fontSize: 14, opacity: 0.6 }}>Scan corporel guidé</div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i < stepIdx ? accent : i === stepIdx ? accent + 'aa' : 'rgba(255,255,255,0.15)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {done ? (
        <div style={{ textAlign: 'center', fontSize: 32, marginBottom: 8 }}>✨</div>
      ) : (
        <>
          <div style={{ fontSize: 56 }}>{step?.emoji}</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{step?.zone}</div>
          <div style={{ fontSize: 14, opacity: 0.7, textAlign: 'center', lineHeight: 1.6 }}>
            {step?.cue}
          </div>
          <div
            style={{
              height: 4,
              width: '100%',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct * 100}%`,
                background: accent,
                transition: 'width 1s linear',
                borderRadius: 4,
              }}
            />
          </div>
        </>
      )}

      <button
        onClick={onDone}
        style={{
          padding: '12px 28px',
          borderRadius: 16,
          border: `2px solid ${accent}`,
          background: done ? accent : 'transparent',
          color: done ? '#fff' : accent,
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {done ? bs.cont : bs.finish}
      </button>
    </div>
  )
}
