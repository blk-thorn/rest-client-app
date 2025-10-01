"use client";

import { useActionState } from "react";
import { ROUTES } from "@/constants/routes";
import { FormState } from "@/types/types";
import { signInAction } from "@/lib/auth/signin";
import Link from "next/link";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import Loader from "@/components/ui/Loader";
import { useTranslations } from "next-intl";

export default function SignInPage() {
  const initialState: FormState = { error: null };
  const t = useTranslations("SignIn");
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    signInAction,
    initialState
  );
  const { checkingAuth } = useAuthRedirect();

  if (checkingAuth) return <Loader />;

  return (
    <div className="flex flex-1 items-center justify-center p-6 bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">{t("title")}</h2>

        <form action={formAction} className="flex flex-col gap-4" data-testid="form">
          <label className="flex flex-col">
            <span className="text-sm text-gray-300">{t("email-label")}</span>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              className="mt-1 rounded bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500/60"
              autoComplete="username"
              required
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-300">{t("password.label")}</span>
            <input
              type="password"
              name="password"
              placeholder={t("password.placeholder")}
              className="mt-1 rounded bg-gray-900 border border-gray-700 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500/60"
              autoComplete="current-password"
              required
            />
          </label>

          {state.error && <p className="text-red-400 text-sm text-center">{state.error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="bg-green-500/60 hover:bg-green-600/60 text-white font-medium px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
          >
            {isPending ? t("button.loading") : t("button.normal")}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-4">
          {t("no-account")}{" "}
          <Link href={ROUTES.SIGN_UP} className="underline text-white">
            {t("link-su")}
          </Link>
        </div>
      </div>
    </div>
  );
}
