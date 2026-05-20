interface Props {
  onPress?: () => void
}

export function PaywallBadge({ onPress }: Props) {
  return (
    <button
      onClick={onPress}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            4,
        padding:        '2px 9px',
        borderRadius:   8,
        border:         'none',
        background:     'linear-gradient(135deg, #7C3AED, #4F46E5)',
        color:          '#EDE9FE',
        fontSize:       11,
        fontWeight:     700,
        cursor:         onPress ? 'pointer' : 'default',
        fontFamily:     'Syne, sans-serif',
        verticalAlign:  'middle',
        letterSpacing:  '0.04em',
      }}
    >
      ✦ Lumio+
    </button>
  )
}
