import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { initRevenueCat, isPaid } from "../revenuecat";

// Hiérarchie des rôles : admin > paid > free
export const ROLES = { FREE: "free", PAID: "paid", ADMIN: "admin" };

// VITE_ADMIN_UID is only used to bootstrap the first admin document.
// Authorization is enforced by the Firestore `role` field server-side.
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
        const profileRef = doc(db, "users", firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          let newRole = ROLES.FREE;
          if (ADMIN_UID && firebaseUser.uid === ADMIN_UID) {
            newRole = ROLES.ADMIN;
          } else {
            try {
              await initRevenueCat(firebaseUser.uid);
              const paid = await isPaid();
              newRole = paid ? ROLES.PAID : ROLES.FREE;
            } catch (rcErr) {
              console.warn("RevenueCat indisponible, rôle FREE par défaut :", rcErr);
              newRole = ROLES.FREE;
            }
          }
          await setDoc(profileRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName ?? "",
            createdAt: serverTimestamp(),
            role: newRole,
          });
          setRole(newRole);
        } else {
          const storedRole = profileSnap.data().role;

          if (storedRole === ROLES.ADMIN) {
            setRole(ROLES.ADMIN);
          } else if (!storedRole && ADMIN_UID && firebaseUser.uid === ADMIN_UID) {
            await updateDoc(profileRef, { role: ROLES.ADMIN });
            setRole(ROLES.ADMIN);
          } else {
            try {
              await initRevenueCat(firebaseUser.uid);
              const paid = await isPaid();
              const resolvedRole = paid ? ROLES.PAID : ROLES.FREE;
              if (!storedRole || storedRole !== resolvedRole) {
                await updateDoc(profileRef, { role: resolvedRole });
              }
              setRole(resolvedRole);
            } catch (rcErr) {
              console.warn("RevenueCat indisponible, rôle conservé :", rcErr);
              setRole(storedRole || ROLES.FREE);
            }
          }
        }
      } catch (err) {
        console.error("Erreur Firestore lors du chargement du profil :", err);
        if (ADMIN_UID && firebaseUser.uid === ADMIN_UID) {
          setRole(ROLES.ADMIN);
        } else {
          setRole(ROLES.FREE);
        }
      }

      setUser(firebaseUser);
      setLoading(false);
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

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Deletes the Firebase Auth account. Firestore cleanup is handled
  // by the caller before invoking this, since it requires multiple batch deletes.
  const deleteAccount = async () => {
    if (!auth.currentUser) throw new Error("No authenticated user");
    await deleteUser(auth.currentUser);
    // onAuthStateChanged fires and resets user/role state automatically
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, login, register, loginWithGoogle, logout, resetPassword, deleteAccount }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
