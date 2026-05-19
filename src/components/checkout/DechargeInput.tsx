import { useRef, useEffect } from 'react'

const MAX = 500

interface Props {
  value:    string
  onChange: (text: string) => void
}

export function DechargeInput({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-expand jusqu'à 300px
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 300)}px`
  }, [value])

  const charColor =
    value.length > 480 ? '#F43F5E'
    : value.length > 400 ? '#F59E0B'
    : '#6B7280'

  const charAnim = value.length > 400 ? 'lumio-dot-pulse' : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Label animé */}
      <div
        className="lumio-fade-up"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 400,
          fontSize:   16,
          color:      '#EDE9FE',
          lineHeight: 1.6,
        }}
      >
        Qu'est-ce que tu veux laisser ici ce soir ?
      </div>

      <textarea
        ref={textareaRef}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        autoCorrect="off"
        autoCapitalize="sentences"
        spellCheck={false}
        value={value}
        onChange={e => {
          if (e.target.value.length <= MAX) onChange(e.target.value)
        }}
        placeholder="Dépose ce que tu portes…"
        aria-label="Zone de décharge libre"
        style={{
          width:        '100%',
          minHeight:    180,
          background:   'rgba(255,255,255,0.03)',
          border:       value.length > 0
            ? '1px solid rgba(124,58,237,0.4)'
            : '1px solid rgba(124,58,237,0.15)',
          borderRadius: 16,
          padding:      '14px 16px',
          color:        value.length > 0 ? '#EDE9FE' : '#9CA3AF',
          fontFamily:   'DM Sans, sans-serif',
          fontWeight:   300,
          fontSize:     15,
          lineHeight:   1.7,
          resize:       'none',
          boxSizing:    'border-box',
          outline:      'none',
          transition:   'border 200ms, box-shadow 200ms',
          boxShadow:    value.length > 0
            ? '0 0 20px rgba(124,58,237,0.15)'
            : 'none',
        }}
        onFocus={e => {
          e.target.style.borderColor  = 'rgba(124,58,237,0.4)'
          e.target.style.boxShadow    = '0 0 20px rgba(124,58,237,0.15)'
        }}
        onBlur={e => {
          e.target.style.borderColor  = value.length > 0
            ? 'rgba(124,58,237,0.4)'
            : 'rgba(124,58,237,0.15)'
          e.target.style.boxShadow    = value.length > 0
            ? '0 0 20px rgba(124,58,237,0.15)'
            : 'none'
        }}
      />

      <div
        className={charAnim}
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize:   11,
          textAlign:  'right',
          color:      charColor,
          transition: 'color 200ms',
        }}
      >
        {value.length} / {MAX}
      </div>
    </div>
  )
}
