import { useState, useMemo } from "react";
import { useAuthSupabase } from "../context/AuthContext.tsx";

// Minimal i18n for the login screen (before user language preference is known)
const LOGIN_I18N = {
  fr: {
    welcomeBack: "Bon retour !",
    createAccount: "Créer un compte",
    joinToday: "Rejoignez Lumio dès aujourd'hui",
    loginPrompt: "Connectez-vous à votre espace",
    continueGoogle: "Continuer avec Google",
    connecting: "Connexion...",
    email: "Email",
    emailPlaceholder: "vous@exemple.com",
    password: "Mot de passe",
    passwordPlaceholder: "Votre mot de passe",
    passwordMinHint: "Minimum 6 caractères",
    forgotPassword: "Mot de passe oublié ?",
    resetSent: "✓ Email envoyé ! Vérifiez votre boîte mail.",
    resetError: "Impossible d'envoyer l'email. Vérifiez l'adresse.",
    submit: "Se connecter",
    submitCreate: "Créer mon compte",
    submitting: "En cours...",
    switchToRegister: "S'inscrire gratuitement",
    switchToLogin: "Se connecter",
    noAccount: "Pas encore de compte ?",
    hasAccount: "Déjà un compte ?",
  },
  en: {
    welcomeBack: "Welcome back!",
    createAccount: "Create an account",
    joinToday: "Join Lumio today",
    loginPrompt: "Sign in to your account",
    continueGoogle: "Continue with Google",
    connecting: "Connecting...",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Your password",
    passwordMinHint: "Minimum 6 characters",
    forgotPassword: "Forgot password?",
    resetSent: "✓ Email sent! Check your inbox.",
    resetError: "Could not send email. Please check the address.",
    submit: "Sign in",
    submitCreate: "Create my account",
    submitting: "Loading...",
    switchToRegister: "Sign up for free",
    switchToLogin: "Sign in",
    noAccount: "No account yet?",
    hasAccount: "Already have an account?",
  },
  es: {
    welcomeBack: "¡Bienvenido de nuevo!",
    createAccount: "Crear una cuenta",
    joinToday: "Únete a Lumio hoy",
    loginPrompt: "Inicia sesión en tu cuenta",
    continueGoogle: "Continuar con Google",
    connecting: "Conectando...",
    email: "Email",
    emailPlaceholder: "tú@ejemplo.com",
    password: "Contraseña",
    passwordPlaceholder: "Tu contraseña",
    passwordMinHint: "Mínimo 6 caracteres",
    forgotPassword: "¿Olvidaste tu contraseña?",
    resetSent: "✓ ¡Email enviado! Revisa tu bandeja de entrada.",
    resetError: "No se pudo enviar el email. Verifica la dirección.",
    submit: "Iniciar sesión",
    submitCreate: "Crear mi cuenta",
    submitting: "En curso...",
    switchToRegister: "Registrarse gratis",
    switchToLogin: "Iniciar sesión",
    noAccount: "¿Aún no tienes cuenta?",
    hasAccount: "¿Ya tienes cuenta?",
  },
  de: {
    welcomeBack: "Willkommen zurück!",
    createAccount: "Konto erstellen",
    joinToday: "Jetzt Lumio beitreten",
    loginPrompt: "Melde dich bei deinem Konto an",
    continueGoogle: "Mit Google fortfahren",
    connecting: "Verbinden...",
    email: "E-Mail",
    emailPlaceholder: "du@beispiel.de",
    password: "Passwort",
    passwordPlaceholder: "Dein Passwort",
    passwordMinHint: "Mindestens 6 Zeichen",
    forgotPassword: "Passwort vergessen?",
    resetSent: "✓ E-Mail gesendet! Überprüfe deinen Posteingang.",
    resetError: "E-Mail konnte nicht gesendet werden. Adresse prüfen.",
    submit: "Anmelden",
    submitCreate: "Konto erstellen",
    submitting: "Laden...",
    switchToRegister: "Kostenlos registrieren",
    switchToLogin: "Anmelden",
    noAccount: "Noch kein Konto?",
    hasAccount: "Bereits ein Konto?",
  },
  it: {
    welcomeBack: "Bentornato!",
    createAccount: "Crea un account",
    joinToday: "Unisciti a Lumio oggi",
    loginPrompt: "Accedi al tuo account",
    continueGoogle: "Continua con Google",
    connecting: "Connessione...",
    email: "Email",
    emailPlaceholder: "tu@esempio.it",
    password: "Password",
    passwordPlaceholder: "La tua password",
    passwordMinHint: "Minimo 6 caratteri",
    forgotPassword: "Password dimenticata?",
    resetSent: "✓ Email inviata! Controlla la tua casella.",
    resetError: "Impossibile inviare l'email. Verifica l'indirizzo.",
    submit: "Accedi",
    submitCreate: "Crea il mio account",
    submitting: "Caricamento...",
    switchToRegister: "Registrati gratis",
    switchToLogin: "Accedi",
    noAccount: "Non hai ancora un account?",
    hasAccount: "Hai già un account?",
  },
  pt: {
    welcomeBack: "Bem-vindo de volta!",
    createAccount: "Criar uma conta",
    joinToday: "Junte-se ao Lumio hoje",
    loginPrompt: "Entre na sua conta",
    continueGoogle: "Continuar com o Google",
    connecting: "Conectando...",
    email: "Email",
    emailPlaceholder: "voce@exemplo.com",
    password: "Senha",
    passwordPlaceholder: "Sua senha",
    passwordMinHint: "Mínimo 6 caracteres",
    forgotPassword: "Esqueceu a senha?",
    resetSent: "✓ Email enviado! Verifique sua caixa de entrada.",
    resetError: "Não foi possível enviar o email. Verifique o endereço.",
    submit: "Entrar",
    submitCreate: "Criar minha conta",
    submitting: "Carregando...",
    switchToRegister: "Cadastre-se gratuitamente",
    switchToLogin: "Entrar",
    noAccount: "Ainda não tem uma conta?",
    hasAccount: "Já tem uma conta?",
  },
};

