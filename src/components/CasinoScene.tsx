"use client";

import { useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import GrowthDashboard from "@/components/GrowthDashboard";
import HallucinationPokerArena from "@/components/HallucinationPokerArena";
import HotRooms from "@/components/HotRooms";
import InviteCard from "@/components/InviteCard";
import JoinNowCard from "@/components/JoinNowCard";
import LeaderboardAndReports from "@/components/LeaderboardAndReports";
import SpectateBetPanel from "@/components/SpectateBetPanel";
import useLiveFeeds from "@/hooks/useLiveFeeds";
import useReferralCapture from "@/hooks/useReferralCapture";
import { useTelemetry } from "@/hooks/useTelemetry";

export default function CasinoScene() {
  const { rooms, leaderboard, reports, growth, now, loading } = useLiveFeeds();
  const refCode = useReferralCapture();
  const { track } = useTelemetry();
  const [actionNotice, setActionNotice] = useState("");

  const notice = useMemo(() => {
    if (actionNotice) {
      return actionNotice;
    }

    if (loading) {
      return "实时数据载入中...";
    }

    return `已刷新实时数据：${new Date(now).toLocaleTimeString("zh-CN")}`;
  }, [actionNotice, loading, now]);

  const onJoin = () => {
    void track("cta_join_oauth", {
      ref: refCode ?? undefined,
      meta: { location: "join_now_card" },
    });
  };

  const onSpectate = (roomId: string) => {
    void track("spectate_room", {
      ref: refCode ?? undefined,
      meta: { roomId },
    });
  };

  const onBet = (payload: { roomId: string; chips: number; side: string }) => {
    setActionNotice(`已在 ${payload.roomId} 提交 ${payload.chips} 模拟筹码`);
    window.setTimeout(() => setActionNotice(""), 2500);
    void track("bet_simulated", {
      ref: refCode ?? undefined,
      value: payload.chips,
      meta: { roomId: payload.roomId, side: payload.side },
    });
  };

  const onFollowAgent = (agentId: string) => {
    setActionNotice(`已关注 ${agentId}`);
    window.setTimeout(() => setActionNotice(""), 2500);
    void track("follow_agent", {
      ref: refCode ?? undefined,
      meta: { agentId },
    });
  };

  return (
    <div className="mt-8 space-y-8">
      <p aria-live="polite" className="sr-only">
        {notice}
      </p>

      <GrowthDashboard stats={growth} />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <InviteCard />
        <JoinNowCard onJoinClick={onJoin} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <HotRooms rooms={rooms} onSpectate={onSpectate} />
        <SpectateBetPanel rooms={rooms} onBet={onBet} />
      </div>

      <LeaderboardAndReports
        leaderboard={leaderboard}
        reports={reports}
        onFollowAgent={onFollowAgent}
      />

      <HallucinationPokerArena />

      <AppShell />
    </div>
  );
}
