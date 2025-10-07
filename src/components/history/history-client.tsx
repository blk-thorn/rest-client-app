"use rest";

import React from "react";
import type { HistoryItem } from "@/app/[locale]/history/page";
import { encodeBase64Url } from "@/lib/utils/base64";
import Link from "next/link";
import { useTranslations } from "next-intl";

type Props = {
  history: HistoryItem[];
};

export function generateLink(h: HistoryItem): string {
  const params = new URLSearchParams();

  params.set("method", h.method);
  params.set("url", encodeBase64Url(h.url));

  if (h.body) {
    params.set("body", encodeBase64Url(h.body));
  }

  Object.entries(h.headers).forEach(([key, value]) => {
    if (key) {
      params.set(key, value);
    }
  });
  return `/rest?${params.toString()}`;
}

export default function HistoryClient({ history }: Props) {
  const t = useTranslations("History");

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

      {history.length === 0 ? (
        <p className="text-gray-400">
          {t("no-requests")}
          <Link href="/rest" className="text-blue-400 underline">
            {t("client")}
          </Link>
        </p>
      ) : (
        <ul className="space-y-2">
          {history.map((h) => (
            <li
              key={h.id}
              className="border border-gray-700 rounded bg-gray-800 p-2 hover:bg-slate-800"
            >
              <Link href={generateLink(h)}>
                <div>
                  <strong className="px-2 py-1 rounded text-sm font-semibold border-1 border-gray-600 mr-1">
                    {h.method}
                  </strong>{" "}
                  {h.url}
                </div>
                <div className="text-sm mt-1 text-gray-400">
                  {new Date(h.createdAt).toLocaleString(t("date"), {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {t("status")}{" "}
                  <span
                    className={`${
                      h.responseStatus && h.responseStatus >= 400
                        ? "text-red-400"
                        : h.responseStatus && h.responseStatus >= 300
                          ? "text-yellow-500"
                          : h.responseStatus && h.responseStatus >= 200
                            ? "text-green-500"
                            : "text-gray-500"
                    }`}
                  >
                    {h.responseStatus ?? "-"}
                  </span>{" "}
                  | {t("duration")} {h.duration ?? "-"}
                  {t("ms")} | {t("req-size")} {h.requestSize ?? "-"} {t("bytes")} | {t("resp-size")}{" "}
                  {h.responseSize ?? "-"} {t("bytes")}
                  {h.errorDetails && (
                    <div className="text-red-500">
                      {t("error")} {h.errorDetails}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
