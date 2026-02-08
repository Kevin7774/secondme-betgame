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
  if (!response.body) {
    throw new Error("响应体为空");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) {
        continue;
      }

      const payload = trimmed.replace(/^data:\s*/, "");
      if (payload === "[DONE]") {
        return content;
      }

      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
        }
      } catch {
        // 忽略非 JSON 片段
      }
    }
  }

  return content;
}
