type Animal = 'otter' | 'hedgehog' | 'fox' | 'koala' | 'axolotl'

const ANIMAL_NAMES: Record<Animal, string> = {
  otter: 'Loutre',
  hedgehog: 'Hérisson',
  fox: 'Renard',
  koala: 'Koala',
  axolotl: 'Axolotl',
}

const MESSAGES: Record<1 | 2 | 3 | 4 | 5, string> = {
  5: 'Quelle belle soirée. Tu mérites une bonne nuit 🌟',
  4: 'Une bonne journée derrière toi. Repose-toi bien 🌙',
  3: "Journée neutre — et c'est ok. Bonne nuit 😌",
  2: 'Ce soir a été dur. Demain est une nouvelle page 🌱',
  1: "Courage. La nuit va t'aider. Tu n'es pas seul·e 💙",
}

interface Props {
  moodEvening?: 1 | 2 | 3 | 4 | 5
  companionAnimal?: Animal | null
  accent: string
  onStay: () => void
}

export function GoodNightScreen({ moodEvening = 3, companionAnimal, accent, onStay }: Props) {
  const animal = companionAnimal ?? 'otter'
  const assetPath = `/companions/${animal}/sleeping.png`

  const handleClose = () => {
    try {
      // Capacitor App.minimize() — graceful no-op on web
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { App } = (window as any).Capacitor?.Plugins ?? {}
      App?.minimizeApp?.()
    } catch {
      // web — nothing to do
    }
    onStay()
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: '32px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.5 }}>Checkout terminé ✓</div>

      {/* Companion */}
      <img
        src={assetPath}
        alt={ANIMAL_NAMES[animal]}
        width={160}
        height={160}
        onError={e => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
        style={{ objectFit: 'contain', opacity: 0.9 }}
      />

      <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.4 }}>
        Bonne nuit 🌙
      </div>
      <div style={{ fontSize: 15, opacity: 0.7, lineHeight: 1.6, maxWidth: 300 }}>
        {MESSAGES[moodEvening]}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <button
          onClick={handleClose}
          style={{
            padding: '14px',
            borderRadius: 16,
            border: 'none',
            background: accent,
            color: '#fff',
            fontWeight: 800,
            fontSize: 15,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Fermer l'app
        </button>
        <button
          onClick={onStay}
          style={{
            padding: '12px',
            borderRadius: 14,
            border: `1px solid rgba(255,255,255,0.15)`,
            background: 'transparent',
            color: 'inherit',
            opacity: 0.6,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Rester dans l'app
        </button>
      </div>
    </div>
  )
}
