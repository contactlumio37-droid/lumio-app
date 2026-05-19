import type { DailySnapshot } from './checkoutService'

// ─── Types exportés ────────────────────────────────────────────────────────────

export type Animal         = 'otter' | 'hedgehog' | 'fox' | 'koala' | 'axolotl'
export type CompanionState = 'serene' | 'attentive' | 'worried' | 'proud' | 'sleeping'

export interface CompanionConfig {
  animal:      Animal
  state:       CompanionState
  message:     string
  accentColor: string  // couleur de l'état
  emoji:       string  // emoji de l'animal
}

// ─── Mappings ──────────────────────────────────────────────────────────────────

export const STATE_COLORS: Record<CompanionState, string> = {
  serene:    '#14B8A6', // teal
  attentive: '#C4B5FD', // lavender
  worried:   '#F43F5E', // rose
  proud:     '#F59E0B', // amber
  sleeping:  '#4F46E5', // indigo
}

export const ANIMAL_EMOJI: Record<Animal, string> = {
  otter:    '🦦',
  hedgehog: '🦔',
  fox:      '🦊',
  koala:    '🐨',
  axolotl:  '🦎',
}

// ─── Dictionnaire de messages (3 par animal × état) ────────────────────────────

const MESSAGES: Record<Animal, Record<CompanionState, Record<string, string[]>>> = {
  otter: {
    serene: {
      fr: ["Je nage doucement avec toi 🌊", "L'eau est douce ce soir ✨", "On avance ensemble, pas à pas 🦦"],
      en: ["Gliding gently with you 🌊", "Smooth waters tonight ✨", "Moving forward, together 🦦"],
    },
    attentive: {
      fr: ["Je t'observe… comment tu vas aujourd'hui ?", "Prêt à t'écouter 👂", "Dis-moi comment s'est passée ta journée."],
      en: ["Watching over you… how are you today?", "Ready to listen 👂", "Tell me about your day."],
    },
    worried: {
      fr: ["Je sens que c'est difficile. Je suis là 💙", "Tu n'as pas à traverser ça seul·e.", "Prends une grande inspiration avec moi 🌊"],
      en: ["I sense it's hard. I'm here 💙", "You don't have to face this alone.", "Take a deep breath with me 🌊"],
    },
    proud: {
      fr: ["{streak} jours de suite ! Tu es incroyable 🌟", "Cette constance, c'est ta force ✨", "Regarde tout ce chemin parcouru 🦦"],
      en: ["{streak} days straight! You're incredible 🌟", "This consistency is your strength ✨", "Look how far you've come 🦦"],
    },
    sleeping: {
      fr: ["Bonne nuit, je veille sur toi 🌙", "Dors bien, demain est une nouvelle page 💤", "La loutre somnole… repose-toi 🦦"],
      en: ["Good night, I'm watching over you 🌙", "Sleep well, tomorrow's a new page 💤", "The otter dozes… rest now 🦦"],
    },
  },
  hedgehog: {
    serene: {
      fr: ["Je me roule en boule de bonheur 🦔", "Tout va bien dans notre petit monde.", "Un jour paisible, j'apprécie 🌿"],
      en: ["Curling up in happiness 🦔", "All is well in our little world.", "A peaceful day, I appreciate it 🌿"],
    },
    attentive: {
      fr: ["Mes petites oreilles sont dressées 🦔", "Je t'écoute, raconte-moi.", "Qu'est-ce qui s'est passé aujourd'hui ?"],
      en: ["My little ears are perked up 🦔", "I'm listening, tell me.", "What happened today?"],
    },
    worried: {
      fr: ["Je me serre contre toi 🦔", "Les épines protègent — toi aussi tu peux.", "On va traverser ça ensemble."],
      en: ["I'm snuggling up to you 🦔", "Spines are for protection — you can too.", "We'll get through this together."],
    },
    proud: {
      fr: ["{streak} jours ! Tu brilles plus que mes épines ✨", "Quel héros, quelle héroïne 🦔", "Je suis fier·ère de toi 🌟"],
      en: ["{streak} days! You shine brighter than my spines ✨", "What a hero 🦔", "I'm proud of you 🌟"],
    },
    sleeping: {
      fr: ["Le hérisson hiberne… bonne nuit 🦔", "Recroquevillé dans les rêves 💤", "Nuit douce, nuit calme 🌙"],
      en: ["The hedgehog hibernates… good night 🦔", "Curled up in dreams 💤", "Sweet, calm night 🌙"],
    },
  },
  fox: {
    serene: {
      fr: ["Le renard observe la forêt tranquille 🦊", "Une belle journée dans les bois.", "Tout est calme et c'est parfait ✨"],
      en: ["The fox surveys the quiet forest 🦊", "A beautiful day in the woods.", "All is calm and that's perfect ✨"],
    },
    attentive: {
      fr: ["Mes oreilles captent tout 🦊", "Je sens quelque chose… tu veux en parler ?", "Le renard est curieux de ta journée."],
      en: ["My ears catch everything 🦊", "I sense something… want to talk?", "The fox is curious about your day."],
    },
    worried: {
      fr: ["Je reste à tes côtés 🦊", "Même les renards ont besoin de souffler.", "Laisse la forêt t'accueillir ce soir."],
      en: ["I stay by your side 🦊", "Even foxes need to breathe.", "Let the forest hold you tonight."],
    },
    proud: {
      fr: ["{streak} jours — le renard danse ! 🌟", "Tu as la ténacité du renard ✨", "Impressionnant·e, vraiment 🦊"],
      en: ["{streak} days — the fox dances! 🌟", "You have the fox's tenacity ✨", "Truly impressive 🦊"],
    },
    sleeping: {
      fr: ["Le renard dort dans son terrier 🦊", "Bonne nuit, chasseur·se de rêves 🌙", "Repose-toi, demain une nouvelle aventure 💤"],
      en: ["The fox sleeps in its den 🦊", "Good night, dream hunter 🌙", "Rest now, new adventure tomorrow 💤"],
    },
  },
  koala: {
    serene: {
      fr: ["Accroché à l'eucalyptus de la sérénité 🐨", "La vie est douce aujourd'hui.", "Je sommeille doucement, tout va bien ✨"],
      en: ["Clinging to the eucalyptus of serenity 🐨", "Life is sweet today.", "Dozing gently, all is well ✨"],
    },
    attentive: {
      fr: ["Le koala ouvre les yeux 🐨", "Quelque chose attire mon attention… toi.", "Comment tu vas, vraiment ?"],
      en: ["The koala opens its eyes 🐨", "Something catches my attention… you.", "How are you, really?"],
    },
    worried: {
      fr: ["Je me serre fort contre la branche 🐨", "Parfois il faut ralentir — c'est ok.", "Je reste là, avec toi."],
      en: ["Holding tight to the branch 🐨", "Sometimes we need to slow down — that's ok.", "I'm staying here, with you."],
    },
    proud: {
      fr: ["{streak} jours — le koala est épaté ! 🌟", "Tu es plus tenace que l'eucalyptus 🐨", "Bravo, vraiment ✨"],
      en: ["{streak} days — the koala is amazed! 🌟", "You're tougher than eucalyptus 🐨", "Well done, truly ✨"],
    },
    sleeping: {
      fr: ["Le koala dort 20h/jour… rejoins-le 🐨", "Bonne nuit douce 🌙", "Dans les bras de Morphée 💤"],
      en: ["The koala sleeps 20h/day… join it 🐨", "Sweet good night 🌙", "In the arms of Morpheus 💤"],
    },
  },
  axolotl: {
    serene: {
      fr: ["Je flotte dans ma sérénité aquatique 🦎", "Les eaux sont calmes, je suis heureux·se.", "Un équilibre parfait aujourd'hui ✨"],
      en: ["Floating in aquatic serenity 🦎", "Waters are calm, I'm happy.", "Perfect balance today ✨"],
    },
    attentive: {
      fr: ["L'axolotl te regarde avec curiosité 🦎", "Tu sembles avoir quelque chose à dire…", "Je suis tout ouïe, branchies comprises."],
      en: ["The axolotl watches you curiously 🦎", "You seem to have something to say…", "I'm all ears, gills included."],
    },
    worried: {
      fr: ["Même les axolotls se régénèrent 🦎", "Tu es plus résilient·e que tu ne le crois.", "Je reste dans les eaux avec toi."],
      en: ["Even axolotls regenerate 🦎", "You're more resilient than you think.", "I stay in the waters with you."],
    },
    proud: {
      fr: ["{streak} jours — l'axolotl fait des bulles de joie ! 🌟", "Tu te régénères en beauté ✨", "Incroyable, comme toujours 🦎"],
      en: ["{streak} days — the axolotl blows bubbles of joy! 🌟", "You regenerate beautifully ✨", "Incredible, as always 🦎"],
    },
    sleeping: {
      fr: ["L'axolotl plonge dans les rêves 🦎", "Bonne nuit sous-marine 🌙", "Régénère-toi cette nuit 💤"],
      en: ["The axolotl dives into dreams 🦎", "Underwater good night 🌙", "Regenerate tonight 💤"],
    },
  },
}

