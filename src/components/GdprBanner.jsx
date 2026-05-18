import { useState, useEffect } from "react";

const CONSENT_KEY = "lumio_analytics_consent";

export function getStoredConsent() {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === null ? null : v === "true";
  } catch {
    return null;
  }
}

export function GdprBanner({ onConsent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored === null) {
      setVisible(true);
    } else {
      onConsent(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function accept() {
    try { localStorage.setItem(CONSENT_KEY, "true"); } catch {}
    setVisible(false);
    onConsent(true);
  }

  function reject() {
    try { localStorage.setItem(CONSENT_KEY, "false"); } catch {}
    setVisible(false);
    onConsent(false);
  }

  function openPrivacy() {
    window.dispatchEvent(new CustomEvent("lumio:privacy"));
  }

  if (!visible) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-label="Consentement cookies">
      <div style={styles.banner}>
        <p style={styles.title}>🍪 Votre vie privée compte</p>
        <p style={styles.text}>
          Lumio utilise des cookies analytiques anonymisés (Google Analytics) pour améliorer
          l&apos;expérience — uniquement avec votre accord.{" "}
          <button style={styles.link} onClick={openPrivacy}>
            Politique de confidentialité
          </button>
        </p>
        <div style={styles.actions}>
          <button style={styles.rejectBtn} onClick={reject}>
            Refuser
          </button>
          <button style={styles.acceptBtn} onClick={accept}>
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: "0 12px 12px",
    pointerEvents: "none",
  },
  banner: {
    maxWidth: 460,
    margin: "0 auto",
    background: "#1a1a2e",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: "16px 18px",
    boxShadow: "0 -4px 32px rgba(0,0,0,0.4)",
    pointerEvents: "all",
  },
  title: {
    margin: "0 0 8px",
    fontSize: 14,
    fontWeight: 700,
    color: "#f9fafb",
  },
  text: {
    margin: "0 0 14px",
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 1.6,
  },
  link: {
    background: "none",
    border: "none",
    color: "#7C9EFF",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
  },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
  },
  rejectBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  acceptBtn: {
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
};
