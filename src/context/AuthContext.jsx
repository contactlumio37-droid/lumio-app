import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { initRevenueCat, isPaid } from "../revenuecat";

// Hiérarchie des rôles : admin > paid > free
export const ROLES = { FREE: "free", PAID: "paid", ADMIN: "admin" };

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(ROLES.FREE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole(ROLES.FREE);
        setLoading(false);
        return;
      }

      try {
        // Créer ou mettre à jour le profil Firestore
        const profileRef = doc(db, "users", firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          await setDoc(profileRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName ?? "",
            createdAt: serverTimestamp(),
          });
        }

        // Déterminer le rôle
        if (firebaseUser.uid === ADMIN_UID) {
          setRole(ROLES.ADMIN);
        } else {
          await initRevenueCat(firebaseUser.uid);
          const paid = await isPaid();
          setRole(paid ? ROLES.PAID : ROLES.FREE);
        }

        setUser(firebaseUser);
      } catch {
        // En cas d'erreur (Firestore, RevenueCat), on connecte quand même l'utilisateur
        setUser(firebaseUser);
        setRole(ROLES.FREE);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
