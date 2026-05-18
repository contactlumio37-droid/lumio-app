const LAST_UPDATED = "18 mai 2026";

const SECTIONS = [
  {
    title: "1. Responsable du traitement",
    content:
      "Lumio App est édité par [Nom du développeur / société], [adresse postale]. " +
      "Pour toute question relative à vos données : privacy@lumio.app.",
  },
  {
    title: "2. Données collectées",
    content:
      "Nous collectons : votre adresse e-mail et identifiant Google (si connexion Google), " +
      "votre prénom et nom (optionnels, renseignés par vous), vos données de suivi personnel " +
      "(humeurs, habitudes, journal — stockées dans votre compte Firestore), " +
      "vos préférences d'application (thème, langue, notifications). " +
      "Ces données sont nécessaires au fonctionnement du service.",
  },
  {
    title: "3. Finalité du traitement",
    content:
      "Vos données sont utilisées pour : fournir et synchroniser le service Lumio sur vos " +
      "appareils, gérer votre abonnement Lumio+ via RevenueCat, améliorer l'application via " +
      "des statistiques d'usage anonymisées (Google Analytics, uniquement avec votre consentement).",
  },
  {
    title: "4. Base légale (RGPD)",
    content:
      "Le traitement de vos données repose sur : l'exécution du contrat (Art. 6.1.b) pour " +
      "les données nécessaires au service, et votre consentement (Art. 6.1.a) pour les " +
      "cookies analytiques. Vous pouvez retirer votre consentement à tout moment.",
  },
  {
    title: "5. Durée de conservation",
    content:
      "Vos données sont conservées tant que votre compte est actif. En cas de suppression " +
      "de compte, l'ensemble de vos données personnelles est effacé dans un délai de 30 jours. " +
      "Les données de facturation sont conservées 5 ans conformément aux obligations légales.",
  },
  {
    title: "6. Vos droits (RGPD Art. 15-22)",
    content:
      "Vous disposez d'un droit d'accès, de rectification, d'effacement (droit à l'oubli), " +
      "de portabilité et d'opposition sur vos données. Vous pouvez supprimer votre compte " +
      "directement depuis Paramètres > Supprimer mon compte. Pour toute autre demande : " +
      "privacy@lumio.app. Vous pouvez également introduire une réclamation auprès de la CNIL.",
  },
  {
    title: "7. Partage des données",
    content:
      "Vos données sont hébergées sur Google Firebase (serveurs en Europe, certifié ISO 27001). " +
      "La gestion d'abonnement est confiée à RevenueCat. " +
      "Nous ne vendons jamais vos données à des tiers.",
  },
  {
    title: "8. Cookies et traceurs",
    content:
      "Lumio utilise des cookies techniques essentiels (stockage local du navigateur, " +
      "nécessaires au fonctionnement) et, avec votre consentement explicite, Google Analytics " +
      "pour des statistiques anonymisées. Vous gérez vos préférences depuis la bannière de " +
      "consentement ou Paramètres > Confidentialité.",
  },
  {
    title: "9. Sécurité",
    content:
      "Vos données sont chiffrées en transit (HTTPS / TLS 1.3) et protégées au repos sur " +
      "les serveurs Firebase. Des règles de sécurité Firestore garantissent que chaque " +
      "utilisateur n'accède qu'à ses propres données.",
  },
];

export function PrivacyPolicyModal({ onClose, th }) {
  const bg = th?.bg2 || "#16162a";
  const text = th?.text || "#f9fafb";
  const text2 = th?.text2 || "#9ca3af";
  const border = th?.border || "rgba(255,255,255,0.1)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        overflowY: "auto",
        padding: "20px 12px",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Politique de confidentialité"
    >
      <div
        style={{
          maxWidth: 460,
          margin: "0 auto",
          background: bg,
          borderRadius: 20,
          border: `1px solid ${border}`,
          padding: "24px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: text }}>
            Politique de confidentialité
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              color: text2,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 11, color: text2, margin: "0 0 20px" }}>
          Dernière mise à jour : {LAST_UPDATED}
        </p>

        {SECTIONS.map(({ title, content }) => (
          <div key={title} style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: text, margin: "0 0 6px" }}>
              {title}
            </h3>
            <p style={{ fontSize: 12, color: text2, lineHeight: 1.7, margin: 0 }}>{content}</p>
          </div>
        ))}

        <div
          style={{
            borderTop: `1px solid ${border}`,
            paddingTop: 16,
            marginTop: 8,
            fontSize: 12,
            color: text2,
          }}
        >
          Contact :{" "}
          <a href="mailto:privacy@lumio.app" style={{ color: "#7C9EFF" }}>
            privacy@lumio.app
          </a>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
