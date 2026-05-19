import { useAuthSupabase } from '../../context/AuthContext.tsx'
import { useCheckout } from '../../hooks/useCheckout'
import { MoodPicker } from './MoodPicker'
import { EmotionalFlow } from './EmotionalFlow'
import { DechargeInput } from './DechargeInput'
import { TodoInput } from './TodoInput'
import { GoodNightScreen } from './GoodNightScreen'

interface Props {
  accent: string
  lang: string
  onComplete: () => void
}

const STEP_LABELS = ['Humeur', 'Émotions', 'Décharge', 'Demain', 'Bonne nuit']

export function CheckoutScreen({ accent, lang, onComplete }: Props) {
  const { user, profile } = useAuthSupabase()
  const userId = user?.id ?? ''
  const {
    step,
    checkoutData,
    submitting,
    error,
    setMood,
    setDecharge,
    setJoyNote,
    setTodos,
    goToStep,
    isEmotionStrong,
    submit,
  } = useCheckout(userId)

  // step 5 = GoodNight screen (post-submit)
  if (step === 5) {
    return (
      <GoodNightScreen
        moodEvening={checkoutData.mood_evening}
        companionAnimal={profile?.companion_animal ?? null}
        accent={accent}
        onStay={onComplete}
      />
    )
  }

  const showEmotionStep = step === 2 && isEmotionStrong()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header + progress */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>🌙 Checkout du soir</div>
          {step > 1 && step < 5 && (
            <button
              onClick={() => goToStep((step - 1) as 1 | 2 | 3 | 4)}
              style={{ background: 'none', border: 'none', opacity: 0.4, fontSize: 22, cursor: 'pointer', color: 'inherit' }}
            >
              ←
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {STEP_LABELS.slice(0, 4).map((label, i) => (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <div
                style={{
                  height: 4,
                  width: '100%',
                  borderRadius: 4,
                  background: i < step ? accent : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s',
                }}
              />
              <div style={{ fontSize: 9, opacity: i < step ? 0.7 : 0.3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '0 16px 24px', overflowY: 'auto' }}>
        {error && (
          <div style={{ color: '#f87171', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#f8717122', borderRadius: 10 }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <MoodPicker
            accent={accent}
            lang={lang}
            onSelect={(mood, emotion, intensity) => {
              setMood(mood, emotion, intensity)
              goToStep(2)
            }}
          />
        )}

        {step === 2 && showEmotionStep && checkoutData.emotion_primary && (
          <EmotionalFlow
            emotion={checkoutData.emotion_primary as 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur'}
            accent={accent}
            onJoyNote={setJoyNote}
            onComplete={() => goToStep(3)}
          />
        )}

        {step === 2 && !showEmotionStep && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 14, opacity: 0.6 }}>Humeur enregistrée ✓</div>
            <button onClick={() => goToStep(3)} style={primaryBtn(accent)}>Continuer →</button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <DechargeInput
              value={checkoutData.decharge_text ?? ''}
              onChange={setDecharge}
              accent={accent}
            />
            <button onClick={() => goToStep(4)} style={primaryBtn(accent)}>Continuer →</button>
            <button onClick={() => goToStep(4)} style={skipBtn}>Passer</button>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <TodoInput
              todo1={checkoutData.tomorrow_todo_1 ?? ''}
              todo2={checkoutData.tomorrow_todo_2 ?? ''}
              onTodo1={v => setTodos(v, checkoutData.tomorrow_todo_2 ?? '')}
              onTodo2={v => setTodos(checkoutData.tomorrow_todo_1 ?? '', v)}
              accent={accent}
            />
            <button
              onClick={submit}
              disabled={submitting}
              style={{ ...primaryBtn(accent), opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Enregistrement…' : 'Bonne nuit 🌙'}
            </button>
            <button onClick={() => submit()} style={skipBtn}>Passer les todos</button>
          </div>
        )}
      </div>
    </div>
  )
}

const primaryBtn = (accent: string): React.CSSProperties => ({
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

const skipBtn: React.CSSProperties = {
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
