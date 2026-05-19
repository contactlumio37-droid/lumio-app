import type { Animal, CompanionState } from '../../services/companionService'
import { getCompanionAssetPath } from '../../services/companionService'

interface Props {
  animal: Animal
  state: CompanionState
  streak: number
  onClick?: () => void
}

const STATE_EMOJI: Record<CompanionState, string> = {
  serene: '😌',
  attentive: '👀',
  worried: '💙',
  proud: '🌟',
  sleeping: '💤',
}

export function CompanionBadge({ animal, state, streak, onClick }: Props) {
  const assetPath = getCompanionAssetPath(animal, state)

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(255,255,255,0.08)',
        border: 'none',
        borderRadius: 20,
        padding: '4px 10px 4px 4px',
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: 'inherit',
        color: 'inherit',
      }}
    >
      <img
        src={assetPath}
        alt={animal}
        width={28}
        height={28}
        onError={e => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
        style={{ objectFit: 'contain', borderRadius: '50%' }}
      />
      <span style={{ fontSize: 13 }}>{STATE_EMOJI[state]}</span>
      {streak >= 3 && (
        <span style={{ fontSize: 12, opacity: 0.7 }}>🔥{streak}</span>
      )}
    </button>
  )
}
