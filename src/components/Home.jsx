import { useAuthSupabase } from "../context/AuthContext.tsx";
import LumioApp from "../LumioApp";

export function Home() {
  const { user, profile, isPaid, isAdmin, signOut, deleteAccount } = useAuthSupabase();

  const role = isAdmin ? "admin" : isPaid ? "paid" : "free";
  const badgeLabel = isAdmin ? "Admin" : isPaid ? "Premium" : "Gratuit";
  const badgeColor = isAdmin ? "#b91c1c" : isPaid ? "#7c3aed" : "#6b7280";
  const displayName = profile?.username || user?.user_metadata?.full_name || "";

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif" }}>
      <LumioApp
        userId={user.id}
        userEmail={user.email}
        displayName={displayName}
        role={role}
        onLogout={signOut}
        onDeleteAccount={() => deleteAccount(user.id)}
        badgeLabel={badgeLabel}
        badgeColor={badgeColor}
      />
    </div>
  );
}
