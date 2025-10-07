import { genCurl } from "@/lib/codegen/langs/curl";
import { genFetch } from "@/lib/codegen/langs/fetch";
import { genXhr } from "@/lib/codegen/langs/xhr";
import { genNode } from "@/lib/codegen/langs/node";
import { genPython } from "@/lib/codegen/langs/python";
import { genJava } from "@/lib/codegen/langs/java";
import { genCSharp } from "@/lib/codegen/langs/csharp";
import { genGo } from "@/lib/codegen/langs/go";

import { GenMethod, GenHeader } from "@/lib/codegen/helpers";

export function generateCodeSnippets(
  method: GenMethod,
  url: string,
  headers: GenHeader[],
  body: string
) {
  if (!url.trim()) {
    return { error: "Not enough details to generate code" };
  }

  const snippets: Record<string, string> = {};

  snippets["cURL"] = genCurl(method, url, headers, body);

  snippets["JavaScript (Fetch)"] = genFetch(method, url, headers, body);

  snippets["JavaScript (XHR)"] = genXhr(method, url, headers, body);

  snippets["Node.js"] = genNode(method, url, headers, body);

  snippets["Python"] = genPython(method, url, headers, body);

  snippets["Java"] = genJava(method, url, headers, body);

  snippets["C#"] = genCSharp(method, url, headers, body);

  snippets["Go"] = genGo(method, url, headers, body);

  return snippets;
}
