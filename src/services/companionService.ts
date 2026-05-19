import type { DailySnapshot } from './checkoutService'

export type Animal = 'otter' | 'hedgehog' | 'fox' | 'koala' | 'axolotl'
export type CompanionState = 'serene' | 'attentive' | 'worried' | 'proud' | 'sleeping'

const MESSAGES: Record<Animal, Record<CompanionState, Record<string, string[]>>> = {
  otter: {
    serene: {
      fr: ["Je nage doucement avec toi 🌊", "L'eau est douce ce soir ✨", "On avance, ensemble 🦦"],
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
      fr: ["7 jours de suite ! Tu es incroyable 🌟", "Cette constance, c'est ta force ✨", "Regarde tout ce chemin parcouru 🦦"],
      en: ["7 days straight! You're incredible 🌟", "This consistency is your strength ✨", "Look how far you've come 🦦"],
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
      fr: ["Je me serre contre toi 🦔", "Les épines, c'est pour se protéger — toi aussi tu peux.", "On va traverser ça ensemble."],
      en: ["I'm snuggling up to you 🦔", "Spines are for protection — you can protect yourself too.", "We'll get through this together."],
    },
    proud: {
      fr: ["Tu brilles plus que mes épines ! ✨", "Quel héros, quelle héroïne 🦔", "7 jours ! Je suis fier·ère de toi 🌟"],
      en: ["You shine brighter than my spines! ✨", "What a hero 🦔", "7 days! I'm proud of you 🌟"],
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
      fr: ["Le renard danse ! 7 jours 🌟", "Tu as la ténacité du renard ✨", "Impressionnant·e, vraiment 🦊"],
      en: ["The fox dances! 7 days 🌟", "You have the fox's tenacity ✨", "Truly impressive 🦊"],
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
      fr: ["Je me serre fort contre la branche 🐨", "Parfois on a besoin de ralentir — c'est ok.", "Je reste là, avec toi."],
      en: ["Holding tight to the branch 🐨", "Sometimes we need to slow down — that's ok.", "I'm staying here, with you."],
    },
    proud: {
      fr: ["Le koala est épaté ! 7 jours 🌟", "Tu es plus tenace que l'eucalyptus 🐨", "Bravo, vraiment ✨"],
      en: ["The koala is amazed! 7 days 🌟", "You're tougher than eucalyptus 🐨", "Well done, truly ✨"],
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
      fr: ["L'axolotl fait des bulles de joie ! 🌟", "7 jours — tu te régénères en beauté ✨", "Incroyable, comme toujours 🦎"],
      en: ["The axolotl blows bubbles of joy! 🌟", "7 days — you regenerate beautifully ✨", "Incredible, as always 🦎"],
    },
    sleeping: {
      fr: ["L'axolotl plonge dans les rêves 🦎", "Bonne nuit sous-marine 🌙", "Régénère-toi cette nuit 💤"],
      en: ["The axolotl dives into dreams 🦎", "Underwater good night 🌙", "Regenerate tonight 💤"],
    },
  },
}

export function getCompanionState(
  snapshot: DailySnapshot | null,
  streak: number,
): CompanionState {
  if (!snapshot) return 'attentive'

  const hour = new Date().getHours()
  if (snapshot.checkout_done || hour >= 22 || hour < 7) return 'sleeping'
  if (streak >= 7) return 'proud'
  if ((snapshot.mood_evening ?? 5) <= 2) return 'worried'
  if ((snapshot.sleep_quality ?? 5) <= 2) return 'worried'

  const today = new Date().toISOString().slice(0, 10)
  if (snapshot.date !== today) return 'attentive'

  return 'serene'
}

export function getCompanionMessage(animal: Animal, state: CompanionState, lang: string): string {
  const pool = MESSAGES[animal]?.[state]?.[lang] ?? MESSAGES[animal]?.[state]?.fr ?? ['…']
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getCompanionAssetPath(animal: Animal, state: CompanionState): string {
  return `/companions/${animal}/${state}.png`
}
