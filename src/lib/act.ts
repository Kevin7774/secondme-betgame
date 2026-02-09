import { consumeSse } from "@/lib/sse";

export type ActRequest = {
  message: string;
  actionControl: string;
  sessionId?: string;
  systemPrompt?: string;
};

export async function runAct(request: ActRequest) {
  const response = await fetch("/api/act", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok || !response.body) {
    throw new Error("Act 接口请求失败");
  }

  return readSseContent(response);
}

export async function readSseContent(response: Response) {
  let content = "";

  await consumeSse(response, (payload) => {
    try {
      const json = JSON.parse(payload);
      const delta = json?.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta) {
        content += delta;
      }
    } catch {
      // 忽略非 JSON 片段
    }
  });

  return content;
}
