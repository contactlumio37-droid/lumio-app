import { useProfile } from "../hooks/useProfile";
import { ROLES } from "../context/AuthContext";
import LumioApp from "../LumioApp";

const ROLE_LABEL = {
  [ROLES.FREE]:  { label: "Gratuit", color: "#6b7280" },
  [ROLES.PAID]:  { label: "Premium", color: "#7c3aed" },
  [ROLES.ADMIN]: { label: "Admin",   color: "#b91c1c" },
};

export function Home() {
  const { user, role, logout } = useProfile();
  const badge = ROLE_LABEL[role];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif" }}>
      <LumioApp
        userId={user.uid}
        userEmail={user.email}
        displayName={user.displayName}
        role={role}
        onLogout={logout}
        badgeLabel={badge.label}
        badgeColor={badge.color}
      />
    </div>
  );
}
