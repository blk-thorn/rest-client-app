"use rest";

import React from "react";
import { Button } from "@/lib/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useTranslations } from "next-intl";

export function GuestButtons() {
  const t = useTranslations("Main");

  return (
    <div className="flex gap-4 flex-wrap justify-center w-full">
      <Button
        asChild
        className="bg-green-500/60 hover:bg-green-600/60 text-white px-6 py-2 rounded shadow-md transition w-42"
      >
        <Link href={ROUTES.SIGN_IN}>{t("welcome.sign-in")}</Link>
      </Button>
      <Button
        variant="secondary"
        asChild
        className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded shadow-md transition w-42"
      >
        <Link href={ROUTES.SIGN_UP}>{t("welcome.sign-up")}</Link>
      </Button>
    </div>
  );
}
