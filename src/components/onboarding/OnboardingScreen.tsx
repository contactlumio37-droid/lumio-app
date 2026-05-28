import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useOnboarding } from '../../hooks/useOnboarding'

interface Props {
  userId: string
  onComplete: () => void
}

type SupportedLang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const SUPPORTED: SupportedLang[] = ['fr', 'en', 'es', 'de', 'it', 'pt']

function detectLang(): SupportedLang {
  const code = navigator.language.slice(0, 2) as SupportedLang
  return SUPPORTED.includes(code) ? code : 'en'
}

const T: Record<SupportedLang, {
  step1Title: string; step1Sub: string; step1Btn: string
  step2Title: string; feat1: string; feat2: string; feat3: string; step2Btn: string
  step3Title: string; step3Sub: string; step3Btn: string
}> = {
  fr: {
    step1Title: 'Bienvenue sur Lumio 🌙', step1Sub: 'Ton compagnon de bien-être mental au quotidien', step1Btn: 'Découvrir',
    step2Title: 'Ce que Lumio fait pour toi', feat1: '📝 Suis ton humeur et tes habitudes', feat2: '💭 Décharge tes pensées en journal libre', feat3: '🔥 Garde la dynamique avec tes séries', step2Btn: 'Continuer',
    step3Title: 'Tout est prêt !', step3Sub: 'Prends soin de toi, un jour à la fois.', step3Btn: 'Commencer →',
  },
  en: {
    step1Title: 'Welcome to Lumio 🌙', step1Sub: 'Your daily mental wellness companion', step1Btn: 'Discover',
    step2Title: 'What Lumio does for you', feat1: '📝 Track your mood and habits', feat2: '💭 Journal your thoughts freely', feat3: '🔥 Keep your streak going', step2Btn: 'Continue',
    step3Title: "You're all set!", step3Sub: 'Take care of yourself, one day at a time.', step3Btn: 'Get started →',
  },
  es: {
    step1Title: 'Bienvenido a Lumio 🌙', step1Sub: 'Tu compañero diario de bienestar mental', step1Btn: 'Descubrir',
    step2Title: 'Lo que Lumio hace por ti', feat1: '📝 Registra tu estado de ánimo y hábitos', feat2: '💭 Escribe libremente en tu diario', feat3: '🔥 Mantén tu racha', step2Btn: 'Continuar',
    step3Title: '¡Todo listo!', step3Sub: 'Cuídate, un día a la vez.', step3Btn: 'Comenzar →',
  },
  de: {
    step1Title: 'Willkommen bei Lumio 🌙', step1Sub: 'Dein täglicher Begleiter für mentales Wohlbefinden', step1Btn: 'Entdecken',
    step2Title: 'Was Lumio für dich tut', feat1: '📝 Verfolge deine Stimmung und Gewohnheiten', feat2: '💭 Schreibe deine Gedanken frei auf', feat3: '🔥 Halte deine Serie am Leben', step2Btn: 'Weiter',
    step3Title: 'Alles bereit!', step3Sub: 'Pass auf dich auf, einen Tag nach dem anderen.', step3Btn: 'Loslegen →',
  },
  it: {
    step1Title: 'Benvenuto su Lumio 🌙', step1Sub: 'Il tuo compagno quotidiano per il benessere mentale', step1Btn: 'Scoprire',
    step2Title: 'Cosa fa Lumio per te', feat1: '📝 Traccia il tuo umore e le tue abitudini', feat2: '💭 Scrivi liberamente nel diario', feat3: '🔥 Mantieni la tua serie', step2Btn: 'Continua',
    step3Title: 'Tutto pronto!', step3Sub: 'Prenditi cura di te, un giorno alla volta.', step3Btn: 'Inizia →',
  },
  pt: {
    step1Title: 'Bem-vindo ao Lumio 🌙', step1Sub: 'O teu companheiro diário de bem-estar mental', step1Btn: 'Descobrir',
    step2Title: 'O que o Lumio faz por ti', feat1: '📝 Acompanha o teu humor e hábitos', feat2: '💭 Escreve os teus pensamentos livremente', feat3: '🔥 Mantém a tua sequência', step2Btn: 'Continuar',
    step3Title: 'Tudo pronto!', step3Sub: 'Cuida de ti, um dia de cada vez.', step3Btn: 'Começar →',
  },
}

const BTN: React.CSSProperties = {
  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
}

function Dots({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: i === step ? 20 : 8, height: 8, borderRadius: 4,
          background: i === step ? '#C4B5FD' : 'rgba(124,158,255,0.3)',
          transition: 'width 0.3s ease',
        }} />
      ))}
    </div>
  )
}

function Screen({ step, children }: { step: number; children: ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0f0f23',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 24px', fontFamily: 'sans-serif',
    }}>
      <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
        {children}
        <Dots step={step} />
      </div>
    </div>
  )
}

export function OnboardingScreen({ userId, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const t = T[detectLang()]
  const { completing, complete } = useOnboarding(userId)

  const handleComplete = useCallback(async () => {
    await complete()
    onComplete()
  }, [complete, onComplete])

  if (step === 0) {
    return (
      <Screen step={0}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🌙</div>
        <h1 style={{ color: '#f9fafb', fontSize: 26, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
          {t.step1Title}
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 16, lineHeight: 1.6, margin: '0 0 36px' }}>
          {t.step1Sub}
        </p>
        <button onClick={() => setStep(1)} style={BTN}>{t.step1Btn}</button>
      </Screen>
    )
  }

  if (step === 1) {
    return (
      <Screen step={1}>
        <h2 style={{ color: '#f9fafb', fontSize: 22, fontWeight: 800, margin: '0 0 24px', lineHeight: 1.2 }}>
          {t.step2Title}
        </h2>
        {[t.feat1, t.feat2, t.feat3].map(feat => (
          <div key={feat} style={{
            background: 'rgba(124,158,255,0.08)', border: '1px solid rgba(124,158,255,0.15)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 12,
            textAlign: 'left', color: '#f9fafb', fontSize: 15, lineHeight: 1.4,
          }}>
            {feat}
          </div>
        ))}
        <button onClick={() => setStep(2)} style={{ ...BTN, marginTop: 12 }}>{t.step2Btn}</button>
      </Screen>
    )
  }

  return (
    <Screen step={2}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>✨</div>
      <h2 style={{ color: '#f9fafb', fontSize: 26, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
        {t.step3Title}
      </h2>
      <p style={{ color: '#9ca3af', fontSize: 16, lineHeight: 1.6, margin: '0 0 36px' }}>
        {t.step3Sub}
      </p>
      <button
        onClick={handleComplete}
        disabled={completing}
        style={{ ...BTN, opacity: completing ? 0.7 : 1, cursor: completing ? 'not-allowed' : 'pointer' }}
      >
        {completing ? '…' : t.step3Btn}
      </button>
    </Screen>
  )
}
