import { useEffect, useState, useCallback } from 'react'

const TOTAL_SECONDS = 180 // 3 min

interface Props {
  accent: string
  onDone: () => void
}

export function BreathingExercise({ accent, onDone }: Props) {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS)
  const [phase, setPhase] = useState<'in' | 'out'>('in')

  useEffect(() => {
    if (remaining <= 0) return
    const t = setInterval(() => setRemaining(r => r - 1), 1000)
    return () => clearInterval(t)
  }, [remaining])

  // 4s in / 6s out cycle
  useEffect(() => {
    const elapsed = TOTAL_SECONDS - remaining
    setPhase(elapsed % 10 < 4 ? 'in' : 'out')
  }, [remaining])

  const pct = remaining / TOTAL_SECONDS
  const r = 60
  const circ = 2 * Math.PI * r
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0')
  const secs = String(remaining % 60).padStart(2, '0')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ fontSize: 14, opacity: 0.6 }}>Respiration guidée</div>

      <svg width={160} height={160}>
        <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
        <circle
          cx={80}
          cy={80}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
        <text x={80} y={76} textAnchor="middle" fill="white" fontSize={22} fontWeight={800}>
          {mins}:{secs}
        </text>
        <text x={80} y={98} textAnchor="middle" fill="white" fontSize={13} opacity={0.6}>
          {phase === 'in' ? 'Inspire...' : 'Expire...'}
        </text>
      </svg>

      <div style={{ fontSize: 28, minHeight: 40 }}>
        {phase === 'in' ? '🫁' : '💨'}
      </div>

      <button
        onClick={onDone}
        style={{
          padding: '12px 28px',
          borderRadius: 16,
          border: `2px solid ${accent}`,
          background: 'transparent',
          color: accent,
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Terminer
      </button>
    </div>
  )
}
