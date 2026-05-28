import { useState } from 'react'
import { BreathingExercise } from './BreathingExercise'
import { BodyScan } from './BodyScan'
import { DechargeInput } from './DechargeInput'

type Emotion = 'colere' | 'tristesse' | 'joie' | 'stress' | 'peur' | 'neutre'
type Lang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const QUESTIONS: Record<Lang, Record<Emotion, string[]>> = {
  fr: {
    colere:    ["Qu'est-ce qui a déclenché cette colère aujourd'hui ?", "Comment elle se manifeste dans ton corps en ce moment ?", "Qu'est-ce qui t'aurait aidé dans cette situation ?"],
    tristesse: ["Qu'est-ce qui pèse sur toi ce soir ?", "Est-ce que tu sais d'où vient cette tristesse ?", "De quoi as-tu besoin là, maintenant ?"],
    joie:      ["Qu'est-ce qui t'a rendu heureux aujourd'hui ?", "Avec qui as-tu partagé ce moment ?", "Comment tu gardes cette énergie pour demain ?"],
    stress:    ["Qu'est-ce qui occupe le plus ton esprit ce soir ?", "Est-ce quelque chose sur lequel tu as du contrôle ?", "Qu'est-ce que tu peux lâcher pour cette nuit ?"],
    peur:      ["Qu'est-ce qui te fait peur en ce moment ?", "Cette peur est-elle reliée à quelque chose de précis ?", "Quelle est la première petite action rassurante que tu pourrais faire ?"],
    neutre:    [],
  },
  en: {
    colere:    ["What triggered this anger today?", "How is it showing up in your body right now?", "What would have helped you in that situation?"],
    tristesse: ["What is weighing on you tonight?", "Do you know where this sadness comes from?", "What do you need right now?"],
    joie:      ["What made you happy today?", "Who did you share this moment with?", "How will you carry this energy into tomorrow?"],
    stress:    ["What is occupying your mind the most tonight?", "Is it something you have control over?", "What can you let go of for tonight?"],
    peur:      ["What is making you afraid right now?", "Is this fear connected to something specific?", "What is the first small reassuring action you could take?"],
    neutre:    [],
  },
  es: {
    colere:    ["¿Qué desencadenó esta rabia hoy?", "¿Cómo se manifiesta en tu cuerpo en este momento?", "¿Qué te habría ayudado en esa situación?"],
    tristesse: ["¿Qué te pesa esta noche?", "¿Sabes de dónde viene esta tristeza?", "¿Qué necesitas ahora mismo?"],
    joie:      ["¿Qué te ha hecho feliz hoy?", "¿Con quién compartiste ese momento?", "¿Cómo vas a mantener esa energía para mañana?"],
    stress:    ["¿Qué ocupa más tu mente esta noche?", "¿Es algo sobre lo que tienes control?", "¿Qué puedes soltar esta noche?"],
    peur:      ["¿Qué te da miedo en este momento?", "¿Este miedo está relacionado con algo concreto?", "¿Cuál sería la primera pequeña acción tranquilizadora que podrías hacer?"],
    neutre:    [],
  },
  de: {
    colere:    ["Was hat heute diese Wut ausgelöst?", "Wie zeigt sie sich gerade in deinem Körper?", "Was hätte dir in dieser Situation geholfen?"],
    tristesse: ["Was drückt dich heute Abend?", "Weißt du, woher diese Traurigkeit kommt?", "Was brauchst du gerade jetzt?"],
    joie:      ["Was hat dich heute glücklich gemacht?", "Mit wem hast du diesen Moment geteilt?", "Wie bewahrst du diese Energie für morgen?"],
    stress:    ["Was beschäftigt dich heute Abend am meisten?", "Ist es etwas, das du beeinflussen kannst?", "Was kannst du für diese Nacht loslassen?"],
    peur:      ["Was macht dir gerade Angst?", "Hat diese Angst mit etwas Bestimmtem zu tun?", "Was wäre die erste kleine beruhigende Aktion, die du unternehmen könntest?"],
    neutre:    [],
  },
  it: {
    colere:    ["Cosa ha scatenato questa rabbia oggi?", "Come si manifesta nel tuo corpo in questo momento?", "Cosa ti avrebbe aiutato in quella situazione?"],
    tristesse: ["Cosa ti pesa questa sera?", "Sai da dove viene questa tristezza?", "Di cosa hai bisogno adesso?"],
    joie:      ["Cosa ti ha reso felice oggi?", "Con chi hai condiviso questo momento?", "Come mantieni questa energia per domani?"],
    stress:    ["Cosa occupa di più la tua mente stasera?", "È qualcosa su cui hai controllo?", "Cosa puoi lasciare andare per questa notte?"],
    peur:      ["Cosa ti spaventa in questo momento?", "Questa paura è collegata a qualcosa di specifico?", "Qual è la prima piccola azione rassicurante che potresti fare?"],
    neutre:    [],
  },
  pt: {
    colere:    ["O que desencadeou esta raiva hoje?", "Como ela se manifesta no teu corpo agora?", "O que te teria ajudado nessa situação?"],
    tristesse: ["O que te pesa esta noite?", "Sabes de onde vem esta tristeza?", "Do que precisas agora?"],
    joie:      ["O que te fez feliz hoje?", "Com quem partilhaste este momento?", "Como vais manter esta energia para amanhã?"],
    stress:    ["O que ocupa mais a tua mente esta noite?", "É algo sobre o qual tens controlo?", "O que podes largar para esta noite?"],
    peur:      ["O que te assusta neste momento?", "Este medo está relacionado com algo específico?", "Qual seria a primeira pequena ação tranquilizadora que poderias fazer?"],
    neutre:    [],
  },
}

