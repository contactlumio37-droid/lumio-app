import { useEffect, useState } from 'react'
import type { CompanionConfig } from '../../services/companionService'
import { CompanionAvatar } from '../companion/CompanionAvatar'
import { RCPackage, RCOfferings } from '../../services/revenuecatService'

interface Props {
  lang?:             string
  config?:           CompanionConfig
  offerings:         RCOfferings | null
  loadingOfferings:  boolean
  purchasing:        boolean
  restoring:         boolean
  onPurchase: (pkg: RCPackage) => Promise<{ success: boolean; entitlementActive: boolean; error?: string }>
  onRestore:  () => Promise<{ success: boolean; entitlementActive: boolean; error?: string }>
  onClose:    () => void
}

type Lang = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

const T: Record<Lang, {
  title:          string
  subtitle:       string
  monthly:        string
  annual:         string
  annualBadge:    string
  cta:            string
  restore:        string
  restoring:      string
  purchasing:     string
  successTitle:   string
  successSub:     string
  errorCancelled: string
  errorGeneric:   string
  cgu:            string
  perMonth:       string
  perYear:        string
}> = {
  fr: {
    title:          'Lumio+',
    subtitle:       'Débloque tout. Vis mieux.',
    monthly:        'Mensuel',
    annual:         'Annuel',
    annualBadge:    '−37%',
    cta:            'Commencer',
    restore:        'Restaurer mes achats',
    restoring:      'Restauration…',
    purchasing:     'Traitement…',
    successTitle:   'Bienvenue dans Lumio+ !',
    successSub:     'Ton abonnement est actif.',
    errorCancelled: 'Achat annulé.',
    errorGeneric:   'Une erreur est survenue. Réessaie.',
    cgu:            'Conditions générales · Politique de confidentialité',
    perMonth:       '/mois',
    perYear:        '/an',
  },
  en: {
    title:          'Lumio+',
    subtitle:       'Unlock everything. Live better.',
    monthly:        'Monthly',
    annual:         'Annual',
    annualBadge:    '−37%',
    cta:            'Get started',
    restore:        'Restore purchases',
    restoring:      'Restoring…',
    purchasing:     'Processing…',
    successTitle:   'Welcome to Lumio+!',
    successSub:     'Your subscription is active.',
    errorCancelled: 'Purchase cancelled.',
    errorGeneric:   'An error occurred. Please try again.',
    cgu:            'Terms of service · Privacy policy',
    perMonth:       '/mo',
    perYear:        '/yr',
  },
  es: {
    title:          'Lumio+',
    subtitle:       'Desbloquea todo. Vive mejor.',
    monthly:        'Mensual',
    annual:         'Anual',
    annualBadge:    '−37%',
    cta:            'Comenzar',
    restore:        'Restaurar compras',
    restoring:      'Restaurando…',
    purchasing:     'Procesando…',
    successTitle:   '¡Bienvenido a Lumio+!',
    successSub:     'Tu suscripción está activa.',
    errorCancelled: 'Compra cancelada.',
    errorGeneric:   'Ocurrió un error. Inténtalo de nuevo.',
    cgu:            'Términos de servicio · Política de privacidad',
    perMonth:       '/mes',
    perYear:        '/año',
  },
  de: {
    title:          'Lumio+',
    subtitle:       'Alles freischalten. Besser leben.',
    monthly:        'Monatlich',
    annual:         'Jährlich',
    annualBadge:    '−37%',
    cta:            'Loslegen',
    restore:        'Käufe wiederherstellen',
    restoring:      'Wiederherstellung…',
    purchasing:     'Verarbeitung…',
    successTitle:   'Willkommen bei Lumio+!',
    successSub:     'Dein Abonnement ist aktiv.',
    errorCancelled: 'Kauf abgebrochen.',
    errorGeneric:   'Ein Fehler ist aufgetreten. Versuche es erneut.',
    cgu:            'Nutzungsbedingungen · Datenschutzrichtlinie',
    perMonth:       '/Monat',
    perYear:        '/Jahr',
  },
  it: {
    title:          'Lumio+',
    subtitle:       'Sblocca tutto. Vivi meglio.',
    monthly:        'Mensile',
    annual:         'Annuale',
    annualBadge:    '−37%',
    cta:            'Inizia',
    restore:        'Ripristina acquisti',
    restoring:      'Ripristino…',
    purchasing:     'Elaborazione…',
    successTitle:   'Benvenuto in Lumio+!',
    successSub:     'Il tuo abbonamento è attivo.',
    errorCancelled: 'Acquisto annullato.',
    errorGeneric:   'Si è verificato un errore. Riprova.',
    cgu:            'Termini di servizio · Informativa sulla privacy',
    perMonth:       '/mese',
    perYear:        '/anno',
  },
  pt: {
    title:          'Lumio+',
    subtitle:       'Desbloqueie tudo. Viva melhor.',
    monthly:        'Mensal',
    annual:         'Anual',
    annualBadge:    '−37%',
    cta:            'Começar',
    restore:        'Restaurar compras',
    restoring:      'Restaurando…',
    purchasing:     'Processando…',
    successTitle:   'Bem-vindo ao Lumio+!',
    successSub:     'Sua assinatura está ativa.',
    errorCancelled: 'Compra cancelada.',
    errorGeneric:   'Ocorreu um erro. Tente novamente.',
    cgu:            'Termos de serviço · Política de privacidade',
    perMonth:       '/mês',
    perYear:        '/ano',
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

const CONFETTI = [
  { left: '8%',  delay: '0s',    dur: '1.6s', color: '#7C3AED', size: 8 },
  { left: '22%', delay: '0.12s', dur: '1.9s', color: '#F59E0B', size: 6 },
  { left: '45%', delay: '0.22s', dur: '1.7s', color: '#14B8A6', size: 7 },
  { left: '62%', delay: '0.08s', dur: '2.0s', color: '#F43F5E', size: 5 },
  { left: '80%', delay: '0.18s', dur: '1.8s', color: '#4F46E5', size: 8 },
  { left: '35%', delay: '0.32s', dur: '1.5s', color: '#C4B5FD', size: 6 },
]

export function getPackagePrice(pkg: RCPackage): string {
  try {
    return pkg?.product?.priceString ?? pkg?.product?.price ?? ''
  } catch {
    return ''
  }
}

export function isAnnualPackage(pkg: RCPackage): boolean {
  try {
    const id: string = pkg?.packageType ?? pkg?.identifier ?? ''
    return id.toLowerCase().includes('annual') || id.toLowerCase().includes('yearly') || id === '$rc_annual'
  } catch {
    return false
  }
}

export function PurchaseScreen({
  lang = 'fr',
  config,
  offerings,
  loadingOfferings,
  purchasing,
  restoring,
  onPurchase,
  onRestore,
  onClose,
}: Props) {
  const [visible,  setVisible]  = useState(false)
  const [selected, setSelected] = useState<RCPackage | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)

  const l        = (['fr', 'en', 'es', 'de', 'it', 'pt'].includes(lang) ? lang : 'fr') as Lang
  const t        = T[l]
  const features = FEATURES[l]
  const packages: RCPackage[] = offerings?.current?.availablePackages ?? []

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

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
      <div style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(6,4,15,0.9)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         1100,
        padding:        24,
      }}>
        <div style={{
          background:   '#12101f',
          borderRadius: 24,
          padding:      '40px 28px',
          textAlign:    'center',
          maxWidth:     360,
          width:        '100%',
          position:     'relative',
          overflow:     'hidden',
          border:       '1px solid rgba(124,58,237,0.2)',
        }}>
          {/* Confetti particles */}
          {CONFETTI.map((c, i) => (
            <div
              key={i}
              style={{
                position:  'absolute',
                bottom:    '15%',
                left:      c.left,
                width:     c.size,
                height:    c.size,
                borderRadius: '50%',
                background: c.color,
                animation: `lumio-particle-rise ${c.dur} ${c.delay} ease-out forwards`,
              }}
            />
          ))}

          {config
            ? <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <CompanionAvatar config={{ ...config, state: 'proud' }} size="xl" />
              </div>
            : <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
          }

          <div style={{
            fontSize:    22,
            fontWeight:  800,
            background:  'linear-gradient(135deg, #7C3AED, #4F46E5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
            fontFamily:  'Syne, sans-serif',
          }}>
            {t.successTitle}
          </div>
          <div style={{ fontSize: 14, color: '#C4B5FD', marginBottom: 28 }}>{t.successSub}</div>
          <button
            onClick={onClose}
            style={{
              width:         '100%',
              padding:       '14px',
              borderRadius:  16,
              border:        'none',
              background:    'linear-gradient(135deg, #7C3AED, #4F46E5)',
              color:         '#fff',
              fontWeight:    800,
              fontSize:      15,
              cursor:        'pointer',
              fontFamily:    'Syne, sans-serif',
            }}
          >
            OK
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        background:     visible ? 'rgba(6,4,15,0.9)' : 'rgba(6,4,15,0)',
        display:        'flex',
        alignItems:     'flex-end',
        justifyContent: 'center',
        zIndex:         1100,
        padding:        '0 0 env(safe-area-inset-bottom, 0)',
        transition:     'background 0.3s',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:         '100%',
          maxWidth:      480,
          background:    '#12101f',
          borderRadius:  '24px 24px 0 0',
          border:        '1px solid rgba(124,58,237,0.15)',
          borderBottom:  'none',
          padding:       '0 20px 32px',
          display:       'flex',
          flexDirection: 'column',
          gap:           16,
          maxHeight:     '90vh',
          overflowY:     'auto',
          transform:     visible ? 'translateY(0)' : 'translateY(100%)',
          transition:    'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(196,181,253,0.2)' }} />
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          {config && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <CompanionAvatar config={config} size="lg" />
            </div>
          )}
          <div style={{
            fontSize:    22,
            fontWeight:  800,
            background:  'linear-gradient(135deg, #7C3AED, #4F46E5)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily:  'Syne, sans-serif',
          }}>
            {t.title}
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{t.subtitle}</div>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#EDE9FE', opacity: 0.85 }}>
              <span style={{
                color:       '#7C3AED',
                fontWeight:  800,
                fontFamily:  'Syne, sans-serif',
                fontSize:    14,
              }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        {/* Plans */}
        {loadingOfferings ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[72, 56].map((h, i) => (
              <div
                key={i}
                className="lumio-progress-active"
                style={{
                  height:       h,
                  borderRadius: 14,
                  opacity:      0.18,
                }}
              />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: t.annual,  price: '59,99€', per: t.perYear,  badge: t.annualBadge, isAnnual: true  },
              { label: t.monthly, price: '7,99€',  per: t.perMonth, badge: null,          isAnnual: false },
            ].map(opt => (
              <div
                key={opt.label}
                style={{
                  padding:         '14px 16px',
                  borderRadius:    14,
                  border:          `2px solid ${opt.isAnnual ? '#7C3AED' : 'rgba(124,58,237,0.25)'}`,
                  background:      opt.isAnnual ? 'rgba(124,58,237,0.1)' : 'transparent',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#EDE9FE' }}>{opt.label}</div>
                  {opt.badge && <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700, marginTop: 2 }}>{opt.badge}</div>}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: opt.isAnnual ? '#7C3AED' : '#EDE9FE', fontFamily: 'Syne, sans-serif' }}>
                  {opt.price}<span style={{ fontSize: 11, fontWeight: 400, color: '#6B7280' }}>{opt.per}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {packages.map((pkg: RCPackage, i: number) => {
              const isAnnual   = isAnnualPackage(pkg)
              const isSelected = selected === pkg
              return (
                <div
                  key={i}
                  onClick={() => setSelected(pkg)}
                  style={{
                    padding:        '14px 16px',
                    borderRadius:   14,
                    border:         `2px solid ${isSelected ? '#7C3AED' : 'rgba(124,58,237,0.25)'}`,
                    background:     isSelected ? 'rgba(124,58,237,0.1)' : 'transparent',
                    cursor:         'pointer',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#EDE9FE' }}>{isAnnual ? t.annual : t.monthly}</div>
                    {isAnnual && <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700, marginTop: 2 }}>{t.annualBadge}</div>}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isSelected ? '#7C3AED' : '#EDE9FE', fontFamily: 'Syne, sans-serif' }}>
                    {getPackagePrice(pkg)}<span style={{ fontSize: 11, fontWeight: 400, color: '#6B7280' }}>{isAnnual ? t.perYear : t.perMonth}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {error && <div style={{ color: '#F43F5E', fontSize: 13, textAlign: 'center' }}>{error}</div>}

        {/* CTA */}
        <button
          onClick={handlePurchase}
          disabled={purchasing || restoring || (!selected && packages.length > 0)}
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
            opacity:       purchasing || restoring ? 0.6 : 1,
            letterSpacing: '0.03em',
          }}
        >
          {purchasing ? t.purchasing : t.cta}
        </button>

        {/* Restore */}
        <button
          onClick={handleRestore}
          disabled={purchasing || restoring}
          style={{
            padding:    '10px',
            border:     'none',
            background: 'transparent',
            color:      '#6B7280',
            fontSize:   13,
            cursor:     'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {restoring ? t.restoring : t.restore}
        </button>

        {/* CGU */}
        <div style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', lineHeight: 1.5, opacity: 0.6 }}>
          {t.cgu}
        </div>
      </div>
    </div>
  )
}
