interface Props {
  isPlus: boolean
  accent: string
  lang?: string
  onUpgrade: () => void
}

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const LABELS: Record<Lang, {
  title: string
  free: string
  plus: string
  upgrade: string
  current: string
  features: { label: string; free: string; plus: string }[]
}> = {
  fr: {
    title: 'Mon abonnement',
    free: 'Gratuit',
    plus: 'Lumio+',
    upgrade: 'Passer à Lumio+',
    current: 'Plan actuel',
    features: [
      { label: 'Indicateurs actifs', free: 'Max 3', plus: 'Illimité' },
      { label: 'Objectifs simultanés', free: 'Max 2', plus: 'Illimité' },
      { label: 'Entrées journal', free: 'Max 5', plus: 'Illimité' },
      { label: 'Insights Pulse', free: '1/semaine', plus: 'Quotidien' },
      { label: 'Mode Flux', free: '—', plus: '✓' },
      { label: 'Courbes annuelles', free: '—', plus: '✓' },
      { label: 'Tous les thèmes', free: '—', plus: '✓' },
      { label: 'Export CSV / PDF', free: '—', plus: '✓' },
    ],
  },
  en: {
    title: 'My subscription',
    free: 'Free',
    plus: 'Lumio+',
    upgrade: 'Upgrade to Lumio+',
    current: 'Current plan',
    features: [
      { label: 'Active trackers', free: 'Max 3', plus: 'Unlimited' },
      { label: 'Simultaneous goals', free: 'Max 2', plus: 'Unlimited' },
      { label: 'Journal entries', free: 'Max 5', plus: 'Unlimited' },
      { label: 'Pulse insights', free: '1/week', plus: 'Daily' },
      { label: 'Stream mode', free: '—', plus: '✓' },
      { label: 'Annual charts', free: '—', plus: '✓' },
      { label: 'All themes', free: '—', plus: '✓' },
      { label: 'CSV / PDF export', free: '—', plus: '✓' },
    ],
  },
  es: {
    title: 'Mi suscripción',
    free: 'Gratis',
    plus: 'Lumio+',
    upgrade: 'Mejorar a Lumio+',
    current: 'Plan actual',
    features: [
      { label: 'Indicadores activos', free: 'Máx 3', plus: 'Ilimitado' },
      { label: 'Objetivos simultáneos', free: 'Máx 2', plus: 'Ilimitado' },
      { label: 'Entradas de diario', free: 'Máx 5', plus: 'Ilimitado' },
      { label: 'Insights Pulse', free: '1/semana', plus: 'Diario' },
      { label: 'Modo Flujo', free: '—', plus: '✓' },
      { label: 'Curvas anuales', free: '—', plus: '✓' },
      { label: 'Todos los temas', free: '—', plus: '✓' },
      { label: 'Exportar CSV / PDF', free: '—', plus: '✓' },
    ],
  },
  de: {
    title: 'Mein Abonnement',
    free: 'Kostenlos',
    plus: 'Lumio+',
    upgrade: 'Auf Lumio+ upgraden',
    current: 'Aktueller Plan',
    features: [
      { label: 'Aktive Indikatoren', free: 'Max 3', plus: 'Unbegrenzt' },
      { label: 'Gleichzeitige Ziele', free: 'Max 2', plus: 'Unbegrenzt' },
      { label: 'Tagebucheinträge', free: 'Max 5', plus: 'Unbegrenzt' },
      { label: 'Pulse-Einblicke', free: '1/Woche', plus: 'Täglich' },
      { label: 'Stream-Modus', free: '—', plus: '✓' },
      { label: 'Jahres-Diagramme', free: '—', plus: '✓' },
      { label: 'Alle Themes', free: '—', plus: '✓' },
      { label: 'CSV / PDF Export', free: '—', plus: '✓' },
    ],
  },
  it: {
    title: 'Il mio abbonamento',
    free: 'Gratuito',
    plus: 'Lumio+',
    upgrade: 'Passa a Lumio+',
    current: 'Piano attuale',
    features: [
      { label: 'Indicatori attivi', free: 'Max 3', plus: 'Illimitato' },
      { label: 'Obiettivi simultanei', free: 'Max 2', plus: 'Illimitato' },
      { label: 'Voci del diario', free: 'Max 5', plus: 'Illimitato' },
      { label: 'Insight Pulse', free: '1/settimana', plus: 'Quotidiano' },
      { label: 'Modalità Flusso', free: '—', plus: '✓' },
      { label: 'Grafici annuali', free: '—', plus: '✓' },
      { label: 'Tutti i temi', free: '—', plus: '✓' },
      { label: 'Export CSV / PDF', free: '—', plus: '✓' },
    ],
  },
  pt: {
    title: 'Minha assinatura',
    free: 'Grátis',
    plus: 'Lumio+',
    upgrade: 'Atualizar para Lumio+',
    current: 'Plano atual',
    features: [
      { label: 'Indicadores ativos', free: 'Máx 3', plus: 'Ilimitado' },
      { label: 'Objetivos simultâneos', free: 'Máx 2', plus: 'Ilimitado' },
      { label: 'Entradas de diário', free: 'Máx 5', plus: 'Ilimitado' },
      { label: 'Insights Pulse', free: '1/semana', plus: 'Diário' },
      { label: 'Modo Fluxo', free: '—', plus: '✓' },
      { label: 'Gráficos anuais', free: '—', plus: '✓' },
      { label: 'Todos os temas', free: '—', plus: '✓' },
      { label: 'Exportar CSV / PDF', free: '—', plus: '✓' },
    ],
  },
}

export function PlanComparison({ isPlus, accent, lang = 'fr', onUpgrade }: Props) {
  const l = (['fr','en','es','de','it','pt'].includes(lang) ? lang : 'fr') as Lang
  const t = LABELS[l]

  const colStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 800,
    padding: '8px 4px',
    borderRadius: 8,
    background: active ? `${accent}22` : 'transparent',
    color: active ? accent : 'inherit',
    opacity: active ? 1 : 0.5,
  })

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.5, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        {t.title}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 2 }} />
        <div style={colStyle(!isPlus)}>
          {t.free}
          {!isPlus && <div style={{ fontSize: 9, marginTop: 2, opacity: 0.6 }}>{t.current}</div>}
        </div>
        <div style={colStyle(isPlus)}>
          {t.plus}
          {isPlus && <div style={{ fontSize: 9, marginTop: 2, opacity: 0.6 }}>{t.current}</div>}
        </div>
      </div>

      {/* Rows */}
      {t.features.map((f, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 8,
            padding: '8px 0',
            borderBottom: i < t.features.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 2, fontSize: 12, opacity: 0.75 }}>{f.label}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 12, opacity: isPlus ? 0.4 : 0.9 }}>{f.free}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: isPlus ? accent : 'inherit', fontWeight: isPlus ? 700 : 400, opacity: isPlus ? 1 : 0.5 }}>{f.plus}</div>
        </div>
      ))}

      {!isPlus && (
        <button
          onClick={onUpgrade}
          style={{
            width: '100%',
            marginTop: 16,
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
          {t.upgrade}
        </button>
      )}
    </div>
  )
}
