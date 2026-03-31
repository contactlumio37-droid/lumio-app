import { useState } from "react";
import { useProfile } from "../hooks/useProfile";

const FIREBASE_ERRORS = {
  "auth/invalid-email": "Adresse email invalide.",
  "auth/user-not-found": "Aucun compte trouvé avec cet email.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/email-already-in-use": "Cet email est déjà utilisé.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/network-request-failed": "Erreur réseau. Vérifiez votre connexion.",
  "auth/popup-closed-by-user": "La fenêtre de connexion a été fermée.",
  "auth/cancelled-popup-request": null,
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
};

function formatError(err) {
  const code = err?.code;
  if (code && FIREBASE_ERRORS[code] !== undefined) return FIREBASE_ERRORS[code];
  return err?.message || "Une erreur est survenue. Réessayez.";
}

export function LoginForm() {
  const { login, register, loginWithGoogle } = useProfile();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      const msg = formatError(err);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      const msg = formatError(err);
      if (msg) setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setError(null);
    setEmail("");
    setPassword("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrapper}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={styles.logoText}>Lumio</span>
        </div>

        <h2 style={styles.title}>
          {isRegister ? "Créer un compte" : "Bon retour !"}
        </h2>
        <p style={styles.subtitle}>
          {isRegister
            ? "Rejoignez Lumio dès aujourd'hui"
            : "Connectez-vous à votre espace"}
        </p>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          style={{
            ...styles.googleBtn,
            opacity: googleLoading || loading ? 0.7 : 1,
          }}
        >
          {googleLoading ? (
            <span style={styles.spinner} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span>{googleLoading ? "Connexion..." : "Continuer avec Google"}</span>
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>ou</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#c0392b" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#c0392b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              placeholder={isRegister ? "Minimum 6 caractères" : "Votre mot de passe"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{
              ...styles.submitBtn,
              opacity: loading || googleLoading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <span style={{ ...styles.spinner, borderTopColor: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.3)" }} />
                <span>En cours...</span>
              </>
            ) : (
              isRegister ? "Créer mon compte" : "Se connecter"
            )}
          </button>
        </form>

        <p style={styles.switchText}>
          {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <button type="button" onClick={switchMode} style={styles.switchLink}>
            {isRegister ? "Se connecter" : "S'inscrire gratuitement"}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "1rem",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "2rem",
  },
  logoIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(102,126,234,0.4)",
  },
  logoText: {
    fontSize: "1.6rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 0.3rem",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#6b7280",
    margin: "0 0 1.75rem",
  },
  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    padding: "0.8rem 1rem",
    borderRadius: "12px",
    border: "1.5px solid #e5e7eb",
    background: "#ffffff",
    color: "#374151",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "1.25rem 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },
  dividerText: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "0.8rem 1rem",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "0.95rem",
    color: "#1a1a2e",
    outline: "none",
    transition: "border-color 0.2s",
    background: "#f9fafb",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.85rem",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "0.25rem",
    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
    letterSpacing: "0.01em",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#c0392b",
    fontSize: "0.875rem",
  },
  switchText: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.9rem",
    color: "#6b7280",
    marginBottom: 0,
  },
  switchLink: {
    background: "none",
    border: "none",
    color: "#667eea",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
    textDecorationColor: "transparent",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "2.5px solid rgba(0,0,0,0.15)",
    borderTopColor: "#555",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
  },
};
