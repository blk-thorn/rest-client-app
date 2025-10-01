"use client";

import React, { lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
import Loader from "@/components/ui/Loader";

const VariablesForm = lazy(() => import("@/components/variables/VariablesForm"));
const VariablesTable = lazy(() => import("@/components/variables/VariablesTable"));

function VariablesPage() {
  const t = useTranslations("Variables");

  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 h-full bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-semibold">{t("title")}</h2>
      <Suspense fallback={<Loader />}>
        <VariablesForm />
        <VariablesTable />
      </Suspense>
    </div>
  );
}

export default VariablesPage;
