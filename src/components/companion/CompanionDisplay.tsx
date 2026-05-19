import type { Animal, CompanionState } from '../../services/companionService'

interface Props {
  animal: Animal
  state: CompanionState
  message: string
  assetPath: string
  streak: number
  accent: string
}

const ANIMAL_NAMES: Record<Animal, string> = {
  otter: 'Loutre',
  hedgehog: 'Hérisson',
  fox: 'Renard',
  koala: 'Koala',
  axolotl: 'Axolotl',
}

export function CompanionDisplay({ animal, state, message, assetPath, streak, accent }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '20px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={assetPath}
          alt={ANIMAL_NAMES[animal]}
          width={120}
          height={120}
          onError={e => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
          style={{
            objectFit: 'contain',
            filter: state === 'sleeping' ? 'brightness(0.7)' : 'none',
            transition: 'filter 0.5s',
          }}
        />
        {streak >= 7 && (
          <div
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: accent,
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {streak}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 14,
          opacity: 0.75,
          lineHeight: 1.5,
          maxWidth: 260,
          fontStyle: 'italic',
        }}
      >
        {message}
      </div>

      {streak > 0 && (
        <div
          style={{
            fontSize: 12,
            opacity: 0.45,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          🔥 {streak} jour{streak > 1 ? 's' : ''} de suite
        </div>
      )}
    </div>
  )
}
