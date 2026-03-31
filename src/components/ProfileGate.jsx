import { useProfile } from "../hooks/useProfile";
import { ROLES } from "../context/AuthContext";

const ROLE_RANK = { [ROLES.FREE]: 0, [ROLES.PAID]: 1, [ROLES.ADMIN]: 2 };

/**
 * Affiche les enfants uniquement si l'utilisateur a le rôle requis (ou supérieur).
 *
 * Utilisation :
 *   <ProfileGate requiredRole="paid">...</ProfileGate>
 *   <ProfileGate requiredRole="admin">...</ProfileGate>
 */
export function ProfileGate({ requiredRole = ROLES.FREE, fallback = null, children }) {
  const { role } = useProfile();

  if (ROLE_RANK[role] >= ROLE_RANK[requiredRole]) {
    return children;
  }

  return fallback;
}
