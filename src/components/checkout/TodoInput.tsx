import { useState } from 'react'

const MAX = 200

interface Props {
  todo1: string
  todo2: string
  onTodo1: (v: string) => void
  onTodo2: (v: string) => void
  accent: string
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

export function TodoInput({ todo1, todo2, onTodo1, onTodo2, accent }: Props) {
  const [showNudge, setShowNudge] = useState(false)

  const handleFocusThird = () => setShowNudge(true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 14, opacity: 0.7 }}>
        Deux priorités pour demain
      </div>

      {[
        { label: 'Priorité 1', value: todo1, onChange: onTodo1 },
        { label: 'Priorité 2', value: todo2, onChange: onTodo2 },
      ].map(({ label, value, onChange }) => (
        <div key={label}>
          <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 6 }}>{label}</div>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value.slice(0, MAX))}
            placeholder="Une chose importante pour demain"
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
          🌙 Lumio te suggère de rester sur 2 priorités pour dormir sereinement.
        </div>
      )}
    </div>
  )
}
