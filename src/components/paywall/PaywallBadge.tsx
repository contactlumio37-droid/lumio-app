interface Props {
  accent: string
  onPress?: () => void
}

export function PaywallBadge({ accent, onPress }: Props) {
  return (
    <button
      onClick={onPress}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 8,
        border: `1px solid ${accent}66`,
        background: `${accent}18`,
        color: accent,
        fontSize: 11,
        fontWeight: 700,
        cursor: onPress ? 'pointer' : 'default',
        fontFamily: 'inherit',
        verticalAlign: 'middle',
      }}
    >
      ✦ Lumio+
    </button>
  )
}
