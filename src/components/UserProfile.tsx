export type UserProfileData = {
  name?: string;
  email?: string;
  avatarUrl?: string;
  route?: string;
  referralCode?: string;
};

type UserProfileProps = {
  user: UserProfileData | null;
  shades: unknown[];
  softmemory: unknown[];
  loading?: boolean;
};

function formatItem(item: unknown) {
  if (typeof item === "string") {
    return item;
  }
  if (typeof item === "number") {
    return item.toString();
  }
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>;
    return (
      (typeof record.name === "string" && record.name) ||
      (typeof record.label === "string" && record.label) ||
      (typeof record.title === "string" && record.title) ||
      JSON.stringify(record)
    );
  }
  return "-";
}

export default function UserProfile({ user, shades, softmemory, loading }: UserProfileProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-amber-200/10 bg-black/50 p-6 shadow-sm">
        <p className="text-sm text-white/70">正在读取你的 SecondMe 画像...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-amber-200/30 bg-black/40 p-6">
        <p className="text-sm text-white/60">登录后即可查看你的 SecondMe 画像与记忆碎片。</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-3xl border border-amber-200/10 bg-black/55 p-6 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name ?? "头像"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-white/40">暂无头像</div>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user.name ?? "未命名访客"}</p>
            <p className="text-sm text-white/60">{user.email ?? "未绑定邮箱"}</p>
            {user.route ? (
              <p className="text-xs text-white/45">路线标识：{user.route}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/70">兴趣标签</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {shades.length ? (
              shades.map((item, index) => (
                <span
                  key={`${formatItem(item)}-${index}`}
                  className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-xs font-medium text-amber-100"
                >
                  {formatItem(item)}
                </span>
              ))
            ) : (
              <span className="text-xs text-white/45">暂无标签</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-200/10 bg-black/45 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/70">软记忆碎片</p>
        <div className="mt-4 space-y-3 text-sm text-white/70">
          {softmemory.length ? (
            softmemory.slice(0, 6).map((item, index) => (
              <div key={`${formatItem(item)}-${index}`} className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3">
                {formatItem(item)}
              </div>
            ))
          ) : (
            <p className="text-xs text-white/45">暂无软记忆</p>
          )}
        </div>
      </div>
    </div>
  );
}