// ─── Utilitaires internes ──────────────────────────────────────────────────────

function localDateISO(d: Date = new Date()): string {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// ─── Fonctions publiques ───────────────────────────────────────────────────────

/**
 * Calcule l'état du compagnon selon snapshot, streak et heure locale.
 * Priorité : sleeping > proud > worried > attentive > serene
 */
export function getCompanionState(
  snapshot: DailySnapshot | null,
  streak: number,
  hour: number,
): CompanionState {
  // Sleeping : nuit, tôt le matin, ou checkout fait
  if (hour < 7 || hour >= 22 || snapshot?.checkout_done === true) return 'sleeping'

  // Proud : streak >= 7
  if (streak >= 7) return 'proud'

  // Worried : mauvaise humeur ou mauvais sommeil
  if (snapshot) {
    if ((snapshot.mood_evening ?? 5) <= 2)  return 'worried'
    if ((snapshot.sleep_quality ?? 5) <= 2) return 'worried'
  }

  // Attentive : pas de snapshot ou absence >= 2 jours
  if (!snapshot) return 'attentive'
  const today     = localDateISO()
  const diffDays  = Math.round(
    (new Date(today).getTime() - new Date(snapshot.date).getTime()) / 86_400_000,
  )
  if (diffDays >= 2) return 'attentive'

  return 'serene'
}

/**
 * Sélection cohérente du message via hash(userId + date).
 * Interpole {streak} pour l'état "proud".
 */
export function getCompanionMessage(
  animal:  Animal,
  state:   CompanionState,
  lang:    string,
  streak:  number,
  userId?: string,
): string {
  const pool = MESSAGES[animal]?.[state]?.[lang] ?? MESSAGES[animal]?.[state]?.['fr'] ?? ['…']
  const key  = userId ? hashStr(`${userId}${localDateISO()}`) : Math.floor(Math.random() * pool.length)
  const msg  = pool[(key as number) % pool.length]
  return msg.replace('{streak}', String(streak))
}

export function getCompanionConfig(
  animal:  Animal,
  state:   CompanionState,
  lang:    string,
  streak:  number,
  userId?: string,
): CompanionConfig {
  return {
    animal,
    state,
    message:     getCompanionMessage(animal, state, lang, streak, userId),
    accentColor: STATE_COLORS[state],
    emoji:       ANIMAL_EMOJI[animal],
  }
}

/** Chemin asset PNG (fallback si emoji non suffisant). */
export function getCompanionAssetPath(animal: Animal, state: CompanionState): string {
  return `/companions/${animal}/${state}.png`
}
