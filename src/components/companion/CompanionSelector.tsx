import { useState } from 'react'
import type { Animal } from '../../services/companionService'
import { getCompanionConfig, STATE_COLORS, saveCompanionAnimal } from '../../services/companionService'
import { CompanionAvatar } from './CompanionAvatar'

// Showcase state par animal → couleurs variées dans la grille
const SHOWCASE: Record<Animal, 'serene' | 'attentive' | 'proud'> = {
  otter:    'serene',
  hedgehog: 'attentive',
  fox:      'proud',
  koala:    'serene',
  axolotl:  'attentive',
}

const ANIMALS: { id: Animal; name: string; trait: string }[] = [
  { id: 'otter',    name: 'Loutre',   trait: 'Douce et joueuse'       },
  { id: 'hedgehog', name: 'Hérisson', trait: 'Discret et fidèle'      },
  { id: 'fox',      name: 'Renard',   trait: 'Curieux et vif'         },
  { id: 'koala',    name: 'Koala',    trait: 'Calme et résilient'     },
  { id: 'axolotl',  name: 'Axolotl',  trait: 'Unique et régénérateur' },
]

interface Props {
  userId:   string
  onSelect: (animal: Animal) => void
}

export function CompanionSelector({ userId, onSelect }: Props) {
  const [selected, setSelected] = useState<Animal | null>(null)
  const [saving,   setSaving]   = useState(false)

  async function handleConfirm() {
    if (!selected) return
    setSaving(true)
    await saveCompanionAnimal(userId, selected)
    setSaving(false)
    onSelect(selected)
  }

  const firstFour = ANIMALS.slice(0, 4)
  const axolotl   = ANIMALS[4]

  function renderCard(a: { id: Animal; name: string; trait: string }) {
    const active  = selected === a.id
    const state   = SHOWCASE[a.id]
    const config  = getCompanionConfig(a.id, state, 'fr', 0)
    const color   = active ? STATE_COLORS[state] : 'rgba(255,255,255,0.07)'

    return (
      <button
        key={a.id}
        aria-label={`Choisir ${a.name} comme compagnon`}
        onClick={() => setSelected(a.id)}
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          gap:             10,
          padding:        '20px 12px',
          borderRadius:    20,
          border:         `1px solid ${color}`,
          background:      active ? `${STATE_COLORS[state]}12` : 'rgba(255,255,255,0.03)',
          boxShadow:       active ? `0 0 24px ${STATE_COLORS[state]}25` : 'none',
          cursor:         'pointer',
          transition:     'all 200ms cubic-bezier(0.4,0,0.2,1)',
          width:          '100%',
        }}
      >
        <CompanionAvatar config={config} size="md" />
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize:   14,
              color:      '#EDE9FE',
              marginBottom: 3,
            }}
          >
            {a.name}
          </div>
          <div
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize:   12,
              color:      '#6B7280',
            }}
          >
            {a.trait}
          </div>
        </div>
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily:    'Syne, sans-serif',
            fontWeight:    900,
            fontSize:      22,
            letterSpacing: '-0.02em',
            color:         '#EDE9FE',
            marginBottom:  8,
          }}
        >
          Choisis ton compagnon
        </div>
        <div
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize:   14,
            color:      '#6B7280',
            lineHeight: 1.5,
          }}
        >
          Il t'accompagnera dans ta pratique quotidienne.
        </div>
      </div>

      {/* Grille 2 colonnes — 4 premiers */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                  12,
        }}
      >
        {firstFour.map(a => renderCard(a))}
      </div>

      {/* Axolotl centré */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 'calc(50% - 6px)' }}>
          {renderCard(axolotl)}
        </div>
      </div>

      <button
        aria-label="Confirmer le choix du compagnon"
        onClick={handleConfirm}
        disabled={!selected || saving}
        style={{
          padding:       '14px 24px',
          borderRadius:   16,
          border:        'none',
          background:    'linear-gradient(135deg, #7C3AED, #4F46E5)',
          color:         '#fff',
          fontFamily:    'Syne, sans-serif',
          fontWeight:    700,
          fontSize:      14,
          letterSpacing: '0.05em',
          boxShadow:     '0 8px 24px rgba(124,58,237,0.4)',
          cursor:         selected && !saving ? 'pointer' : 'default',
          opacity:        selected && !saving ? 1 : 0.4,
          transition:    'opacity 200ms',
        }}
      >
        {saving ? 'Enregistrement…' : 'Choisir ce compagnon'}
      </button>
    </div>
  )
}
