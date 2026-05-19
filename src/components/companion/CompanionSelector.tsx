import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Animal } from '../../services/companionService'

interface Props {
  userId: string
  accent: string
  onSelect: (animal: Animal) => void
}

const ANIMALS: { id: Animal; emoji: string; name: string; description: string }[] = [
  { id: 'otter', emoji: '🦦', name: 'Loutre', description: 'Douce et joueuse' },
  { id: 'hedgehog', emoji: '🦔', name: 'Hérisson', description: 'Discret et fidèle' },
  { id: 'fox', emoji: '🦊', name: 'Renard', description: 'Curieux et vif' },
  { id: 'koala', emoji: '🐨', name: 'Koala', description: 'Calme et résilient' },
  { id: 'axolotl', emoji: '🦎', name: 'Axolotl', description: 'Unique et régénérateur' },
]

export function CompanionSelector({ userId, accent, onSelect }: Props) {
  const [selected, setSelected] = useState<Animal | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleConfirm() {
    if (!selected) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ companion_animal: selected })
      .eq('id', userId)
    setSaving(false)
    onSelect(selected)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px 16px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Choisis ton compagnon
        </div>
        <div style={{ fontSize: 14, opacity: 0.6, lineHeight: 1.5 }}>
          Il t'accompagnera dans ta pratique quotidienne.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ANIMALS.map(a => (
          <button
            key={a.id}
            onClick={() => setSelected(a.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 16,
              border: selected === a.id
                ? `2px solid ${accent}`
                : '2px solid rgba(255,255,255,0.1)',
              background: selected === a.id
                ? `${accent}22`
                : 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              color: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 32 }}>{a.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{a.name}</div>
              <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>{a.description}</div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected || saving}
        style={{
          padding: '14px',
          borderRadius: 16,
          border: 'none',
          background: accent,
          color: '#fff',
          fontWeight: 800,
          fontSize: 15,
          cursor: selected ? 'pointer' : 'default',
          opacity: selected && !saving ? 1 : 0.4,
          fontFamily: 'inherit',
        }}
      >
        {saving ? 'Enregistrement…' : 'Choisir ce compagnon'}
      </button>
    </div>
  )
}
