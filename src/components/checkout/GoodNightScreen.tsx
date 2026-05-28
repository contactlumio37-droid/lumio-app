import { useEffect, useState } from 'react'
import { getStreak } from '../../services/checkoutService'

type Animal = 'otter' | 'hedgehog' | 'fox' | 'koala' | 'axolotl'
type Lang   = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const ANIMAL_EMOJI: Record<Animal, string> = {
  otter: '🦦', hedgehog: '🦔', fox: '🦊', koala: '🐨', axolotl: '🦎',
}

const GN_T: Record<Lang, {
  title: string
  messages: Record<1 | 2 | 3 | 4 | 5, string>
  streakLabel: (n: number) => string
  closeApp: string
  stayInApp: string
}> = {
  fr: {
    title: 'Bonne nuit',
    messages: {
      5: 'Quelle belle soirée. Tu mérites une bonne nuit 🌟',
      4: 'Une bonne journée derrière toi. Repose-toi bien 🌙',
      3: "Journée neutre — et c'est ok. Bonne nuit 😌",
      2: 'Ce soir a été dur. Demain est une nouvelle page 🌱',
      1: "Courage. La nuit va t'aider. Tu n'es pas seul·e 💙",
    },
    streakLabel: n => `${n} jour${n > 1 ? 's' : ''} de suite`,
    closeApp:   'Fermer l\'app',
    stayInApp:  'Rester dans l\'app',
  },
  en: {
    title: 'Good night',
    messages: {
      5: "What a beautiful evening. You deserve a good night's sleep 🌟",
      4: 'A good day behind you. Rest well 🌙',
      3: "Neutral day — and that's okay. Good night 😌",
      2: 'Tonight was tough. Tomorrow is a new page 🌱',
      1: 'Courage. The night will help you. You are not alone 💙',
    },
    streakLabel: n => `${n} day${n > 1 ? 's' : ''} in a row`,
    closeApp:   'Close app',
    stayInApp:  'Stay in app',
  },
  es: {
    title: 'Buenas noches',
    messages: {
      5: 'Qué bonita velada. Te mereces una buena noche 🌟',
      4: 'Un buen día detrás de ti. Descansa bien 🌙',
      3: 'Día neutro — y está bien. Buenas noches 😌',
      2: 'Esta noche fue dura. Mañana es una página nueva 🌱',
      1: 'Ánimo. La noche te ayudará. No estás solo·a 💙',
    },
    streakLabel: n => `${n} día${n > 1 ? 's' : ''} seguidos`,
    closeApp:   'Cerrar app',
    stayInApp:  'Quedarse en la app',
  },
  de: {
    title: 'Gute Nacht',
    messages: {
      5: 'Was für ein schöner Abend. Du hast eine gute Nacht verdient 🌟',
      4: 'Ein guter Tag liegt hinter dir. Ruh dich gut aus 🌙',
      3: 'Neutraler Tag — und das ist okay. Gute Nacht 😌',
      2: 'Dieser Abend war schwer. Morgen ist eine neue Seite 🌱',
      1: 'Mut. Die Nacht wird dir helfen. Du bist nicht allein 💙',
    },
    streakLabel: n => `${n} Tag${n > 1 ? 'e' : ''} in Folge`,
    closeApp:   'App schließen',
    stayInApp:  'In der App bleiben',
  },
  it: {
    title: 'Buona notte',
    messages: {
      5: 'Che bella serata. Meriti una buona notte 🌟',
      4: 'Una buona giornata alle spalle. Riposati bene 🌙',
      3: 'Giornata neutra — e va bene così. Buona notte 😌',
      2: 'Stasera è stato difficile. Domani è una nuova pagina 🌱',
      1: 'Coraggio. La notte ti aiuterà. Non sei solo·a 💙',
    },
    streakLabel: n => `${n} giorno${n > 1 ? 'i' : ''} di fila`,
    closeApp:   'Chiudi app',
    stayInApp:  "Resta nell'app",
  },
  pt: {
    title: 'Boa noite',
    messages: {
      5: 'Que bela noite. Mereces um bom descanso 🌟',
      4: 'Um bom dia ficou para trás. Descansa bem 🌙',
      3: 'Dia neutro — e tudo bem. Boa noite 😌',
      2: 'Esta noite foi difícil. Amanhã é uma nova página 🌱',
      1: 'Coragem. A noite vai ajudar-te. Não estás sozinho·a 💙',
    },
    streakLabel: n => `${n} dia${n > 1 ? 's' : ''} seguidos`,
    closeApp:   'Fechar app',
    stayInApp:  'Ficar na app',
  },
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
  lang?:           string
  onStay:          () => void
}

export function GoodNightScreen({ moodEvening = 3, companionAnimal, userId, lang = 'fr', onStay }: Props) {
  const [streak,      setStreak]      = useState<number | null>(null)
  const [streakReady, setStreakReady] = useState(false)

  const l  = (lang as Lang) in GN_T ? (lang as Lang) : 'en'
  const t  = GN_T[l]
  const animal = companionAnimal ?? 'otter'
  const emoji  = ANIMAL_EMOJI[animal]

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

      {/* ── Titre ──────────────────────────────────────────────────── */}
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
        {t.title}
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
        {t.messages[moodEvening]}
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
          <span className="lumio-dot-pulse" style={{ fontSize: 14 }}>🔥</span>
          <span
            style={{
              fontFamily:    'Syne, sans-serif',
              fontWeight:    700,
              fontSize:      13,
              color:         '#F59E0B',
              letterSpacing: '0.02em',
            }}
          >
            {t.streakLabel(streak)}
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
          aria-label={t.closeApp}
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
          {t.closeApp}
        </button>

        <button
          aria-label={t.stayInApp}
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
          {t.stayInApp}
        </button>
      </div>
    </div>
  )
}
