import type { CompanionConfig, Animal } from '../../services/companionService'
import { CompanionAvatar } from './CompanionAvatar'

const ANIMAL_NAMES: Record<Animal, string> = {
  otter:    'Loutre',
  hedgehog: 'Hérisson',
  fox:      'Renard',
  koala:    'Koala',
  axolotl:  'Axolotl',
}

interface Props {
  config: CompanionConfig
}

export function CompanionMessage({ config }: Props) {
  const color = config.accentColor
  const name  = ANIMAL_NAMES[config.animal]

  return (
    <div
      className="lumio-fade-up"
      style={{
        display:    'flex',
        alignItems: 'flex-start',
        gap:         12,
      }}
    >
      <CompanionAvatar config={config} size="sm" />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            background:   'rgba(255,255,255,0.03)',
            border:       '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px 18px 18px 6px',
            padding:      '12px 14px',
          }}
        >
          <div
            style={{
              fontFamily:   'DM Sans, sans-serif',
              fontWeight:   300,
              fontStyle:    'italic',
              fontSize:     14,
              color:        '#D1D5DB',
              lineHeight:   1.6,
              marginBottom: 6,
            }}
          >
            {config.message}
          </div>
          <div
            style={{
              fontFamily:    'Syne, sans-serif',
              fontWeight:    700,
              fontSize:      10,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color,
            }}
          >
            {name}
          </div>
        </div>
      </div>
    </div>
  )
}
