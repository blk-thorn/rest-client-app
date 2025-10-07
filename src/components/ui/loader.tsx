"use rest";

import { useTranslations } from "next-intl";

export default function Loader() {
  const t = useTranslations("Main");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-900 text-white space-y-6">
      <div className="flex space-x-3">
        <span className="w-3 h-12 bg-gradient-to-t from-green-500/80 to-green-600/80 rounded animate-wave"></span>
        <span className="w-3 h-12 bg-gradient-to-t from-green-500/80 to-green-600/80 rounded animate-wave delay-100"></span>
        <span className="w-3 h-12 bg-gradient-to-t from-green-500/80 to-green-600/80 rounded animate-wave delay-200"></span>
        <span className="w-3 h-12 bg-gradient-to-t from-green-500/80 to-green-600/80 rounded animate-wave delay-300"></span>
        <span className="w-3 h-12 bg-gradient-to-t from-green-500/80 to-green-600/80 rounded animate-wave delay-400"></span>
      </div>
      <p className="text-gray-300 text-lg font-medium tracking-wide">{t("loader")}</p>
    </div>
  );
}
