"use client";
import { Button } from "@/lib/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/lib/ui/tabs";
import { HttpMethod, useRequest } from "@/lib/stores/request";
import { Input } from "@/lib/ui/input";
import { useState } from "react";
import { handleSend } from "@/lib/utils/handleSend";
import { useTranslations } from "next-intl";
import { useRequestQuerySync } from "@/lib/hooks/useRequestQuerySync";
import { useVariable } from "@/lib/hooks/useVariable";
import CodePanel from "@/components/CodePanel";
import { toast } from "sonner";

export default function RestClient() {
  const {
    method,
    url,
    body,
    headers,
    setMethod,
    setUrl,
    setBody,
    addHeader,
    updateHeader,
    removeHeader,
  } = useRequest();

  useRequestQuerySync();

  const canSend = url.trim().length > 0;

  const [respStatus, setRespStatus] = useState<string | null>(null);
  const [respHeaders, setRespHeaders] = useState<Array<[string, string]>>([]);
  const [respBody, setRespBody] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { replaceWithValue } = useVariable();

  const updateRequestData = () => {
    const updatedUrl = replaceWithValue(url);

    const updatedHeaders = headers.map((header) => ({
      ...header,
      value: replaceWithValue(header.value),
    }));

    const updatedBody = replaceWithValue(body);

    return {
      method,
      url: updatedUrl,
      headers: updatedHeaders,
      body: updatedBody,
    };
  };

  const t = useTranslations("Client");
  const REQUEST_TABS: string[] = [t("request-tabs.headers"), t("request-tabs.body")];
  const RESPONSE_TABS: string[] = [t("response-tabs.body"), t("response-tabs.headers")];
  const RESPONSE_TABS_WITH_CODE = [...RESPONSE_TABS, t("response-tabs.code")];

  return (
    <div className="flex flex-col gap-4 h-full bg-gray-900 text-white p-4">
      <div className="flex items-center gap-2 bg-gray-800 p-3 rounded">
        <select
          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white cursor-pointer"
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <Input
          placeholder="https://api.example.com"
          className="flex-1 text-sm bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          className="px-6 bg-green-500/60 hover:bg-green-600/60 text-white cursor-pointer"
          disabled={!canSend || isLoading}
          onClick={() => {
            const updatedData = updateRequestData();
            handleSend({
              method,
              url: updatedData.url,
              headers: updatedData.headers,
              body: updatedData.body,
              setRespStatus,
              setRespHeaders,
              setRespBody,
              setIsLoading,
              setErrorMsg,
            });
          }}
        >
          {isLoading ? t("button.loading") : t("button.normal")}
        </Button>
      </div>

      <Tabs defaultValue={t("request-tabs.headers")} className="flex-1 flex flex-col">
        <TabsList className="w-fit mb-2 bg-gray-800 rounded">
          {REQUEST_TABS.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="m-0.5 text-white hover:bg-gray-700 data-[state=active]:bg-slate-400 data-[state=active]:text-gray-900"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex-1 border border-gray-700 rounded bg-gray-800 overflow-auto">
          <TabsContent value={t("request-tabs.headers")} className="p-4 text-sm text-gray-300">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">{t("headers.title")}</span>
                <Button
                  size="sm"
                  className="bg-gray-600 hover:bg-gray-500 text-white"
                  onClick={addHeader}
                >
                  {t("headers.add")}
                </Button>
              </div>
              <div className="space-y-2">
                {headers.map((h) => (
                  <div key={h.id} className="flex gap-2">
                    <Input
                      placeholder={t("headers.input.key")}
                      className="flex-1 text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      value={h.key}
                      onChange={(e) => updateHeader(h.id, { key: e.target.value })}
                    />
                    <Input
                      placeholder={t("headers.input.value")}
                      className="flex-1 text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      value={h.value}
                      onChange={(e) => updateHeader(h.id, { value: e.target.value })}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-gray-600 hover:bg-gray-500 text-white"
                      onClick={() => removeHeader(h.id)}
                    >
                      {t("headers.delete")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value={t("request-tabs.body")} className="p-4 text-sm text-gray-300">
            <textarea
              className="w-full h-48 bg-gray-700 border border-gray-600 rounded p-2 font-mono text-sm text-white placeholder-gray-400"
              placeholder={t("body.input")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="mt-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-gray-600 hover:bg-gray-500 text-white"
                onClick={() => {
                  try {
                    const pretty = JSON.stringify(JSON.parse(body || "{}"), null, 2);
                    setBody(pretty);
                  } catch {
                    toast.error(t("body.error"));
                  }
                }}
              >
                {t("body.prettify")}
              </Button>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex-1 flex flex-col">
        <h2 className="text-lg font-semibold mb-2">{t("response.title")}</h2>

        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">{t("response.status")}:</span>
          <span className="text-sm text-gray-300">{respStatus ?? "—"}</span>
          {errorMsg && <span className="text-sm text-red-400">• {errorMsg}</span>}
        </div>

        <Tabs defaultValue={t("response-tabs.body")} className="flex-1 flex flex-col">
          <TabsList className="w-fit mb-2 bg-gray-800 rounded">
            {RESPONSE_TABS_WITH_CODE.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="m-0.5 text-white hover:bg-gray-700 data-[state=active]:bg-slate-400 data-[state=active]:text-gray-900"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex-1 border border-gray-700 rounded bg-gray-800 overflow-auto p-4 text-sm font-mono text-gray-300">
            <TabsContent value={t("response-tabs.body")}>
              {respBody || t("response.body")}
            </TabsContent>
            <TabsContent value={t("response-tabs.headers")}>
              {respHeaders.length ? (
                <ul className="space-y-1">
                  {respHeaders.map(([k, v]) => (
                    <li key={k}>
                      <span className="text-gray-400">{k}:</span> {v}
                    </li>
                  ))}
                </ul>
              ) : (
                t("response.headers")
              )}
            </TabsContent>

            <TabsContent value={t("response-tabs.code")}>
              {!url.trim() ? (
                t("response.code")
              ) : (
                <CodePanel method={method} url={url} headers={headers} body={body} />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
