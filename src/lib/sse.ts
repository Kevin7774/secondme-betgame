export async function consumeSse(
  response: Response,
  onData: (payload: string) => void | boolean
) {
  if (!response.body) {
    throw new Error("响应体为空");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let shouldStop = false;

  const processBuffer = (flush: boolean) => {
    const lines = buffer.split(/\r?\n/);
    buffer = flush ? "" : (lines.pop() ?? "");

    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) {
        continue;
      }

      const payload = line.replace(/^data:\s*/, "");
      if (payload === "[DONE]") {
        shouldStop = true;
        return;
      }

      if (onData(payload) === true) {
        shouldStop = true;
        return;
      }
    }
  };

  while (!shouldStop) {
    const { value, done } = await reader.read();
    if (done) {
      buffer += decoder.decode();
      processBuffer(true);
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    processBuffer(false);
  }
}