const EF_T: Record<Lang, {
  skip: string; next: string; cont: string; finish: string; capture: string
  joyHint: string; joyPlaceholder: string; writePlaceholder: string
  questionOf: (n: number, total: number) => string
}> = {
  fr: { skip: 'Passer', next: 'Suivant →', cont: 'Continuer →', finish: 'Terminer →', capture: 'Capturer ✦', joyHint: '☀️ Capture ce beau moment dans tes petits bonheurs', joyPlaceholder: 'Ce moment, cette sensation…', writePlaceholder: 'Écris ce qui vient…', questionOf: (n, t) => `Question ${n} / ${t}` },
  en: { skip: 'Skip', next: 'Next →', cont: 'Continue →', finish: 'Finish →', capture: 'Capture ✦', joyHint: '☀️ Capture this beautiful moment in your joys', joyPlaceholder: 'This moment, this feeling…', writePlaceholder: 'Write what comes…', questionOf: (n, t) => `Question ${n} / ${t}` },
  es: { skip: 'Omitir', next: 'Siguiente →', cont: 'Continuar →', finish: 'Terminar →', capture: 'Capturar ✦', joyHint: '☀️ Captura este bello momento en tus alegrías', joyPlaceholder: 'Este momento, esta sensación…', writePlaceholder: 'Escribe lo que venga…', questionOf: (n, t) => `Pregunta ${n} / ${t}` },
  de: { skip: 'Überspringen', next: 'Weiter →', cont: 'Fortfahren →', finish: 'Beenden →', capture: 'Festhalten ✦', joyHint: '☀️ Halte diesen schönen Moment in deinen Freuden fest', joyPlaceholder: 'Dieser Moment, dieses Gefühl…', writePlaceholder: 'Schreib, was kommt…', questionOf: (n, t) => `Frage ${n} / ${t}` },
  it: { skip: 'Salta', next: 'Avanti →', cont: 'Continua →', finish: 'Termina →', capture: 'Cattura ✦', joyHint: '☀️ Cattura questo bel momento nelle tue gioie', joyPlaceholder: 'Questo momento, questa sensazione…', writePlaceholder: 'Scrivi ciò che viene…', questionOf: (n, t) => `Domanda ${n} / ${t}` },
  pt: { skip: 'Saltar', next: 'Seguinte →', cont: 'Continuar →', finish: 'Terminar →', capture: 'Capturar ✦', joyHint: '☀️ Captura este belo momento nas tuas alegrias', joyPlaceholder: 'Este momento, esta sensação…', writePlaceholder: 'Escreve o que vier…', questionOf: (n, t) => `Pergunta ${n} / ${t}` },
}

