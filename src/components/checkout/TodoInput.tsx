import { useState } from 'react'

const MAX = 200

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const TODO_T: Record<Lang, {
  title: string; p1: string; p2: string; placeholder: string; nudge: string
}> = {
  fr: { title: 'Deux priorités pour demain', p1: 'Priorité 1', p2: 'Priorité 2', placeholder: 'Une chose importante pour demain', nudge: '🌙 Lumio te suggère de rester sur 2 priorités pour dormir sereinement.' },
  en: { title: 'Two priorities for tomorrow', p1: 'Priority 1', p2: 'Priority 2', placeholder: 'One important thing for tomorrow', nudge: '🌙 Lumio suggests staying with 2 priorities for a peaceful sleep.' },
  es: { title: 'Dos prioridades para mañana', p1: 'Prioridad 1', p2: 'Prioridad 2', placeholder: 'Una cosa importante para mañana', nudge: '🌙 Lumio te sugiere quedarte con 2 prioridades para dormir tranquilo.' },
  de: { title: 'Zwei Prioritäten für morgen', p1: 'Priorität 1', p2: 'Priorität 2', placeholder: 'Eine wichtige Sache für morgen', nudge: '🌙 Lumio empfiehlt, bei 2 Prioritäten zu bleiben, um ruhig zu schlafen.' },
  it: { title: 'Due priorità per domani', p1: 'Priorità 1', p2: 'Priorità 2', placeholder: 'Una cosa importante per domani', nudge: '🌙 Lumio ti suggerisce di restare su 2 priorità per dormire serenamente.' },
  pt: { title: 'Duas prioridades para amanhã', p1: 'Prioridade 1', p2: 'Prioridade 2', placeholder: 'Uma coisa importante para amanhã', nudge: '🌙 O Lumio sugere ficar com 2 prioridades para dormir serenamente.' },
}

interface Props {
  todo1: string
  todo2: string
  onTodo1: (v: string) => void
  onTodo2: (v: string) => void
  accent: string
  lang?: string
}

const inputStyle = (accent: string): React.CSSProperties => ({
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid rgba(255,255,255,0.12)`,
  borderRadius: 12,
  padding: '11px 14px',
  color: 'inherit',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
})

export function TodoInput({ todo1, todo2, onTodo1, onTodo2, accent, lang = 'fr' }: Props) {
  const [showNudge, setShowNudge] = useState(false)
  const l = (lang as Lang) in TODO_T ? (lang as Lang) : 'en'
  const t = TODO_T[l]

  const handleFocusThird = () => setShowNudge(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 14, opacity: 0.7 }}>{t.title}</div>

      {[
        { label: t.p1, value: todo1, onChange: onTodo1 },
        { label: t.p2, value: todo2, onChange: onTodo2 },
      ].map(({ label, value, onChange }) => (
        <div key={label}>
          <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 6 }}>{label}</div>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value.slice(0, MAX))}
            placeholder={t.placeholder}
            style={inputStyle(accent)}
          />
          {value.length > MAX - 20 && (
            <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4, textAlign: 'right' }}>
              {value.length} / {MAX}
            </div>
          )}
        </div>
      ))}

      {/* Soft nudge if user tries to add a 3rd */}
      <div
        onFocus={handleFocusThird}
        tabIndex={0}
        style={{ outline: 'none' }}
        aria-hidden="true"
      />
      {showNudge && (
        <div
          style={{
            fontSize: 13,
            opacity: 0.6,
            textAlign: 'center',
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
            lineHeight: 1.5,
          }}
        >
          {t.nudge}
        </div>
      )}
    </div>
  )
}
