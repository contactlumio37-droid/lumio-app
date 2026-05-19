import { useAuthSupabase } from "../context/AuthContext.tsx";

const ROLE_RANK = { free: 0, paid: 1, admin: 2 };

export function ProfileGate({ requiredRole = "free", fallback = null, children }) {
  const { isPaid, isAdmin } = useAuthSupabase();
  const role = isAdmin ? "admin" : isPaid ? "paid" : "free";
  return ROLE_RANK[role] >= ROLE_RANK[requiredRole] ? children : fallback;
}
