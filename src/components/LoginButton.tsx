"use client";

import { useTransition } from "react";

import { useTelemetry } from "@/hooks/useTelemetry";

type LoginButtonProps = {
  isAuthed: boolean;
  onLogout: () => Promise<void>;
};

export default function LoginButton({ isAuthed, onLogout }: LoginButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { track } = useTelemetry();

  const handleClick = () => {
    if (isAuthed) {
      startTransition(async () => {
        await onLogout();
      });
      return;
    }

    void track("cta_join_oauth", { meta: { location: "login_button" } });
    window.location.href = "/api/auth/login";
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/70 px-5 py-2.5 text-sm font-semibold text-amber-100 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.7)] backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-200/40 hover:bg-black/60"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
      {isAuthed ? (isPending ? "正在退出..." : "退出 SecondMe") : "使用 SecondMe 登录"}
    </button>
  );
}
