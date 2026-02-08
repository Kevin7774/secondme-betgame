"use client";

import { useEffect, useState } from "react";

import { fetchFeeds } from "@/lib/secondme-client";
import type { Agent, BattleReport, GrowthStats, Room } from "@/types/domain";

type FeedsState = {
  loading: boolean;
  rooms: Room[];
  leaderboard: Agent[];
  reports: BattleReport[];
  growth: GrowthStats | null;
  now: string;
};

export default function useLiveFeeds() {
  const [state, setState] = useState<FeedsState>({
    loading: true,
    rooms: [],
    leaderboard: [],
    reports: [],
    growth: null,
    now: new Date().toISOString(),
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const result = await fetchFeeds();
      if (!active || !result.ok || !result.data) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      setState({
        loading: false,
        rooms: result.data.rooms.slice(0, 6),
        leaderboard: result.data.leaderboard.slice(0, 8),
        reports: result.data.reports.slice(0, 6),
        growth: result.data.growth,
        now: result.data.now,
      });
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 4000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return state;
}
