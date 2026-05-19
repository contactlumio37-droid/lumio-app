import { useEffect, useState } from 'react'
import { getStreak } from '../../services/checkoutService'

type Animal = 'otter' | 'hedgehog' | 'fox' | 'koala' | 'axolotl'

const ANIMAL_EMOJI: Record<Animal, string> = {
  otter: '🦦', hedgehog: '🦔', fox: '🦊', koala: '🐨', axolotl: '🦎',
}

const MESSAGES: Record<1 | 2 | 3 | 4 | 5, string> = {
  5: 'Quelle belle soirée. Tu mérites une bonne nuit 🌟',
  4: 'Une bonne journée derrière toi. Repose-toi bien 🌙',
  3: "Journée neutre — et c'est ok. Bonne nuit 😌",
  2: 'Ce soir a été dur. Demain est une nouvelle page 🌱',
  1: "Courage. La nuit va t'aider. Tu n'es pas seul·e 💙",
}

// Particules fixes pour éviter les recalculs
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id:       i,
  left:     `${8 + i * 9}%`,
  delay:    `${(i * 0.8) % 6}s`,
  duration: `${6 + (i * 1.3) % 4}s`,
  size:     3 + (i % 3),
}))

interface Props {
  moodEvening?:    1 | 2 | 3 | 4 | 5
  companionAnimal?: Animal | null
  userId:          string
  onStay:          () => void
}

export function GoodNightScreen({ moodEvening = 3, companionAnimal, userId, onStay }: Props) {
  const [streak,      setStreak]      = useState<number | null>(null)
  const [streakReady, setStreakReady] = useState(false)

  const animal    = companionAnimal ?? 'otter'
  const emoji     = ANIMAL_EMOJI[animal]

  useEffect(() => {
    getStreak(userId)
      .then(n => { setStreak(n); setStreakReady(true) })
      .catch(() => setStreakReady(true))
  }, [userId])

  const handleClose = () => {
    try {
      // Capacitor App.minimizeApp() — no-op on web
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { App } = (window as any).Capacitor?.Plugins ?? {}
      App?.minimizeApp?.()
    } catch {
      // web — rien à faire
    }
    onStay()
  }

  return (
    <div
      style={{
        position:    'relative',
        minHeight:   '100%',
        background:  '#06040f',
        overflow:    'hidden',
        display:     'flex',
        flexDirection: 'column',
        alignItems:  'center',
        padding:     '40px 20px 32px',
        textAlign:   'center',
      }}
    >
      {/* ── Orbe radial centré ─────────────────────────────────────── */}
      <div
        style={{
          position:     'absolute',
          top:          '20%',
          left:         '50%',
          transform:    'translateX(-50%)',
          width:        300,
          height:       300,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Particules violettes montantes ─────────────────────────── */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position:     'absolute',
            bottom:       0,
            left:         p.left,
            width:        p.size,
            height:       p.size,
            borderRadius: '50%',
            background:   'rgba(124,58,237,0.7)',
            animation:    `lumio-particle-rise ${p.duration} ${p.delay} linear infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Compagnon ──────────────────────────────────────────────── */}
      <div
        className="lumio-float"
        style={{
          width:        100,
          height:       100,
          borderRadius: 28,
          background:   'rgba(124,58,237,0.12)',
          border:       '1px solid rgba(124,58,237,0.25)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          fontSize:     52,
          marginBottom: 24,
          position:     'relative',
          zIndex:       1,
        }}
      >
        <div className="lumio-glow-pulse" style={{ position: 'absolute', inset: 0, borderRadius: 28 }} />
        {emoji}
      </div>

      {/* ── Bonne nuit ─────────────────────────────────────────────── */}
      <div
        style={{
          fontFamily:    'Syne, sans-serif',
          fontWeight:    900,
          fontSize:      36,
          letterSpacing: '-0.02em',
          background:    'linear-gradient(135deg, #ffffff, #C4B5FD)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
          marginBottom:  12,
          position:      'relative',
          zIndex:        1,
        }}
      >
        Bonne nuit
      </div>

      {/* ── Message selon humeur ───────────────────────────────────── */}
      <div
        style={{
          fontFamily:  'DM Sans, sans-serif',
          fontWeight:  300,
          fontStyle:   'italic',
          fontSize:    15,
          color:       '#9CA3AF',
          lineHeight:  1.6,
          maxWidth:    280,
          marginBottom: 24,
          position:    'relative',
          zIndex:      1,
        }}
      >
        {MESSAGES[moodEvening]}
      </div>

      {/* ── Streak badge ───────────────────────────────────────────── */}
      {streakReady && streak !== null && streak > 0 && (
        <div
          className="lumio-fade-up"
          style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:           6,
            padding:       '6px 16px',
            borderRadius:  50,
            background:    'rgba(245,158,11,0.12)',
            border:        '1px solid rgba(245,158,11,0.25)',
            marginBottom:  28,
            position:      'relative',
            zIndex:        1,
            animationDelay: '500ms',
          }}
        >
          <span
            className="lumio-dot-pulse"
            style={{ fontSize: 14 }}
          >
            🔥
          </span>
          <span
            style={{
              fontFamily:    'Syne, sans-serif',
              fontWeight:    700,
              fontSize:      13,
              color:         '#F59E0B',
              letterSpacing: '0.02em',
            }}
          >
            {streak} jour{streak > 1 ? 's' : ''} de suite
          </span>
        </div>
      )}

      {/* ── Boutons ────────────────────────────────────────────────── */}
      <div
        style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           12,
          width:         '100%',
          maxWidth:      320,
          position:      'relative',
          zIndex:        1,
        }}
      >
        <button
          aria-label="Fermer l'app"
          onClick={handleClose}
          style={{
            padding:      '14px 24px',
            borderRadius: 16,
            border:       'none',
            background:   'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color:        '#fff',
            fontFamily:   'Syne, sans-serif',
            fontWeight:   700,
            fontSize:     14,
            letterSpacing: '0.05em',
            boxShadow:    '0 8px 24px rgba(124,58,237,0.4)',
            cursor:       'pointer',
          }}
        >
          Fermer l'app
        </button>

        <button
          aria-label="Rester dans l'app"
          onClick={onStay}
          style={{
            padding:      '12px',
            borderRadius: 14,
            border:       '1px solid rgba(255,255,255,0.1)',
            background:   'rgba(124,58,237,0.08)',
            color:        '#C4B5FD',
            fontFamily:   'DM Sans, sans-serif',
            fontSize:     14,
            cursor:       'pointer',
          }}
        >
          Rester dans l'app
        </button>
      </div>
    </div>
  )
}
