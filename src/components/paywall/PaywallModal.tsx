import { useState, useEffect } from 'react'
import type { CompanionConfig } from '../../services/companionService'
import { CompanionAvatar } from '../companion/CompanionAvatar'

export type PaywallFeature =
  | 'trackers'
  | 'objectives'
  | 'journal'
  | 'flux'
  | 'charts'
  | 'export'
  | 'themes'
  | 'insights'

interface Props {
  feature:   PaywallFeature
  lang?:     string
  config?:   CompanionConfig
  onClose:   () => void
  onUpgrade: () => void
}

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const FEATURE_INFO: Record<PaywallFeature, Record<Lang, { title: string; desc: string }>> = {
  trackers: {
    fr: { title: 'Plus de 3 indicateurs',   desc: 'Suivi illimité : sport, sommeil, hydratation, et tout ce que tu veux.' },
    en: { title: 'More than 3 trackers',    desc: 'Unlimited tracking: sport, sleep, hydration, and anything you want.' },
    es: { title: 'Más de 3 indicadores',    desc: 'Seguimiento ilimitado: deporte, sueño, hidratación y todo lo que quieras.' },
    de: { title: 'Mehr als 3 Indikatoren', desc: 'Unbegrenzte Verfolgung: Sport, Schlaf, Hydration und alles was du willst.' },
    it: { title: 'Più di 3 indicatori',    desc: 'Monitoraggio illimitato: sport, sonno, idratazione e tutto quello che vuoi.' },
    pt: { title: 'Mais de 3 indicadores',  desc: 'Rastreamento ilimitado: esporte, sono, hidratação e tudo que quiser.' },
  },
  objectives: {
    fr: { title: 'Plus de 2 objectifs',  desc: 'Poursuis autant d\'objectifs que tu le souhaites, sans limite.' },
    en: { title: 'More than 2 goals',    desc: 'Pursue as many goals as you like, with no limit.' },
    es: { title: 'Más de 2 objetivos',   desc: 'Persigue tantos objetivos como quieras, sin límite.' },
    de: { title: 'Mehr als 2 Ziele',     desc: 'Verfolge so viele Ziele wie du möchtest, ohne Limit.' },
    it: { title: 'Più di 2 obiettivi',   desc: 'Persegui tutti gli obiettivi che vuoi, senza limiti.' },
    pt: { title: 'Mais de 2 objetivos',  desc: 'Persiga quantos objetivos quiser, sem limite.' },
  },
  journal: {
    fr: { title: 'Journal illimité',      desc: 'Garde trace de tous tes moments — sans limite d\'entrées.' },
    en: { title: 'Unlimited journal',     desc: 'Keep track of all your moments — with no entry limit.' },
    es: { title: 'Diario ilimitado',      desc: 'Guarda todos tus momentos — sin límite de entradas.' },
    de: { title: 'Unbegrenztes Tagebuch', desc: 'Behalte alle deine Momente — ohne Eintrags-Limit.' },
    it: { title: 'Diario illimitato',     desc: 'Tieni traccia di tutti i tuoi momenti — senza limite.' },
    pt: { title: 'Diário ilimitado',      desc: 'Registre todos os seus momentos — sem limite de entradas.' },
  },
  flux: {
    fr: { title: 'Mode Flux',       desc: 'Écriture libre et continue, sans structure — laisse les mots couler.' },
    en: { title: 'Stream mode',     desc: 'Free-flowing writing, no structure — let the words flow.' },
    es: { title: 'Modo Flujo',      desc: 'Escritura libre y continua, sin estructura — deja fluir las palabras.' },
    de: { title: 'Stream-Modus',    desc: 'Freies Schreiben ohne Struktur — lass die Worte fließen.' },
    it: { title: 'Modalità Flusso', desc: 'Scrittura libera e continua, senza struttura — lascia scorrere le parole.' },
    pt: { title: 'Modo Fluxo',      desc: 'Escrita livre e contínua, sem estrutura — deixe as palavras fluírem.' },
  },
  charts: {
    fr: { title: 'Courbes & tendances annuelles', desc: 'Vois l\'évolution de tes données sur toute l\'année.' },
    en: { title: 'Annual charts & trends',        desc: 'See how your data evolves across the full year.' },
    es: { title: 'Curvas y tendencias anuales',   desc: 'Ve cómo evolucionan tus datos a lo largo del año.' },
    de: { title: 'Jahres-Diagramme & Trends',     desc: 'Sieh wie sich deine Daten über das gesamte Jahr entwickeln.' },
    it: { title: 'Grafici e tendenze annuali',    desc: 'Vedi come evolvono i tuoi dati durante tutto l\'anno.' },
    pt: { title: 'Gráficos e tendências anuais',  desc: 'Veja como seus dados evoluem ao longo do ano inteiro.' },
  },
  export: {
    fr: { title: 'Export de données', desc: 'Télécharge toutes tes données en CSV ou PDF.' },
    en: { title: 'Data export',       desc: 'Download all your data as CSV or PDF.' },
    es: { title: 'Exportar datos',    desc: 'Descarga todos tus datos en CSV o PDF.' },
    de: { title: 'Datenexport',       desc: 'Lade all deine Daten als CSV oder PDF herunter.' },
    it: { title: 'Esportazione dati', desc: 'Scarica tutti i tuoi dati in CSV o PDF.' },
    pt: { title: 'Exportar dados',    desc: 'Baixe todos os seus dados em CSV ou PDF.' },
  },
  themes: {
    fr: { title: 'Tous les thèmes', desc: 'Accède aux thèmes Sombre et Chaud pour personnaliser ton espace.' },
    en: { title: 'All themes',      desc: 'Unlock Dark and Warm themes to customize your space.' },
    es: { title: 'Todos los temas', desc: 'Accede a los temas Oscuro y Cálido para personalizar tu espacio.' },
    de: { title: 'Alle Themes',     desc: 'Schalte Dunkel- und Warm-Themes frei, um deinen Bereich zu personalisieren.' },
    it: { title: 'Tutti i temi',    desc: 'Accedi ai temi Scuro e Caldo per personalizzare il tuo spazio.' },
    pt: { title: 'Todos os temas',  desc: 'Acesse os temas Escuro e Quente para personalizar seu espaço.' },
  },
  insights: {
    fr: { title: 'Insights quotidiens', desc: 'Reçois les observations de Lumio chaque jour, pas juste une fois par semaine.' },
    en: { title: 'Daily insights',      desc: 'Receive Lumio\'s observations every day, not just once a week.' },
    es: { title: 'Insights diarios',    desc: 'Recibe las observaciones de Lumio cada día, no solo una vez por semana.' },
    de: { title: 'Tägliche Einblicke',  desc: 'Erhalte Lumios Beobachtungen jeden Tag, nicht nur einmal pro Woche.' },
    it: { title: 'Insight quotidiani',  desc: 'Ricevi le osservazioni di Lumio ogni giorno, non solo una volta a settimana.' },
    pt: { title: 'Insights diários',    desc: 'Receba as observações do Lumio todos os dias, não apenas uma vez por semana.' },
  },
}

