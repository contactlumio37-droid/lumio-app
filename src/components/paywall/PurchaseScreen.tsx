import { useEffect, useState } from 'react'
import { RCPackage, RCOfferings } from '../../services/revenuecatService'

interface Props {
  accent: string
  lang?: string
  offerings: RCOfferings | null
  loadingOfferings: boolean
  purchasing: boolean
  restoring: boolean
  onPurchase: (pkg: RCPackage) => Promise<{ success: boolean; entitlementActive: boolean; error?: string }>
  onRestore: () => Promise<{ success: boolean; entitlementActive: boolean; error?: string }>
  onClose: () => void
  companionAssetPath?: string
}

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const T: Record<Lang, {
  title: string
  subtitle: string
  monthly: string
  annual: string
  annualBadge: string
  cta: string
  restore: string
  restoring: string
  purchasing: string
  successTitle: string
  successSub: string
  errorCancelled: string
  errorGeneric: string
  cgu: string
  perMonth: string
  perYear: string
  saving: string
}> = {
  fr: {
    title: 'Lumio+',
    subtitle: 'Débloque tout. Vis mieux.',
    monthly: 'Mensuel',
    annual: 'Annuel',
    annualBadge: '−37%',
    cta: 'Commencer',
    restore: 'Restaurer mes achats',
    restoring: 'Restauration…',
    purchasing: 'Traitement…',
    successTitle: 'Bienvenue dans Lumio+ !',
    successSub: 'Ton abonnement est actif.',
    errorCancelled: 'Achat annulé.',
    errorGeneric: 'Une erreur est survenue. Réessaie.',
    cgu: 'Conditions générales · Politique de confidentialité',
    perMonth: '/mois',
    perYear: '/an',
    saving: 'économise',
  },
  en: {
    title: 'Lumio+',
    subtitle: 'Unlock everything. Live better.',
    monthly: 'Monthly',
    annual: 'Annual',
    annualBadge: '−37%',
    cta: 'Get started',
    restore: 'Restore purchases',
    restoring: 'Restoring…',
    purchasing: 'Processing…',
    successTitle: 'Welcome to Lumio+!',
    successSub: 'Your subscription is active.',
    errorCancelled: 'Purchase cancelled.',
    errorGeneric: 'An error occurred. Please try again.',
    cgu: 'Terms of service · Privacy policy',
    perMonth: '/mo',
    perYear: '/yr',
    saving: 'save',
  },
  es: {
    title: 'Lumio+',
    subtitle: 'Desbloquea todo. Vive mejor.',
    monthly: 'Mensual',
    annual: 'Anual',
    annualBadge: '−37%',
    cta: 'Comenzar',
    restore: 'Restaurar compras',
    restoring: 'Restaurando…',
    purchasing: 'Procesando…',
    successTitle: '¡Bienvenido a Lumio+!',
    successSub: 'Tu suscripción está activa.',
    errorCancelled: 'Compra cancelada.',
    errorGeneric: 'Ocurrió un error. Inténtalo de nuevo.',
    cgu: 'Términos de servicio · Política de privacidad',
    perMonth: '/mes',
    perYear: '/año',
    saving: 'ahorra',
  },
  de: {
    title: 'Lumio+',
    subtitle: 'Alles freischalten. Besser leben.',
    monthly: 'Monatlich',
    annual: 'Jährlich',
    annualBadge: '−37%',
    cta: 'Loslegen',
    restore: 'Käufe wiederherstellen',
    restoring: 'Wiederherstellung…',
    purchasing: 'Verarbeitung…',
    successTitle: 'Willkommen bei Lumio+!',
    successSub: 'Dein Abonnement ist aktiv.',
    errorCancelled: 'Kauf abgebrochen.',
    errorGeneric: 'Ein Fehler ist aufgetreten. Versuche es erneut.',
    cgu: 'Nutzungsbedingungen · Datenschutzrichtlinie',
    perMonth: '/Monat',
    perYear: '/Jahr',
    saving: 'spare',
  },
  it: {
    title: 'Lumio+',
    subtitle: 'Sblocca tutto. Vivi meglio.',
    monthly: 'Mensile',
    annual: 'Annuale',
    annualBadge: '−37%',
    cta: 'Inizia',
    restore: 'Ripristina acquisti',
    restoring: 'Ripristino…',
    purchasing: 'Elaborazione…',
    successTitle: 'Benvenuto in Lumio+!',
    successSub: 'Il tuo abbonamento è attivo.',
    errorCancelled: 'Acquisto annullato.',
    errorGeneric: 'Si è verificato un errore. Riprova.',
    cgu: 'Termini di servizio · Informativa sulla privacy',
    perMonth: '/mese',
    perYear: '/anno',
    saving: 'risparmia',
  },
  pt: {
    title: 'Lumio+',
    subtitle: 'Desbloqueie tudo. Viva melhor.',
    monthly: 'Mensal',
    annual: 'Anual',
    annualBadge: '−37%',
    cta: 'Começar',
    restore: 'Restaurar compras',
    restoring: 'Restaurando…',
    purchasing: 'Processando…',
    successTitle: 'Bem-vindo ao Lumio+!',
    successSub: 'Sua assinatura está ativa.',
    errorCancelled: 'Compra cancelada.',
    errorGeneric: 'Ocorreu um erro. Tente novamente.',
    cgu: 'Termos de serviço · Política de privacidade',
    perMonth: '/mês',
    perYear: '/ano',
    saving: 'economize',
  },
}

