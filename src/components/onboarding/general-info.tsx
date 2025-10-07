"use rest";

import React from "react";
import { DeveloperCard } from "@/components/onboarding/developer-card";
import { team } from "@/constants/team";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function GeneralInfo() {
  const [loaded, setLoaded] = useState(false);
  const t = useTranslations("Main");

  useEffect((): (() => void) => {
    const timer = setTimeout((): void => setLoaded(true), 50);
    return (): void => clearTimeout(timer);
  }, []);

  return (
    <div className="page p-6 flex flex-col gap-5 border-t border-gray-700">
      <div
        className="flex flex-col items-center gap-4 transition-opacity duration-700 ease-out text-center"
        style={{ opacity: loaded ? 1 : 0 }}
      >
        <h1 className="text-3xl font-bold text-white">{t("about-project.title")}</h1>
        <p className="text-lg text-gray-300 text-justify">{t("about-project.description")}</p>
      </div>

      <div className="flex flex-col gap-4 items-center text-center">
        <h2 className="text-3xl font-semibold text-white">{t("about-us.title")}</h2>
        <p className="text-lg text-gray-300 mb-5 text-justify">{t("about-us.description")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center">
          {team.map((member, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 ease-out 
                          ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} 
                          delay-${index * 100}`}
            >
              <DeveloperCard member={member} />
            </div>
          ))}
        </div>
      </div>

      <div
        className="flex flex-col items-center gap-4 transition-opacity duration-700 delay-400 text-center"
        style={{ opacity: loaded ? 1 : 0 }}
      >
        <h2 className="text-3xl font-semibold">{t("about-program.title")}</h2>
        <p className="text-md text-gray-400 text-justify">{t("about-program.description")}</p>
      </div>
    </div>
  );
}
