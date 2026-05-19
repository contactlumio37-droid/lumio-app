import { useState } from 'react'
import type { CompanionConfig } from '../../services/companionService'
import { CompanionAvatar }  from './CompanionAvatar'
import { CompanionDetail }  from './CompanionDetail'

interface Props {
  config:       CompanionConfig
  streak:       number
  checkoutDone: boolean
  onCheckout?:  () => void
}

export function CompanionBadge({ config, streak, checkoutDone, onCheckout }: Props) {
  const [showDetail, setShowDetail] = useState(false)
  const color = config.accentColor

  return (
    <>
      <button
        aria-label={`Ouvrir le détail de ton compagnon`}
        onClick={() => setShowDetail(true)}
        style={{
          position:       'relative',
          width:           48,
          height:          48,
          borderRadius:    14,
          border:         `1px solid ${color}33`,
          background:     `${color}1a`,
          cursor:         'pointer',
          padding:         0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:      0,
          transition:     'all 200ms',
        }}
      >
        <CompanionAvatar config={config} size="sm" />

        {/* Dot indicateur d'état */}
        <div
          className="lumio-dot-pulse"
          style={{
            position:     'absolute',
            bottom:        2,
            right:         2,
            width:         8,
            height:        8,
            borderRadius: '50%',
            background:    color,
            border:       '1.5px solid #06040f',
            pointerEvents: 'none',
          }}
        />
      </button>

      {showDetail && (
        <CompanionDetail
          config={config}
          streak={streak}
          checkoutDone={checkoutDone}
          onClose={() => setShowDetail(false)}
          onCheckout={() => {
            setShowDetail(false)
            onCheckout?.()
          }}
        />
      )}
    </>
  )
}
