"use client";

import { useEffect, useState } from "react";

import { runAct } from "@/lib/act";
import { addNote } from "@/lib/secondme-client";
import ChatWindow from "@/components/ChatWindow";
import LoginButton from "@/components/LoginButton";
import UserProfile from "@/components/UserProfile";
import useSecondMeDashboard from "@/hooks/useSecondMeDashboard";

const DEFAULT_ACTION_CONTROL =
  "仅输出合法 JSON，不要解释。\n输出结构：{\"intent\": \"like\"|\"dislike\"|\"neutral\"}。\n根据用户表达判断意图，信息不足时返回 neutral。";

function formatJsonOutput(text: string) {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text;
  }
}

export default function AppShell() {
  const { user, loading, shades, softmemory, sessions, logout } = useSecondMeDashboard();
  const [actMessage, setActMessage] = useState("");
  const [actionControl, setActionControl] = useState(DEFAULT_ACTION_CONTROL);
  const [actResult, setActResult] = useState("");
  const [actLoading, setActLoading] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteStatus, setNoteStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const isAuthed = Boolean(user);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (user?.referralCode) {
      window.localStorage.setItem("sm_own_ref", user.referralCode);
    }
  }, [user?.referralCode]);

  const handleAct = async () => {
    if (!actMessage.trim()) return;
    setActLoading(true);
    setActResult("");
    try {
      const resultText = await runAct({
        message: actMessage.trim(),
        actionControl: actionControl.trim(),
      });
      setActResult(formatJsonOutput(resultText));
    } catch {
      setActResult("Act 调用失败，请稍后再试。 ");
    } finally {
      setActLoading(false);
    }
  };

  const handleNote = async () => {
    if (!noteContent.trim()) return;
    setNoteStatus("sending");

    try {
      const result = await addNote(noteContent.trim());
      if (result.ok) {
        setNoteStatus("success");
        setNoteContent("");
      } else {
        setNoteStatus("error");
      }
    } catch {
      setNoteStatus("error");
    }
  };

  return (
    <div className="mt-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/70">SecondMe 控制台</p>
          <h2 className="mt-2 font-display text-3xl text-white">你的 AI 新葡京中枢</h2>
          <p className="mt-2 text-sm text-white/70">
            一站式查看个人画像、对话流与结构化决策，全部通过 SecondMe OAuth 驱动。
          </p>
        </div>
        <LoginButton isAuthed={isAuthed} onLogout={logout} />
      </div>

      <UserProfile user={user} shades={shades} softmemory={softmemory} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <ChatWindow disabled={!isAuthed} />

        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-200/10 bg-black/50 p-6">
            <p className="text-sm font-semibold text-white">结构化动作判断</p>
            <p className="mt-1 text-xs text-white/60">Act API · 输出 JSON 结果</p>
            <textarea
              value={actMessage}
              onChange={(event) => setActMessage(event.target.value)}
              placeholder={isAuthed ? "输入需要判断的文本" : "请先登录 SecondMe"}
              className="mt-4 h-24 w-full resize-none rounded-2xl border border-amber-200/20 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-amber-200/40"
              disabled={!isAuthed}
            />
            <textarea
              value={actionControl}
              onChange={(event) => setActionControl(event.target.value)}
              className="mt-3 h-28 w-full resize-none rounded-2xl border border-amber-200/20 bg-black/70 px-4 py-3 text-xs text-amber-100 outline-none"
              disabled={!isAuthed}
            />
            <button
              type="button"
              onClick={handleAct}
              disabled={!isAuthed || actLoading || !actMessage.trim()}
              className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-amber-300/30"
            >
              {actLoading ? "正在判断..." : "开始判断"}
            </button>
            <pre className="mt-3 max-h-40 overflow-y-auto rounded-2xl border border-amber-200/10 bg-black/60 px-4 py-3 text-xs text-amber-100">
              {actResult || "结果将在这里展示"}
            </pre>
          </div>

          <div className="rounded-3xl border border-amber-200/10 bg-black/50 p-6">
            <p className="text-sm font-semibold text-white">瞬间笔记</p>
            <p className="mt-1 text-xs text-white/60">把当前灵感写入你的 SecondMe 记忆库</p>
            <textarea
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder={isAuthed ? "写下今天的亮点" : "请先登录 SecondMe"}
              className="mt-4 h-24 w-full resize-none rounded-2xl border border-amber-200/20 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-amber-200/40"
              disabled={!isAuthed}
            />
            <button
              type="button"
              onClick={handleNote}
              disabled={!isAuthed || noteStatus === "sending" || !noteContent.trim()}
              className="mt-3 w-full rounded-2xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-emerald-300/30"
            >
              {noteStatus === "sending" ? "写入中..." : "写入 SecondMe"}
            </button>
            {noteStatus === "success" ? (
              <p className="mt-2 text-xs text-emerald-300">已写入记忆库</p>
            ) : null}
            {noteStatus === "error" ? (
              <p className="mt-2 text-xs text-rose-300">写入失败，请稍后再试</p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-amber-200/10 bg-black/45 p-6">
            <p className="text-sm font-semibold text-white">最近会话</p>
            <p className="mt-1 text-xs text-white/60">来自 SecondMe 的会话快照</p>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {sessions.length ? (
                sessions.slice(0, 4).map((item, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3">
                    {typeof item === "string" ? item : JSON.stringify(item)}
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/45">暂无会话</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
