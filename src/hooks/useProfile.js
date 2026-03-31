import { useAuth, ROLES } from "../context/AuthContext";

export function useProfile() {
  const { user, role, loading, login, register, logout } = useAuth();

  return {
    user,
    role,
    loading,
    isFree: role === ROLES.FREE,
    isPaid: role === ROLES.PAID || role === ROLES.ADMIN,
    isAdmin: role === ROLES.ADMIN,
    login,
    register,
    logout,
  };
}
