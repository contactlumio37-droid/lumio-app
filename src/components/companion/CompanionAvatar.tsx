import type { CompanionConfig, Animal } from '../../services/companionService'

// ─── Tailles ───────────────────────────────────────────────────────────────────
const SIZE_PX: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 48, md: 72, lg: 100, xl: 128,
}

// Phase d'animation décalée par animal (évite les synchronisations)
const FLOAT_DELAY: Record<Animal, string> = {
  otter:    '0s',
  hedgehog: '0.8s',
  fox:      '1.6s',
  koala:    '2.4s',
  axolotl:  '3.2s',
}

interface Props {
  config: CompanionConfig
  size:   'sm' | 'md' | 'lg' | 'xl'
}

export function CompanionAvatar({ config, size }: Props) {
  const px      = SIZE_PX[size]
  const color   = config.accentColor
  const doFloat = size !== 'sm'
  const radius  = Math.round(px * 0.28)

  return (
    <div
      className={doFloat ? 'lumio-float' : undefined}
      aria-label={`Compagnon ${config.animal}, état ${config.state}`}
      style={{
        width:          px,
        height:         px,
        borderRadius:   radius,
        background:     `${color}1a`,           // ~10% opacity
        border:         `1px solid ${color}33`, // ~20% opacity
        boxShadow:      `0 0 ${Math.round(px / 3)}px ${color}3d`, // ~24%
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       Math.round(px * 0.52),
        lineHeight:     1,
        flexShrink:     0,
        userSelect:     'none',
        animationDelay: doFloat ? FLOAT_DELAY[config.animal] : undefined,
      }}
    >
      {config.emoji}
    </div>
  )
}