const FEATURES: Record<Lang, string[]> = {
  fr: ['Indicateurs illimités', 'Objectifs illimités', 'Journal illimité', 'Mode Flux', 'Courbes annuelles', 'Tous les thèmes', 'Export CSV/PDF', 'Insights quotidiens'],
  en: ['Unlimited trackers', 'Unlimited goals', 'Unlimited journal', 'Stream mode', 'Annual charts', 'All themes', 'CSV/PDF export', 'Daily insights'],
  es: ['Indicadores ilimitados', 'Objetivos ilimitados', 'Diario ilimitado', 'Modo Flujo', 'Gráficos anuales', 'Todos los temas', 'Exportar CSV/PDF', 'Insights diarios'],
  de: ['Unbegrenzte Indikatoren', 'Unbegrenzte Ziele', 'Unbegrenztes Tagebuch', 'Stream-Modus', 'Jahres-Diagramme', 'Alle Themes', 'CSV/PDF-Export', 'Tägliche Einblicke'],
  it: ['Indicatori illimitati', 'Obiettivi illimitati', 'Diario illimitato', 'Modalità Flusso', 'Grafici annuali', 'Tutti i temi', 'Export CSV/PDF', 'Insight quotidiani'],
  pt: ['Indicadores ilimitados', 'Objetivos ilimitados', 'Diário ilimitado', 'Modo Fluxo', 'Gráficos anuais', 'Todos os temas', 'Exportar CSV/PDF', 'Insights diários'],
}

function getPackagePrice(pkg: RCPackage): string {
  try {
    return pkg?.product?.priceString ?? pkg?.product?.price ?? ''
  } catch {
    return ''
  }
}

function isAnnualPackage(pkg: RCPackage): boolean {
  try {
    const id: string = pkg?.packageType ?? pkg?.identifier ?? ''
    return id.toLowerCase().includes('annual') || id.toLowerCase().includes('yearly') || id === '$rc_annual'
  } catch {
    return false
  }
}

