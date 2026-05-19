import { useState } from 'react'
import { BreathingExercise } from './BreathingExercise'
import { BodyScan } from './BodyScan'
import { DechargeInput } from './DechargeInput'

type Emotion = 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur' | 'neutre'

const QUESTIONS: Record<Emotion, string[]> = {
  colere: [
    "Qu'est-ce qui a déclenché cette colère aujourd'hui ?",
    "Comment elle se manifeste dans ton corps en ce moment ?",
    "Qu'est-ce qui t'aurait aidé dans cette situation ?",
  ],
  tristesse: [
    "Qu'est-ce qui pèse sur toi ce soir ?",
    "Est-ce que tu sais d'où vient cette tristesse ?",
    "De quoi as-tu besoin là, maintenant ?",
  ],
  joie: [
    "Qu'est-ce qui t'a rendu heureux aujourd'hui ?",
    "Avec qui as-tu partagé ce moment ?",
    "Comment tu gardes cette énergie pour demain ?",
  ],
  stress: [
    "Qu'est-ce qui occupe le plus ton esprit ce soir ?",
    "Est-ce quelque chose sur lequel tu as du contrôle ?",
    "Qu'est-ce que tu peux lâcher pour cette nuit ?",
  ],
  peur: [
    "Qu'est-ce qui te fait peur en ce moment ?",
    "Cette peur est-elle reliée à quelque chose de précis ?",
    "Quelle est la première petite action rassurante que tu pourrais faire ?",
  ],
  neutre: [],
}

type Exercise = 'breathing' | 'bodyscan' | 'writing' | 'joy_capture' | null

const EXERCISE_FOR: Record<Emotion, Exercise> = {
  colere:    'breathing',
  tristesse: 'writing',
  stress:    'bodyscan',
  peur:      'writing',
  joie:      'joy_capture',
  neutre:    null,
}

interface Props {
  emotion: Emotion
  accent: string
  onJoyNote?: (note: string) => void
  onComplete: () => void
}

export function EmotionalFlow({ emotion, accent, onJoyNote, onComplete }: Props) {
  const questions = QUESTIONS[emotion] ?? []
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''))
  const [exercise, setExercise] = useState<Exercise | 'pending'>(
    questions.length === 0 ? 'pending' : null,
  )
  const [joyText, setJoyText] = useState('')

  const atExercise = exercise !== null
  const allQDone = qIdx >= questions.length

  const next = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1)
    } else {
      setExercise(EXERCISE_FOR[emotion])
    }
  }

  const skip = () => {
    if (allQDone || exercise === 'pending') {
      onComplete()
    } else {
      next()
    }
  }

  if (exercise === 'breathing') return <BreathingExercise accent={accent} onDone={onComplete} />
  if (exercise === 'bodyscan') return <BodyScan accent={accent} onDone={onComplete} />

  if (exercise === 'writing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <DechargeInput
          value={answers[qIdx] ?? ''}
          onChange={v => setAnswers(a => { const n = [...a]; n[qIdx] = v; return n })}
          accent={accent}
        />
        <button onClick={onComplete} style={btnStyle(accent)}>Terminer →</button>
        <button onClick={onComplete} style={skipStyle}>Passer</button>
      </div>
    )
  }

  if (exercise === 'joy_capture') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>
          ☀️ Capture ce beau moment dans tes petits bonheurs
        </div>
        <input
          type="text"
          value={joyText}
          onChange={e => setJoyText(e.target.value.slice(0, 300))}
          placeholder="Ce moment, cette sensation…"
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid rgba(255,255,255,0.12)`,
            borderRadius: 12,
            padding: '11px 14px',
            color: 'inherit',
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={() => { onJoyNote?.(joyText); onComplete() }}
          style={btnStyle(accent)}
        >
          Capturer ✦
        </button>
        <button onClick={onComplete} style={skipStyle}>Passer</button>
      </div>
    )
  }

  // Question flow
  const q = questions[qIdx]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 11, opacity: 0.4 }}>
        Question {qIdx + 1} / {questions.length}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>{q}</div>
      <textarea
        autoFocus
        value={answers[qIdx]}
        onChange={e => setAnswers(a => { const n = [...a]; n[qIdx] = e.target.value; return n })}
        rows={4}
        placeholder="Écris ce qui vient…"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid rgba(255,255,255,0.12)`,
          borderRadius: 14,
          padding: '12px 14px',
          color: 'inherit',
          fontSize: 14,
          fontFamily: 'Georgia, serif',
          lineHeight: 1.7,
          resize: 'none',
          outline: 'none',
        }}
      />
      <button onClick={next} style={btnStyle(accent)}>
        {qIdx < questions.length - 1 ? 'Suivant →' : 'Continuer →'}
      </button>
      <button onClick={skip} style={skipStyle}>Passer</button>
    </div>
  )
}

const btnStyle = (accent: string): React.CSSProperties => ({
  padding: '14px',
  borderRadius: 16,
  border: 'none',
  background: accent,
  color: '#fff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
  fontFamily: 'inherit',
})

const skipStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: 12,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  opacity: 0.4,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