const SUPPORTED_LANGS = Object.keys(LOGIN_I18N);

function detectLang() {
  try {
    const nav = navigator.language || navigator.userLanguage || "fr";
    const code = nav.split("-")[0].toLowerCase();
    return SUPPORTED_LANGS.includes(code) ? code : "en";
  } catch {
    return "fr";
  }
}

const SUPABASE_ERRORS = [
  { match: "Invalid login credentials",           fr: "Email ou mot de passe incorrect.",                        en: "Incorrect email or password." },
  { match: "User already registered",             fr: "Cet email est déjà utilisé.",                             en: "This email is already in use." },
  { match: "Password should be at least",         fr: "Le mot de passe doit contenir au moins 6 caractères.",   en: "Password must be at least 6 characters." },
  { match: "Email not confirmed",                 fr: "Veuillez confirmer votre email.",                         en: "Please confirm your email." },
  { match: "popup_closed_by_user",                fr: "La fenêtre de connexion a été fermée.",                   en: "Sign-in window was closed." },
  { match: "too many",                            fr: "Trop de tentatives. Réessayez dans quelques minutes.",    en: "Too many attempts. Try again in a few minutes." },
];

function formatError(err, lang) {
  const msg = err?.message || "";
  const entry = SUPABASE_ERRORS.find(e => msg.toLowerCase().includes(e.match.toLowerCase()));
  if (entry) return entry[lang] || entry.en;
  return msg || "Une erreur est survenue. Réessayez.";
}

