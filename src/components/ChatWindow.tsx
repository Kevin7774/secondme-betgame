"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatWindowProps = {
  disabled?: boolean;
};

function parseChatDelta(payload: string) {
  try {
    const json = JSON.parse(payload);
    const delta = json?.choices?.[0]?.delta?.content;
    const sessionId = json?.sessionId ?? json?.data?.sessionId;
    return { delta, sessionId } as { delta?: string; sessionId?: string };
  } catch {
    return {};
  }
}

export default function ChatWindow({ disabled }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "欢迎来到 SecondMe 对话台。向我发起问题，我会结合你的个人信息做回应。",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const listRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending && !disabled, [input, isSending, disabled]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!canSend) return;
    const message = input.trim();
    setInput("");
    setIsSending(true);

    const assistantIndex = messages.length + 1;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok || !response.body) {
        throw new Error("聊天接口响应异常");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

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
            break;
          }

          const { delta, sessionId: nextSessionId } = parseChatDelta(payload);
          if (nextSessionId) {
            setSessionId(nextSessionId);
          }
          if (delta) {
            assistantText += delta;
            setMessages((prev) =>
              prev.map((item, index) =>
                index === assistantIndex ? { ...item, content: assistantText } : item
              )
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((item, index) =>
          index === assistantIndex
            ? { ...item, content: "对话失败，请稍后再试。" }
            : item
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-3xl border border-amber-200/10 bg-black/55 p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">SecondMe 对话台</p>
          <p className="text-xs text-white/60">实时流式响应 · 会话可持续</p>
        </div>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200">
          {sessionId ? `会话 ${sessionId.slice(0, 8)}...` : "新会话"}
        </span>
      </div>

      <div
        ref={listRef}
        className="mt-4 h-64 space-y-3 overflow-y-auto rounded-2xl border border-amber-200/10 bg-black/60 p-4"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              message.role === "user"
                ? "ml-auto bg-amber-300 text-black"
                : "bg-white/10 text-white/80"
            }`}
          >
            {message.content || (message.role === "assistant" ? "…" : "")}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder={disabled ? "请先登录 SecondMe" : "输入你想问 SecondMe 的问题"}
          className="flex-1 rounded-2xl border border-amber-200/20 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-amber-200/40"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="rounded-2xl bg-amber-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-amber-300/30"
        >
          {isSending ? "发送中..." : "发送"}
        </button>
      </div>
    </div>
  );
}
