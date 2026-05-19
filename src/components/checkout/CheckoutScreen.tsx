import { useRef } from 'react'
import { useAuthSupabase } from '../../context/AuthContext.tsx'
import { useCheckout, type CheckoutStep } from '../../hooks/useCheckout'
import { MoodPicker }        from './MoodPicker'
import { EmotionalFlow }     from './EmotionalFlow'
import { DechargeInput }     from './DechargeInput'
import { TodoInput }         from './TodoInput'
import { GoodNightScreen }   from './GoodNightScreen'

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  deep:    '#06040f',
  mid:     '#1a1333',
  violet:  '#7C3AED',
  indigo:  '#4F46E5',
  text:    '#EDE9FE',
  muted:   '#6B7280',
  border:  'rgba(255,255,255,0.07)',
  gradCTA: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
}

// ─── Sous-titres par étape ──────────────────────────────────────────────────────
const STEP_SUBTITLES: Record<CheckoutStep, string> = {
  1: 'Comment tu vas ce soir ?',
  2: 'Ton émotion du moment',
  3: 'Pose ce que tu portes',
  4: 'Prépare demain sereinement',
}

interface Props {
  accent: string     // conservé pour compatibilité ascendante
  lang:   string
  onComplete: () => void
}

export function CheckoutScreen({ lang, onComplete }: Props) {
  const { user, profile } = useAuthSupabase()
  const userId = user?.id ?? ''

  const {
    step,
    checkoutData,
    submitting,
    error,
    completed,
    setMood,
    setDecharge,
    setJoyNote,
    setTodos,
    nextStep,
    prevStep,
    goToStep,
    isEmotionStrong,
    submit,
  } = useCheckout(userId)

  // Tracking direction for slide animation
  const prevStepRef = useRef<CheckoutStep>(step)
  const dirRef      = useRef<'fwd' | 'bwd'>('fwd')
  if (step !== prevStepRef.current) {
    dirRef.current  = step > prevStepRef.current ? 'fwd' : 'bwd'
    prevStepRef.current = step
  }

  // ── GoodNight screen after submit ──────────────────────────────────────────
  if (completed) {
    return (
      <GoodNightScreen
        moodEvening={checkoutData.mood_evening}
        companionAnimal={profile?.companion_animal ?? null}
        userId={userId}
        onStay={onComplete}
      />
    )
  }

  const showEmotionStep = step === 2 && isEmotionStrong()

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        minHeight:     '100%',
        background:    T.deep,
        paddingTop:    'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 20px 0' }}>
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            position:       'relative',
            marginBottom:   8,
          }}
        >
          {/* Back button */}
          {step > 1 && (
            <button
              aria-label="Étape précédente"
              onClick={prevStep}
              style={{
                position:     'absolute',
                left:         0,
                width:        40,
                height:       40,
                borderRadius: 12,
                border:       `1px solid ${T.border}`,
                background:   'rgba(255,255,255,0.04)',
                color:        T.text,
                fontSize:     18,
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                lineHeight:   1,
              }}
            >
              ←
            </button>
          )}

          {/* Title */}
          <div>
            <div
              style={{
                fontFamily:    'Syne, sans-serif',
                fontWeight:    900,
                fontSize:      18,
                letterSpacing: '-0.02em',
                color:         T.text,
                textAlign:     'center',
              }}
            >
              🌙 Checkout
            </div>
            <div
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize:   12,
                color:      T.muted,
                textAlign:  'center',
                marginTop:  2,
              }}
            >
              {STEP_SUBTITLES[step]}
            </div>
          </div>
        </div>

        {/* ── Progress bar ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16, marginBottom: 24 }}>
          {([1, 2, 3, 4] as CheckoutStep[]).map(i => {
            const done   = i < step
            const active = i === step
            return (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 50, overflow: 'hidden' }}>
                {done ? (
                  <div
                    style={{
                      height: '100%',
                      background: T.gradCTA,
                      borderRadius: 50,
                      transition: 'all 300ms cubic-bezier(0.4,0,0.2,1)',
                    }}
                  />
                ) : active ? (
                  <div
                    className="lumio-progress-active"
                    style={{ height: '100%', borderRadius: 50 }}
                  />
                ) : (
                  <div
                    style={{
                      height:     '100%',
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: 50,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Step content (animated) ─────────────────────────────────── */}
      <div
        key={step}
        className={`lumio-step-${dirRef.current}`}
        style={{ flex: 1, padding: '0 20px 32px', overflowY: 'auto' }}
      >
        {error && (
          <div
            style={{
              color:        '#f87171',
              fontSize:     13,
              marginBottom: 16,
              padding:      '10px 14px',
              background:   'rgba(248,113,113,0.12)',
              borderRadius: 10,
              border:       '1px solid rgba(248,113,113,0.2)',
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1 — Humeur */}
        {step === 1 && (
          <MoodPicker
            lang={lang}
            onSelect={(mood, emotion, intensity) => {
              setMood(mood, emotion, intensity)
              goToStep(2)
            }}
          />
        )}

        {/* Step 2 — Emotional flow (si émotion forte) */}
        {step === 2 && showEmotionStep && checkoutData.emotion_primary && (
          <EmotionalFlow
            emotion={checkoutData.emotion_primary as 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur'}
            accent={T.violet}
            onJoyNote={setJoyNote}
            onComplete={() => goToStep(3)}
          />
        )}

        {/* Step 2 — Émotion neutre ou intensité faible */}
        {step === 2 && !showEmotionStep && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize:   14,
                color:      T.muted,
                lineHeight: 1.6,
              }}
            >
              Humeur enregistrée ✓
            </div>
            <button
              aria-label="Continuer vers la décharge"
              onClick={() => goToStep(3)}
              style={primaryBtnStyle}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Step 3 — Décharge */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <DechargeInput
              value={checkoutData.decharge_text ?? ''}
              onChange={setDecharge}
            />
            <button
              aria-label="Continuer vers les priorités"
              onClick={() => goToStep(4)}
              style={primaryBtnStyle}
            >
              Continuer →
            </button>
            <button
              aria-label="Passer la décharge"
              onClick={() => goToStep(4)}
              style={skipBtnStyle}
            >
              Je n'ai rien à poser ce soir
            </button>
          </div>
        )}

        {/* Step 4 — Todos */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TodoInput
              todo1={checkoutData.tomorrow_todo_1 ?? ''}
              todo2={checkoutData.tomorrow_todo_2 ?? ''}
              onTodo1={v => setTodos(v, checkoutData.tomorrow_todo_2 ?? '')}
              onTodo2={v => setTodos(checkoutData.tomorrow_todo_1 ?? '', v)}
            />
            <button
              aria-label="Terminer le checkout"
              onClick={submit}
              disabled={submitting}
              style={{ ...primaryBtnStyle, opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Enregistrement…' : 'Bonne nuit 🌙'}
            </button>
            <button
              aria-label="Passer les todos"
              onClick={submit}
              disabled={submitting}
              style={skipBtnStyle}
            >
              Passer les priorités
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const primaryBtnStyle: React.CSSProperties = {
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
}

const skipBtnStyle: React.CSSProperties = {
  padding:      '10px',
  borderRadius: 12,
  border:       'none',
  background:   'transparent',
  color:        '#6B7280',
  fontFamily:   'DM Sans, sans-serif',
  fontSize:     13,
  cursor:       'pointer',
}
