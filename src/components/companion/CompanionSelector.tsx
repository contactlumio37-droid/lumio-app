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

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const CS_T: Record<Lang, {
  title: string; subtitle: string; confirm: string; saving: string
  chooseLabel: (name: string) => string
  animals: Record<Animal, { name: string; trait: string }>
}> = {
  fr: { title: 'Choisis ton compagnon', subtitle: "Il t'accompagnera dans ta pratique quotidienne.", confirm: 'Choisir ce compagnon', saving: 'Enregistrement…', chooseLabel: n => `Choisir ${n} comme compagnon`,
    animals: { otter: { name: 'Loutre', trait: 'Douce et joueuse' }, hedgehog: { name: 'Hérisson', trait: 'Discret et fidèle' }, fox: { name: 'Renard', trait: 'Curieux et vif' }, koala: { name: 'Koala', trait: 'Calme et résilient' }, axolotl: { name: 'Axolotl', trait: 'Unique et régénérateur' } } },
  en: { title: 'Choose your companion', subtitle: 'They will accompany you in your daily practice.', confirm: 'Choose this companion', saving: 'Saving…', chooseLabel: n => `Choose ${n} as companion`,
    animals: { otter: { name: 'Otter', trait: 'Soft and playful' }, hedgehog: { name: 'Hedgehog', trait: 'Discreet and loyal' }, fox: { name: 'Fox', trait: 'Curious and sharp' }, koala: { name: 'Koala', trait: 'Calm and resilient' }, axolotl: { name: 'Axolotl', trait: 'Unique and regenerative' } } },
  es: { title: 'Elige tu compañero', subtitle: 'Te acompañará en tu práctica diaria.', confirm: 'Elegir este compañero', saving: 'Guardando…', chooseLabel: n => `Elegir ${n} como compañero`,
    animals: { otter: { name: 'Nutria', trait: 'Suave y juguetona' }, hedgehog: { name: 'Erizo', trait: 'Discreto y fiel' }, fox: { name: 'Zorro', trait: 'Curioso y vivo' }, koala: { name: 'Koala', trait: 'Tranquilo y resistente' }, axolotl: { name: 'Ajolote', trait: 'Único y regenerador' } } },
  de: { title: 'Wähle deinen Begleiter', subtitle: 'Er begleitet dich in deiner täglichen Praxis.', confirm: 'Diesen Begleiter wählen', saving: 'Speichern…', chooseLabel: n => `${n} als Begleiter wählen`,
    animals: { otter: { name: 'Otter', trait: 'Sanft und verspielt' }, hedgehog: { name: 'Igel', trait: 'Diskret und treu' }, fox: { name: 'Fuchs', trait: 'Neugierig und lebhaft' }, koala: { name: 'Koala', trait: 'Ruhig und resilient' }, axolotl: { name: 'Axolotl', trait: 'Einzigartig und regenerativ' } } },
  it: { title: 'Scegli il tuo compagno', subtitle: 'Ti accompagnerà nella tua pratica quotidiana.', confirm: 'Scegli questo compagno', saving: 'Salvataggio…', chooseLabel: n => `Scegli ${n} come compagno`,
    animals: { otter: { name: 'Lontra', trait: 'Dolce e giocosa' }, hedgehog: { name: 'Riccio', trait: 'Discreto e fedele' }, fox: { name: 'Volpe', trait: 'Curioso e vivace' }, koala: { name: 'Koala', trait: 'Calmo e resiliente' }, axolotl: { name: 'Axolotl', trait: 'Unico e rigenerativo' } } },
  pt: { title: 'Escolhe o teu companheiro', subtitle: 'Vai acompanhar-te na tua prática diária.', confirm: 'Escolher este companheiro', saving: 'A guardar…', chooseLabel: n => `Escolher ${n} como companheiro`,
    animals: { otter: { name: 'Lontra', trait: 'Suave e brincalhona' }, hedgehog: { name: 'Ouriço', trait: 'Discreto e fiel' }, fox: { name: 'Raposa', trait: 'Curioso e vivo' }, koala: { name: 'Koala', trait: 'Calmo e resiliente' }, axolotl: { name: 'Axolotl', trait: 'Único e regenerador' } } },
}

const ANIMALS: { id: Animal }[] = [
  { id: 'otter' }, { id: 'hedgehog' }, { id: 'fox' }, { id: 'koala' }, { id: 'axolotl' },
]

interface Props {
  userId:   string
  lang?:    string
  onSelect: (animal: Animal) => void
}

export function CompanionSelector({ userId, lang = 'fr', onSelect }: Props) {
  const l  = (lang as Lang) in CS_T ? (lang as Lang) : 'en'
  const ct = CS_T[l]
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

  function renderCard(a: { id: Animal }) {
    const animal  = ct.animals[a.id]
    const active  = selected === a.id
    const state   = SHOWCASE[a.id]
    const config  = getCompanionConfig(a.id, state, l, 0)
    const color   = active ? STATE_COLORS[state] : 'rgba(255,255,255,0.07)'

    return (
      <button
        key={a.id}
        aria-label={ct.chooseLabel(animal.name)}
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
            {animal.name}
          </div>
          <div
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize:   12,
              color:      '#6B7280',
            }}
          >
            {animal.trait}
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
          {ct.title}
        </div>
        <div
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize:   14,
            color:      '#6B7280',
            lineHeight: 1.5,
          }}
        >
          {ct.subtitle}
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
        {saving ? ct.saving : ct.confirm}
      </button>
    </div>
  )
}