export function PurchaseScreen({
  accent,
  lang = 'fr',
  offerings,
  loadingOfferings,
  purchasing,
  restoring,
  onPurchase,
  onRestore,
  onClose,
  companionAssetPath,
}: Props) {
  const l = (['fr', 'en', 'es', 'de', 'it', 'pt'].includes(lang) ? lang : 'fr') as Lang
  const t = T[l]
  const features = FEATURES[l]

  const [selected, setSelected] = useState<RCPackage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const packages: RCPackage[] = offerings?.current?.availablePackages ?? []

  useEffect(() => {
    if (packages.length > 0 && !selected) {
      const annual = packages.find(isAnnualPackage)
      setSelected(annual ?? packages[0])
    }
  }, [packages, selected])

  async function handlePurchase() {
    if (!selected) return
    setError(null)
    const result = await onPurchase(selected)
    if (result.entitlementActive) {
      setSuccess(true)
    } else if (result.error === 'cancelled') {
      setError(t.errorCancelled)
    } else if (result.error) {
      setError(t.errorGeneric)
    }
  }

  async function handleRestore() {
    setError(null)
    const result = await onRestore()
    if (result.entitlementActive) {
      setSuccess(true)
    } else {
      setError(t.errorGeneric)
    }
  }

  if (success) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 24 }}>
        <div style={{ background: '#1a1a2e', borderRadius: 24, padding: '40px 28px', textAlign: 'center', maxWidth: 360, width: '100%' }}>
          {companionAssetPath && (
            <img src={companionAssetPath} alt="" style={{ width: 100, height: 100, objectFit: 'contain', marginBottom: 16 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: accent, marginBottom: 8 }}>{t.successTitle}</div>
          <div style={{ fontSize: 14, opacity: 0.65, color: '#fff', marginBottom: 28 }}>{t.successSub}</div>
          <button onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', background: accent, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
            OK
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1100, padding: '0 0 env(safe-area-inset-bottom, 0)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#1a1a2e', borderRadius: '24px 24px 0 0', padding: '28px 20px 32px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>✦</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>{t.title}</div>
          <div style={{ fontSize: 14, opacity: 0.6, color: '#fff', marginTop: 4 }}>{t.subtitle}</div>
        </div>

        {/* Features list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#fff', opacity: 0.85 }}>
              <span style={{ color: accent, fontWeight: 800 }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        {/* Plans */}
        {loadingOfferings ? (
          <div style={{ textAlign: 'center', opacity: 0.5, color: '#fff', fontSize: 14, padding: '12px 0' }}>…</div>
        ) : packages.length === 0 ? (
          /* Fallback static prices when no offerings loaded */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: t.annual, price: '59,99€', per: t.perYear, badge: t.annualBadge, isAnnual: true },
              { label: t.monthly, price: '7,99€', per: t.perMonth, badge: null, isAnnual: false },
            ].map(opt => (
              <div key={opt.label} style={{ padding: '14px 16px', borderRadius: 14, border: `2px solid ${accent}${opt.isAnnual ? 'ff' : '44'}`, background: opt.isAnnual ? `${accent}18` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{opt.label}</div>
                  {opt.badge && <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginTop: 2 }}>{opt.badge}</div>}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: opt.isAnnual ? accent : '#fff' }}>
                  {opt.price}<span style={{ fontSize: 11, fontWeight: 400 }}>{opt.per}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {packages.map((pkg: RCPackage, i: number) => {
              const isAnnual = isAnnualPackage(pkg)
              const isSelected = selected === pkg
              return (
                <div key={i} onClick={() => setSelected(pkg)} style={{ padding: '14px 16px', borderRadius: 14, border: `2px solid ${isSelected ? accent : accent + '44'}`, background: isSelected ? `${accent}18` : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{isAnnual ? t.annual : t.monthly}</div>
                    {isAnnual && <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginTop: 2 }}>{t.annualBadge}</div>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? accent : '#fff' }}>
                    {getPackagePrice(pkg)}<span style={{ fontSize: 11, fontWeight: 400 }}>{isAnnual ? t.perYear : t.perMonth}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {error && <div style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center' }}>{error}</div>}

        {/* CTA */}
        <button
          onClick={handlePurchase}
          disabled={purchasing || restoring || (!selected && packages.length > 0)}
          style={{ padding: '15px', borderRadius: 16, border: 'none', background: accent, color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', opacity: purchasing || restoring ? 0.6 : 1 }}
        >
          {purchasing ? t.purchasing : t.cta}
        </button>

        {/* Restore */}
        <button
          onClick={handleRestore}
          disabled={purchasing || restoring}
          style={{ padding: '10px', border: 'none', background: 'transparent', color: '#fff', opacity: 0.45, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {restoring ? t.restoring : t.restore}
        </button>

        {/* CGU */}
        <div style={{ fontSize: 10, opacity: 0.3, color: '#fff', textAlign: 'center', lineHeight: 1.5 }}>
          {t.cgu}
        </div>
      </div>
    </div>
  )
}
