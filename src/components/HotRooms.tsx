"use client";

import { formatChips } from "@/lib/format";
import type { Room } from "@/types/domain";

type HotRoomsProps = {
  rooms: Room[];
  onSpectate: (roomId: string) => void;
};

const riskLabel: Record<Room["risk"], string> = {
  low: "低波动",
  medium: "中风险",
  high: "高波动",
};

const statusLabel: Record<Room["status"], string> = {
  new: "新开",
  hot: "火热",
  stable: "稳定",
};

export default function HotRooms({ rooms, onSpectate }: HotRoomsProps) {
  return (
    <section className="rounded-3xl border border-amber-200/10 bg-black/50 p-6 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-amber-200/70">Hot Rooms</div>
          <h2 className="mt-2 text-xl font-bold text-white">实时房间列表</h2>
        </div>
        <span className="rounded-full border border-amber-200/20 bg-black/70 px-3 py-1 text-xs text-amber-100">
          滚动更新
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {rooms.map((room) => (
          <article
            key={room.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/55 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{room.name}</p>
              <p className="mt-1 text-xs text-white/60">
                {room.mode} · {riskLabel[room.risk]}
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs text-white/60">
              <div>
                <p className="text-amber-200">{formatChips(room.pool)}</p>
                <p>奖池</p>
              </div>
              <div>
                <p className="text-emerald-300">{room.watchers}</p>
                <p>围观</p>
              </div>
              <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-amber-100">
                {statusLabel[room.status]}
              </span>
              <button
                type="button"
                onClick={() => onSpectate(room.id)}
                className="rounded-full border border-amber-200/25 bg-black/70 px-3 py-1 text-amber-100 transition hover:bg-amber-200/20"
              >
                围观
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