type Exercise = 'breathing' | 'bodyscan' | 'writing' | 'joy_capture' | null

const EXERCISE_FOR: Record<Emotion, Exercise> = {
  colere:    'breathing',
  tristesse: 'writing',
  stress:    'bodyscan',
  peur:      'writing',
  joie:      'joy_capture',
  neutre:    null,
}

interface Props {
  emotion: Emotion
  accent: string
  lang?: string
  onJoyNote?: (note: string) => void
  onComplete: () => void
}

export function EmotionalFlow({ emotion, accent, lang = 'fr', onJoyNote, onComplete }: Props) {
  const l = (lang as Lang) in QUESTIONS ? (lang as Lang) : 'en'
  const t = EF_T[l]
  const questions = QUESTIONS[l][emotion] ?? []
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''))
  const [exercise, setExercise] = useState<Exercise | 'pending'>(
    questions.length === 0 ? 'pending' : null,
  )
  const [joyText, setJoyText] = useState('')

  const atExercise = exercise !== null
  const allQDone = qIdx >= questions.length

  const next = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1)
    } else {
      setExercise(EXERCISE_FOR[emotion])
    }
  }

  const skip = () => {
    if (allQDone || exercise === 'pending') {
      onComplete()
    } else {
      next()
    }
  }

  if (exercise === 'breathing') return <BreathingExercise accent={accent} onDone={onComplete} />
  if (exercise === 'bodyscan') return <BodyScan accent={accent} onDone={onComplete} />

  if (exercise === 'writing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <DechargeInput
          value={answers[qIdx] ?? ''}
          onChange={v => setAnswers(a => { const n = [...a]; n[qIdx] = v; return n })}
          accent={accent}
        />
        <button onClick={onComplete} style={btnStyle(accent)}>{t.finish}</button>
        <button onClick={onComplete} style={skipStyle}>{t.skip}</button>
      </div>
    )
  }

  if (exercise === 'joy_capture') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>{t.joyHint}</div>
        <input
          type="text"
          value={joyText}
          onChange={e => setJoyText(e.target.value.slice(0, 300))}
          placeholder={t.joyPlaceholder}
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid rgba(255,255,255,0.12)`,
            borderRadius: 12,
            padding: '11px 14px',
            color: 'inherit',
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={() => { onJoyNote?.(joyText); onComplete() }}
          style={btnStyle(accent)}
        >
          {t.capture}
        </button>
        <button onClick={onComplete} style={skipStyle}>{t.skip}</button>
      </div>
    )
  }

  // Question flow
  const q = questions[qIdx]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontSize: 11, opacity: 0.4 }}>
        {t.questionOf(qIdx + 1, questions.length)}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>{q}</div>
      <textarea
        autoFocus
        value={answers[qIdx]}
        onChange={e => setAnswers(a => { const n = [...a]; n[qIdx] = e.target.value; return n })}
        rows={4}
        placeholder={t.writePlaceholder}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid rgba(255,255,255,0.12)`,
          borderRadius: 14,
          padding: '12px 14px',
          color: 'inherit',
          fontSize: 14,
          fontFamily: 'Georgia, serif',
          lineHeight: 1.7,
          resize: 'none',
          outline: 'none',
        }}
      />
      <button onClick={next} style={btnStyle(accent)}>
        {qIdx < questions.length - 1 ? t.next : t.cont}
      </button>
      <button onClick={skip} style={skipStyle}>{t.skip}</button>
    </div>
  )
}

const btnStyle = (accent: string): React.CSSProperties => ({
  padding: '14px',
  borderRadius: 16,
  border: 'none',
  background: accent,
  color: '#fff',
  fontWeight: 800,
  fontSize: 15,
  cursor: 'pointer',
  fontFamily: 'inherit',
})

const skipStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: 12,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  opacity: 0.4,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
