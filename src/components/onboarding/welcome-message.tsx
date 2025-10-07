import React from "react";
import { GuestButtons } from "@/components/ui/guest-buttons";
import { useTranslations } from "next-intl";

type WelcomeMessageProps = {
  isAuthenticated?: boolean;
  username?: string;
};

export default function WelcomeMessage({ isAuthenticated = false, username }: WelcomeMessageProps) {
  const t = useTranslations("Main");

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-lg min-h-[220px]">
      {!isAuthenticated ? (
        <>
          <h1 className="text-4xl mb-4 font-bold text-white text-center">
            {t("welcome.greetings")}
          </h1>
          <GuestButtons />
        </>
      ) : (
        <h1 className="text-3xl mb-4 font-semibold text-white text-center">
          {t("welcome.greetings-back")}
          {username}!
        </h1>
      )}
    </div>
  );
}
