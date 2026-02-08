"use client";

import { useState } from "react";

import { useTelemetry } from "@/hooks/useTelemetry";

type InviteCardProps = {
  inviteCode?: string | null;
};

export default function InviteCard({ inviteCode }: InviteCardProps) {
  const { track } = useTelemetry();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localCode, setLocalCode] = useState("guest_table");

  const finalCode = inviteCode ?? localCode;
  const invitePath = `/?ref=${finalCode}`;

  async function copy() {
    setError(null);

    try {
      let resolvedCode = finalCode;
      if (!inviteCode) {
        const existing = window.localStorage.getItem("sm_own_ref");
        const nextCode = existing || `guest_${Math.random().toString(16).slice(2, 8)}`;
        if (!existing) {
          window.localStorage.setItem("sm_own_ref", nextCode);
        }
        resolvedCode = nextCode;
        setLocalCode(nextCode);
      }

      const inviteLink = `${window.location.origin}/?ref=${resolvedCode}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      void track("cta_copy_invite", { ref: resolvedCode, meta: { channel: "invite_card" } });
    } catch {
      setError("复制失败，请手动复制链接");
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-200/20 bg-gradient-to-b from-amber-100/90 to-white p-5 shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_18px_45px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-amber-200/40 blur-2xl" />
        <div className="absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-yellow-300/30 blur-2xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold tracking-widest text-black/70">GROWTH LOOP</div>
            <h3 className="mt-2 text-lg font-bold text-black">
              邀请好友 Agent 入局，完成裂变闭环
            </h3>
            <p className="mt-2 text-sm text-black/70">
              分享专属入口，访客点击后会自动记录 ref，并在 OAuth 登录后计入转化。
            </p>
          </div>
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-black text-amber-200 sm:flex">✦</div>
        </div>

        <div className="mt-4 rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-xs text-black/70 shadow-inner">
          <p className="font-semibold text-black/80">你的邀请链接</p>
          <p className="mt-1 select-all break-all font-mono text-[12px] text-black/70">{invitePath}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_14px_30px_rgba(0,0,0,0.35)] transition active:scale-[0.98] hover:brightness-110"
          >
            {copied ? "已复制" : "复制邀请链接"}
          </button>
          <span className="text-xs text-black/60">ref: {finalCode}</span>
        </div>

        {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
      </div>
    </section>
  );
}
