import { useCallback, useEffect, useState } from "react";

import type { UserProfileData } from "@/components/UserProfile";
import {
  fetchAuthSession,
  fetchSessions,
  fetchShades,
  fetchSoftmemory,
  fetchUserInfo,
  logout as logoutApi,
} from "@/lib/secondme-client";

type DashboardState = {
  user: UserProfileData | null;
  loading: boolean;
  shades: unknown[];
  softmemory: unknown[];
  sessions: unknown[];
};

export default function useSecondMeDashboard() {
  const [state, setState] = useState<DashboardState>({
    user: null,
    loading: true,
    shades: [],
    softmemory: [],
    sessions: [],
  });

  const loadProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const sessionResult = await fetchAuthSession();
    if (!sessionResult.ok || !sessionResult.data?.loggedIn) {
      setState((prev) => ({
        ...prev,
        user: null,
        loading: false,
      }));
      return;
    }

    const result = await fetchUserInfo<UserProfileData>();
    setState((prev) => ({
      ...prev,
      user: result.ok ? result.data : null,
      loading: false,
    }));
  }, []);

  const loadExtras = useCallback(async () => {
    if (!state.user) {
      setState((prev) => ({ ...prev, shades: [], softmemory: [], sessions: [] }));
      return;
    }

    const [shadesResult, softmemoryResult, sessionsResult] = await Promise.all([
      fetchShades<{ shades?: unknown[] }>(),
      fetchSoftmemory<{ list?: unknown[] }>(),
      fetchSessions<{ sessions?: unknown[] }>(),
    ]);

    setState((prev) => ({
      ...prev,
      shades: shadesResult.ok ? shadesResult.data?.shades ?? [] : [],
      softmemory: softmemoryResult.ok ? softmemoryResult.data?.list ?? [] : [],
      sessions: sessionsResult.ok ? sessionsResult.data?.sessions ?? [] : [],
    }));
  }, [state.user]);

  const refresh = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await logoutApi();
    setState((prev) => ({ ...prev, user: null, shades: [], softmemory: [], sessions: [] }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadProfile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadExtras();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadExtras]);

  return {
    ...state,
    refresh,
    logout,
  };
}
