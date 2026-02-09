"use client";

import { useEffect, useState } from "react";

import { makeTickerMessage } from "@/lib/mock-data";

type TickerMessage = {
  id: string;
  text: string;
};

function nextMessage(): TickerMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    text: makeTickerMessage(),
  };
}

export default function LiveTicker() {
  const [message, setMessage] = useState<TickerMessage>({
    id: "initial",
    text: "实时消息加载中…",
  });

  useEffect(() => {
    setMessage(nextMessage());
    const timer = setInterval(() => {
      setMessage(nextMessage());
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 backdrop-blur-md ring-1 ring-amber-200/20 shadow-[0_0_0_1px_rgba(251,191,36,0.08),0_10px_30px_rgba(0,0,0,0.35)]">
        <span className="relative inline-flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>

        <span className="text-[11px] font-semibold tracking-widest text-amber-200/90">LIVE</span>

        <div className="relative w-full overflow-hidden">
          <div
            key={message.id}
            className="ticker whitespace-nowrap text-sm font-medium text-amber-200"
            aria-live="polite"
          >
            {message.text}
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticker {
          display: inline-block;
          will-change: transform;
          animation: tickerScroll 5.2s linear infinite;
        }
        @keyframes tickerScroll {
          0% {
            transform: translateX(100%);
            opacity: 0.9;
          }
          8% {
            opacity: 1;
          }
          100% {
            transform: translateX(-110%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
