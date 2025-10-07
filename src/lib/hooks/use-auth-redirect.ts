import { useEffect, useRef, useState } from "react";
import { auth } from "@/db/firebase";
import { onIdTokenChanged, User, getIdTokenResult } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { PROTECTED_PATHS } from "@/constants/protected-paths";

const REDIRECT_ON_AUTH_PATHS = [ROUTES.SIGN_IN, ROUTES.SIGN_UP];

export function useAuthRedirect() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname: string = usePathname();
  const prevUserRef = useRef<User | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const signedOutRef = useRef(false);

  useEffect((): (() => void) | undefined => {
    if (typeof window === "undefined") return;

    const unsubscribe = onIdTokenChanged(auth, async (currentUser: User | null): Promise<void> => {
      setUser(currentUser);
      const prevUser: User | null = prevUserRef.current;

      if (currentUser) {
        signedOutRef.current = false;

        try {
          const tokenResult = await getIdTokenResult(currentUser);
          const realExpiresAt = new Date(tokenResult.expirationTime);
          const delay: number = realExpiresAt.getTime() - Date.now();

          await fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenResult.token }),
          });

          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(
            async (): Promise<void> => {
              toast.error("Session expired. You have been signed out.");
              signedOutRef.current = true;

              await fetch("/api/session", { method: "DELETE" });
              await auth.signOut();
              router.push(ROUTES.HOME);
            },
            Math.max(0, delay)
          );

          const isAuthPage: boolean = REDIRECT_ON_AUTH_PATHS.some(
            (p): boolean => pathname === p || pathname.endsWith(p)
          );

          if (isAuthPage && (!prevUser || prevUser.uid !== currentUser.uid)) {
            setCheckingAuth(true);
            setTimeout((): void => router.push(ROUTES.HOME), 200);
          } else {
            setCheckingAuth(false);
          }
        } catch {
          toast.message("Failed to process token");
        }
      } else {
        await fetch("/api/session", { method: "DELETE" });

        if (
          signedOutRef.current ||
          PROTECTED_PATHS.some(
            (path): boolean => pathname === path || pathname.startsWith(path + "/")
          )
        ) {
          router.push(ROUTES.HOME);
          signedOutRef.current = false;
        }

        setCheckingAuth(false);
      }

      prevUserRef.current = currentUser;
    });

    return (): void => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router, pathname]);

  return { checkingAuth, user, signedOutRef };
}
