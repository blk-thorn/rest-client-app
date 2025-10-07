"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useEffect, useState } from "react";
import { auth } from "@/db/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { toast } from "sonner";
import Logo from "@/components/ui/logo";
import { useRouter } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthRedirect } from "@/lib/hooks/use-auth-redirect";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const t = useTranslations("Header");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { signedOutRef } = useAuthRedirect();
  useEffect((): (() => void) => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser): void => {
      setUser(currentUser);
    });
    return (): void => unsubscribe();
  }, []);

  const pathname = usePathname();
  const currentLocale = useLocale();
  const [locale, setLocale] = useState(currentLocale);

  useEffect((): (() => void) => {
    const onScroll: () => void = (): void => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return (): void => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut: () => Promise<void> = async (): Promise<void> => {
    try {
      signedOutRef.current = true;
      await signOut(auth);
      router.push(ROUTES.HOME);
      toast.success(t("toast.success"));
      await fetch("/api/session", { method: "DELETE" });
      toast.success("You have been signed out");
    } catch {
      toast.error(t("toast.error"));
    }
  };

  const isAuthenticated: boolean = !!user;

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    setLocale(newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gray-700 transition-all duration-300 flex items-center justify-between px-6 ${
        scrolled ? "bg-gray-800 py-3 shadow-md" : "bg-gray-900 py-4"
      }`}
    >
      <Logo />

      <div className="flex items-center gap-4">
        <select
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          value={locale}
          onChange={handleLocaleChange}
        >
          <option value="en">EN</option>
          <option value="ru">RU</option>
        </select>

        {isAuthenticated ? (
          <>
            <Link
              href={ROUTES.HOME}
              className="bg-green-500/60 hover:bg-green-600/60 px-3 py-1 rounded text-sm cursor-pointer"
            >
              {t("button.main")}
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-blue-500/60 hover:bg-blue-600/60 px-3 py-1 rounded text-sm cursor-pointer"
            >
              {t("button.sign-out")}
            </button>
          </>
        ) : (
          <>
            <Link
              href={ROUTES.SIGN_IN}
              className="bg-green-500/60 hover:bg-green-600/60 px-3 py-1 rounded text-sm cursor-pointer"
            >
              {t("button.sign-in")}
            </Link>
            <Link
              href={ROUTES.SIGN_UP}
              className="bg-slate-700 hover:bg-slate-800 px-3 py-1 rounded text-sm cursor-pointer"
            >
              {t("button.sign-up")}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
