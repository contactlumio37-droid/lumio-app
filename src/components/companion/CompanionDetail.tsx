import { useEffect, useState } from 'react'
import type { CompanionConfig } from '../../services/companionService'
import { CompanionAvatar } from './CompanionAvatar'

const STATE_LABEL: Record<string, string> = {
  serene:    'Serein·e',
  attentive: 'Attentif',
  worried:   'Inquiet',
  proud:     'Fier·ère',
  sleeping:  'En repos',
}

interface Props {
  config:       CompanionConfig
  streak:       number
  checkoutDone: boolean
  onClose:      () => void
  onCheckout?:  () => void
}

export function CompanionDetail({ config, streak, checkoutDone, onClose, onCheckout }: Props) {
  const [visible, setVisible] = useState(false)
  const color = config.accentColor

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 260)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Détail du compagnon"
      onClick={handleClose}
      style={{
        position:   'fixed',
        inset:       0,
        zIndex:      200,
        background:  visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        transition:  'background 260ms',
      }}
    >
      {/* Sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position:    'absolute',
          bottom:       0,
          left:         0,
          right:        0,
          background:  '#0d0a1a',
          borderRadius: '28px 28px 0 0',
          padding:     '12px 20px calc(32px + env(safe-area-inset-bottom, 0px))',
          transform:    visible ? 'translateY(0)' : 'translateY(100%)',
          transition:  'transform 350ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#374151' }} />
        </div>

        {/* Avatar centré */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <CompanionAvatar config={config} size="lg" />
        </div>

        {/* State badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div
            style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:         6,
              padding:    '4px 12px',
              borderRadius: 50,
              background:  `${color}22`,
              border:      `1px solid ${color}55`,
            }}
          >
            <div
              className="lumio-dot-pulse"
              style={{ width: 6, height: 6, borderRadius: '50%', background: color }}
            />
            <span
              style={{
                fontFamily:    'Syne, sans-serif',
                fontWeight:    700,
                fontSize:      10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color,
              }}
            >
              {STATE_LABEL[config.state] ?? config.state}
            </span>
          </div>
        </div>

        {/* Message */}
        <div
          style={{
            fontFamily:   'DM Sans, sans-serif',
            fontWeight:   300,
            fontStyle:    'italic',
            fontSize:     16,
            color:        '#D1D5DB',
            textAlign:    'center',
            lineHeight:   1.6,
            marginBottom: streak > 0 ? 20 : 24,
            padding:     '0 8px',
          }}
        >
          {config.message}
        </div>

        {/* Stats streak */}
        {streak > 0 && (
          <div
            style={{
              display:        'flex',
              justifyContent: 'center',
              marginBottom:   24,
            }}
          >
            <div
              style={{
                display:     'flex',
                alignItems:  'center',
                gap:          8,
                padding:     '8px 20px',
                borderRadius: 50,
                background:  'rgba(245,158,11,0.1)',
                border:      '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <span style={{ fontSize: 18 }}>🔥</span>
              <span
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize:   15,
                  color:     '#F59E0B',
                }}
              >
                {streak} jour{streak > 1 ? 's' : ''} de suite
              </span>
            </div>
          </div>
        )}

        {/* CTA Checkout */}
        {!checkoutDone && (
          <button
            aria-label="Faire mon checkout du soir"
            onClick={onCheckout}
            style={{
              width:         '100%',
              padding:       '14px 24px',
              borderRadius:  16,
              border:        'none',
              background:    'linear-gradient(135deg, #7C3AED, #4F46E5)',
              color:         '#fff',
              fontFamily:    'Syne, sans-serif',
              fontWeight:    700,
              fontSize:      14,
              letterSpacing: '0.05em',
              boxShadow:     '0 8px 24px rgba(124,58,237,0.4)',
              cursor:        'pointer',
            }}
          >
            🌙 Faire mon Checkout du soir
          </button>
        )}
      </div>
    </div>
  )
}
