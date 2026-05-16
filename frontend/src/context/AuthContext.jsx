import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => setProfile(null));
      return undefined;
    }

    return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? snapshot.data() : null);
    });
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      displayName: profile?.displayName || user?.displayName || "",
      isAuthLoading,
      isLoggedIn: Boolean(user),
    }),
    [user, profile, isAuthLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