export function LoginForm() {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuthSupabase();
  const lang = useMemo(detectLang, []);
  const t = LOGIN_I18N[lang] || LOGIN_I18N.en;

  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const msg = formatError(err, lang);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = formatError(err, lang);
      if (msg) setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError(lang === "fr" ? "Saisissez votre email ci-dessus d'abord." : "Enter your email above first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch {
      setError(t.resetError);
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setIsForgot(false);
    setResetSent(false);
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
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="white"
                stroke="white"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span style={styles.logoText}>Lumio</span>
        </div>

        <h2 style={styles.title}>
          {isRegister ? t.createAccount : t.welcomeBack}
        </h2>
        <p style={styles.subtitle}>
          {isRegister ? t.joinToday : t.loginPrompt}
        </p>

        {/* Google Button */}
        {!isForgot && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              style={{ ...styles.googleBtn, opacity: googleLoading || loading ? 0.7 : 1 }}
            >
              {googleLoading ? (
                <span style={styles.spinner} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              <span>{googleLoading ? t.connecting : t.continueGoogle}</span>
            </button>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>ou</span>
              <span style={styles.dividerLine} />
            </div>
          </>
        )}

        {/* Main Form */}
        <form onSubmit={isForgot ? handlePasswordReset : handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#c0392b" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div style={styles.successBox}>
              <span>{t.resetSent}</span>
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>{t.email}</label>
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              autoComplete="email"
            />
          </div>

          {!isForgot && (
            <div style={styles.field}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={styles.label}>{t.password}</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => { setIsForgot(true); setError(null); setResetSent(false); }}
                    style={styles.forgotLink}
                  >
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder={isRegister ? t.passwordMinHint : t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{ ...styles.submitBtn, opacity: loading || googleLoading ? 0.7 : 1 }}
          >
            {loading ? (
              <>
                <span style={{ ...styles.spinner, borderTopColor: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.3)" }} />
                <span>{t.submitting}</span>
              </>
            ) : isForgot ? (
              t.forgotPassword
            ) : isRegister ? (
              t.submitCreate
            ) : (
              t.submit
            )}
          </button>
        </form>

        {isForgot ? (
          <p style={styles.switchText}>
            <button type="button" onClick={() => { setIsForgot(false); setResetSent(false); setError(null); }} style={styles.switchLink}>
              ← {t.switchToLogin}
            </button>
          </p>
        ) : (
          <p style={styles.switchText}>
            {isRegister ? t.hasAccount : t.noAccount}{" "}
            <button type="button" onClick={switchMode} style={styles.switchLink}>
              {isRegister ? t.switchToLogin : t.switchToRegister}
            </button>
          </p>
        )}
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
  logoWrapper: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" },
  logoIcon: {
    width: "44px", height: "44px", borderRadius: "12px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 12px rgba(102,126,234,0.4)",
  },
  logoText: {
    fontSize: "1.6rem", fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  title: { fontSize: "1.6rem", fontWeight: "700", color: "#1a1a2e", margin: "0 0 0.3rem", letterSpacing: "-0.02em" },
  subtitle: { fontSize: "0.95rem", color: "#6b7280", margin: "0 0 1.75rem" },
  googleBtn: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
    gap: "0.75rem", padding: "0.8rem 1rem", borderRadius: "12px",
    border: "1.5px solid #e5e7eb", background: "#ffffff", color: "#374151",
    fontSize: "0.95rem", fontWeight: "600", cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  divider: { display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" },
  dividerLine: { flex: 1, height: "1px", background: "#e5e7eb" },
  dividerText: { color: "#9ca3af", fontSize: "0.85rem", fontWeight: "500" },
  form: { display: "flex", flexDirection: "column", gap: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.875rem", fontWeight: "600", color: "#374151" },
  forgotLink: {
    background: "none", border: "none", color: "#667eea", fontSize: "0.8rem",
    fontWeight: "500", cursor: "pointer", padding: 0, textDecoration: "none",
  },
  input: {
    padding: "0.8rem 1rem", borderRadius: "10px", border: "1.5px solid #e5e7eb",
    fontSize: "0.95rem", color: "#1a1a2e", outline: "none",
    transition: "border-color 0.2s", background: "#f9fafb",
  },
  submitBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
    padding: "0.85rem", borderRadius: "12px", border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer",
    marginTop: "0.25rem", boxShadow: "0 4px 15px rgba(102,126,234,0.4)", letterSpacing: "0.01em",
  },
  errorBox: {
    display: "flex", alignItems: "center", gap: "0.5rem",
    padding: "0.75rem 1rem", borderRadius: "10px",
    background: "#fef2f2", border: "1px solid #fecaca", color: "#c0392b", fontSize: "0.875rem",
  },
  successBox: {
    padding: "0.75rem 1rem", borderRadius: "10px",
    background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "0.875rem",
  },
  switchText: { textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#6b7280", marginBottom: 0 },
  switchLink: {
    background: "none", border: "none", color: "#667eea", fontWeight: "600",
    fontSize: "0.9rem", cursor: "pointer", padding: 0,
    textDecoration: "underline", textDecorationColor: "transparent",
  },
  spinner: {
    display: "inline-block", width: "16px", height: "16px", borderRadius: "50%",
    border: "2.5px solid rgba(0,0,0,0.15)", borderTopColor: "#555",
    animation: "spin 0.7s linear infinite", flexShrink: 0,
  },
};
