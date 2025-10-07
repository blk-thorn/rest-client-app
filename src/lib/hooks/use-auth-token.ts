"use rest";

import { useEffect, useState } from "react";
import { auth } from "@/db/firebase";
import { onIdTokenChanged, User, getIdTokenResult } from "firebase/auth";

export function useAuthToken() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect((): (() => void) => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser: User | null): Promise<void> => {
      if (currentUser) {
        try {
          await getIdTokenResult(currentUser);
          setUser(currentUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return (): void => unsubscribe();
  }, []);

  return { user, loading };
}
