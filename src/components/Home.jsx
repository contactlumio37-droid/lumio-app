import { useProfile } from "../hooks/useProfile";
import { ProfileGate } from "./ProfileGate";
import { ROLES } from "../context/AuthContext";

const ROLE_LABEL = {
  [ROLES.FREE]: { label: "Gratuit", color: "#6b7280" },
  [ROLES.PAID]: { label: "Premium", color: "#7c3aed" },
  [ROLES.ADMIN]: { label: "Admin", color: "#b91c1c" },
};

export function Home() {
  const { user, role, logout } = useProfile();
  const badge = ROLE_LABEL[role];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.logo}>Lumio</span>
        <div style={styles.headerRight}>
          <span style={{ ...styles.badge, background: badge.color }}>{badge.label}</span>
          <button onClick={logout} style={styles.logoutBtn}>Déconnexion</button>
        </div>
      </header>

      <main style={styles.main}>
        <h2 style={styles.welcome}>
          Bonjour{user.displayName ? `, ${user.displayName}` : ""} 👋
        </h2>
        <p style={styles.email}>{user.email}</p>

        <ProfileGate requiredRole={ROLES.PAID} fallback={
          <div style={styles.card}>
            <p style={styles.cardText}>Passe à Premium pour accéder à toutes les fonctionnalités.</p>
          </div>
        }>
          <div style={{ ...styles.card, borderColor: "#7c3aed" }}>
            <p style={styles.cardText}>Contenu Premium déverrouillé.</p>
          </div>
        </ProfileGate>

        <ProfileGate requiredRole={ROLES.ADMIN}>
          <div style={{ ...styles.card, borderColor: "#b91c1c" }}>
            <p style={styles.cardText}>Panneau Admin.</p>
          </div>
        </ProfileGate>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f5f5",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  badge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "999px",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  logoutBtn: {
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    color: "#555",
  },
  main: {
    maxWidth: "640px",
    margin: "3rem auto",
    padding: "0 1rem",
  },
  welcome: {
    fontSize: "1.75rem",
    fontWeight: "700",
    margin: "0 0 0.25rem",
    color: "#1a1a1a",
  },
  email: {
    color: "#6b7280",
    margin: "0 0 2rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "1rem",
  },
  cardText: {
    margin: 0,
    color: "#374151",
  },
};
