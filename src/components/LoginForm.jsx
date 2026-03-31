import { useState } from "react";
import { useProfile } from "../hooks/useProfile";

export function LoginForm() {
  const { login, register } = useProfile();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.logo}>Lumio</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>{isRegister ? "Créer un compte" : "Connexion"}</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "..." : isRegister ? "Créer le compte" : "Se connecter"}
        </button>

        <button
          type="button"
          onClick={() => { setIsRegister(!isRegister); setError(null); }}
          style={styles.toggle}
        >
          {isRegister ? "Déjà un compte ? Connexion" : "Pas de compte ? S'inscrire"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f5f5",
  },
  logo: {
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
    color: "#1a1a1a",
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    width: "100%",
    maxWidth: "360px",
  },
  title: {
    margin: "0 0 0.5rem",
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  input: {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    background: "#1a1a1a",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.25rem",
  },
  toggle: {
    background: "none",
    border: "none",
    color: "#555",
    fontSize: "0.875rem",
    cursor: "pointer",
    textAlign: "center",
  },
  error: {
    color: "#c0392b",
    fontSize: "0.875rem",
    margin: 0,
  },
};
