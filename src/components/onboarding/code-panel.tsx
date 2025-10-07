"use rest";

import { useMemo, useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/lib/ui/tabs";
import { generateCodeSnippets } from "@/lib/utils/generate-code";
import type { GenHeader, GenMethod } from "@/lib/codegen/helpers";
import { useTranslations } from "next-intl";
import { useVariable } from "@/lib/hooks/use-variable";

type Props = {
  method: GenMethod;
  url: string;
  headers: GenHeader[];
  body: string;
};

export default function CodePanel({ method, url, headers, body }: Props) {
  const t = useTranslations("Client");
  const [active, setActive] = useState("cURL");
  const { replaceWithValue } = useVariable();

  const snippets = useMemo(
    () => generateCodeSnippets(method, url, headers, body),
    [method, url, headers, body]
  );

  const entries = useMemo(() => ("error" in snippets ? [] : Object.entries(snippets)), [snippets]);

  useEffect(() => {
    if (entries.length === 0) return;
    const langs = entries.map(([lang]) => lang);
    if (!langs.includes(active)) {
      setActive(langs[0] ?? "cURL");
    }
  }, [entries, active]);

  if ("error" in snippets) {
    return <div className="text-red-400 text-sm">{snippets.error}</div>;
  }

  return (
    <Tabs value={active} onValueChange={setActive} className="flex-1 flex flex-col">
      <TabsList className="w-full flex flex-wrap gap-1 bg-gray-800 rounded p-1">
        {entries.map(([lang]) => (
          <TabsTrigger
            key={lang}
            value={lang}
            className="text-m m-0.5 text-gray-300 hover:text-white data-[state=active]:bg-slate-400 data-[state=active]:text-white"
          >
            {lang}
          </TabsTrigger>
        ))}
      </TabsList>

      {entries.map(([lang, code]) => (
        <TabsContent key={lang} value={lang} className="mt-2">
          <div className="border border-gray-700 rounded overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-400/60">
              <span className="text-sm uppercase tracking-wide text-gray-300">{lang}</span>
              <button
                type="button"
                className="text-sm px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
                onClick={() => navigator.clipboard.writeText(code).catch(() => {})}
              >
                {t("code.copy")}
              </button>
            </div>
            <pre className="p-3 text-sm text-green-300 bg-gray-800 overflow-auto whitespace-pre">
              <code>{replaceWithValue(code)}</code>
            </pre>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
