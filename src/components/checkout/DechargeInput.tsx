const MAX = 500

interface Props {
  value: string
  onChange: (text: string) => void
  accent: string
}

export function DechargeInput({ value, onChange, accent }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>
        Qu'est-ce que tu veux laisser ici ce soir ?
      </div>
      <textarea
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        autoCorrect="off"
        autoCapitalize="sentences"
        spellCheck={false}
        value={value}
        onChange={e => onChange(e.target.value.slice(0, MAX))}
        rows={6}
        placeholder="Dépose ce que tu portes…"
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid rgba(255,255,255,0.12)`,
          borderRadius: 14,
          padding: '12px 14px',
          color: 'inherit',
          fontSize: 14,
          fontFamily: 'Georgia, serif',
          lineHeight: 1.7,
          resize: 'none',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      <div
        style={{
          fontSize: 11,
          textAlign: 'right',
          opacity: 0.4,
          color: value.length >= MAX ? '#f87171' : 'inherit',
        }}
      >
        {value.length} / {MAX}
      </div>
    </div>
  )
}
