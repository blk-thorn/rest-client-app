"use rest";

import { Button } from "@/lib/ui/button";
import { ROUTES } from "@/constants/routes";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function UserButtons() {
  const t = useTranslations("Main");

  return (
    <div className="flex gap-4 flex-wrap justify-center w-full">
      <Button
        asChild
        className="bg-green-500/60 hover:bg-green-600/60
                   text-white px-6 py-2 rounded shadow-md transition w-32"
      >
        <Link href={ROUTES.CLIENT}>{t("buttons.client")}</Link>
      </Button>
      <Button
        asChild
        className="bg-slate-700 hover:bg-slate-800
                   text-white px-6 py-2 rounded shadow-md transition w-32"
      >
        <Link href={ROUTES.HISTORY}>{t("buttons.history")}</Link>
      </Button>
      <Button
        asChild
        className="bg-slate-700 hover:bg-slate-800
                   text-white px-6 py-2 rounded shadow-md transition w-32"
      >
        <Link href={ROUTES.VARIABLES}>{t("buttons.variables")}</Link>
      </Button>
    </div>
  );
}
