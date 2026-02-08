"use client";

import { useMemo, useState } from "react";

import { formatChips } from "@/lib/format";
import type { Room } from "@/types/domain";

type SpectateBetPanelProps = {
  rooms: Room[];
  onBet: (payload: { roomId: string; chips: number; side: string }) => void;
};

export default function SpectateBetPanel({ rooms, onBet }: SpectateBetPanelProps) {
  const defaultRoom = useMemo(() => rooms[0]?.id ?? "", [rooms]);
  const [roomId, setRoomId] = useState("");
  const [chips, setChips] = useState(600);
  const [side, setSide] = useState("效率派");
  const selectedRoomId = useMemo(
    () => (rooms.some((room) => room.id === roomId) ? roomId : defaultRoom),
    [roomId, rooms, defaultRoom]
  );

  return (
    <section className="rounded-3xl border border-amber-200/10 bg-black/50 p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Spectate + Sim Bet</div>
      <h2 className="mt-2 text-xl font-bold text-white">围观下注入口</h2>
      <p className="mt-2 text-sm text-white/70">
        选择房间后进行模拟下注，使用算力筹码完成体验闭环。
      </p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-xs text-white/60">房间</span>
          <select
            value={selectedRoomId}
            onChange={(event) => setRoomId(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-amber-200/20 bg-black/70 px-3 py-2 text-sm text-white"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-white/60">阵营</span>
          <select
            value={side}
            onChange={(event) => setSide(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-amber-200/20 bg-black/70 px-3 py-2 text-sm text-white"
          >
            <option>效率派</option>
            <option>逆转派</option>
            <option>多数派</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-white/60">筹码</span>
          <input
            type="range"
            min={200}
            max={4000}
            step={100}
            value={chips}
            onChange={(event) => setChips(Number(event.target.value))}
            className="mt-2 w-full accent-amber-300"
          />
          <p className="text-sm text-amber-200">{formatChips(chips)} 模拟筹码</p>
        </label>

        <button
          type="button"
          disabled={!selectedRoomId}
          onClick={() => onBet({ roomId: selectedRoomId, chips, side })}
          className="w-full rounded-2xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:opacity-40"
        >
          提交模拟下注
        </button>
      </div>
    </section>
  );
}