const UPGRADE_LABEL: Record<Lang, string> = {
  fr: 'Passer à Lumio+',
  en: 'Upgrade to Lumio+',
  es: 'Mejorar a Lumio+',
  de: 'Auf Lumio+ upgraden',
  it: 'Passa a Lumio+',
  pt: 'Atualizar para Lumio+',
}

const LATER_LABEL: Record<Lang, string> = {
  fr: 'Peut-être plus tard',
  en: 'Maybe later',
  es: 'Quizás más tarde',
  de: 'Vielleicht später',
  it: 'Forse più tardi',
  pt: 'Talvez mais tarde',
}

export function PaywallModal({ feature, lang = 'fr', config, onClose, onUpgrade }: Props) {
  const [visible, setVisible] = useState(false)
  const l = (['fr','en','es','de','it','pt'].includes(lang) ? lang : 'fr') as Lang
  const info = FEATURE_INFO[feature][l]

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        background:     visible ? 'rgba(6,4,15,0.85)' : 'rgba(6,4,15,0)',
        display:        'flex',
        alignItems:     'flex-end',
        justifyContent: 'center',
        zIndex:         1000,
        padding:        '0 0 env(safe-area-inset-bottom, 0)',
        transition:     'background 0.3s',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:          '100%',
          maxWidth:       460,
          background:     '#12101f',
          borderRadius:   '24px 24px 0 0',
          border:         '1px solid rgba(124,58,237,0.18)',
          borderBottom:   'none',
          padding:        '0 24px 40px',
          display:        'flex',
          flexDirection:  'column',
          gap:            16,
          textAlign:      'center',
          transform:      visible ? 'translateY(0)' : 'translateY(100%)',
          transition:     'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(196,181,253,0.2)' }} />
        </div>

        {/* Companion avatar or sparkle icon */}
        {config
          ? <div style={{ display: 'flex', justifyContent: 'center' }}><CompanionAvatar config={config} size="md" /></div>
          : <div style={{ fontSize: 36, color: '#7C3AED' }}>✦</div>
        }

        {/* Labels */}
        <div>
          <div style={{
            fontSize:        10,
            letterSpacing:   2,
            textTransform:   'uppercase',
            color:           '#7C3AED',
            fontFamily:      'Syne, sans-serif',
            fontWeight:      700,
            marginBottom:    6,
          }}>
            Lumio+
          </div>
          <div style={{
            fontSize:   20,
            fontWeight: 800,
            color:      '#EDE9FE',
            lineHeight: 1.3,
            fontFamily: 'Syne, sans-serif',
          }}>
            {info.title}
          </div>
        </div>

        <div style={{ fontSize: 14, color: '#C4B5FD', lineHeight: 1.6 }}>
          {info.desc}
        </div>

        {/* Price box */}
        <div style={{
          padding:      '12px',
          borderRadius: 12,
          background:   'rgba(124,58,237,0.1)',
          border:       '1px solid rgba(124,58,237,0.25)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#7C3AED', fontFamily: 'Syne, sans-serif' }}>
            7,99€<span style={{ fontSize: 12, fontWeight: 400, color: '#C4B5FD' }}>/mois</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            ou 59,99€/an (−37%)
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onUpgrade}
          style={{
            padding:       '15px',
            borderRadius:  16,
            border:        'none',
            background:    'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color:         '#fff',
            fontWeight:    800,
            fontSize:      15,
            cursor:        'pointer',
            fontFamily:    'Syne, sans-serif',
            letterSpacing: '0.03em',
          }}
        >
          {UPGRADE_LABEL[l]}
        </button>

        {/* Dismiss */}
        <button
          onClick={onClose}
          style={{
            padding:    '10px',
            border:     'none',
            background: 'transparent',
            color:      '#6B7280',
            fontSize:   14,
            cursor:     'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {LATER_LABEL[l]}
        </button>
      </div>
    </div>
  )
}
