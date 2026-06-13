import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";

export const UserProfileWidget: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  const gamesPlayed = user.gamesPlayed ?? user.matchesPlayed ?? 0;
  const wins = user.wins ?? user.matchesWon ?? 0;
  const losses = user.losses ?? 0;
  const draws = user.draws ?? 0;

  const winRate =
    gamesPlayed > 0
      ? Math.round((wins / gamesPlayed) * 100)
      : 0;

  const formatNumber = (n: number | undefined | null) => {
    if (!n) return "0";
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const getAvatarInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getEloTier = (elo: number | undefined | null): { label: string; color: string } => {
    const rating = elo ?? 1200;
    if (rating >= 2000) return { label: "Grandmaster", color: "text-amber-500" };
    if (rating >= 1700) return { label: "Diamond", color: "text-cyan-500" };
    if (rating >= 1500) return { label: "Platinum", color: "text-emerald-500" };
    if (rating >= 1300) return { label: "Gold", color: "text-yellow-500" };
    if (rating >= 1100) return { label: "Silver", color: "text-slate-400" };
    return { label: "Bronze", color: "text-amber-700" };
  };

  const tier = getEloTier(user.eloRating);

  return (
    <div
      id="user-profile-widget"
      className="glass-panel rounded-3xl p-6 shadow-xl text-center relative overflow-hidden group"
    >
      {/* Decorative glow blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/8 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110 pointer-events-none" />

      <div className="relative">
        {/* Avatar */}
        <div className="w-20 h-20 mx-auto rounded-full border-4 border-primary/40 p-0.5 mb-4 shadow-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-quicksand font-bold text-[26px] text-primary">
              {getAvatarInitials(user.username)}
            </span>
          </div>
        </div>

        {/* Name & Tier */}
        <h2 className="font-quicksand font-bold text-headline-md text-on-surface mb-0.5">
          {user.username}
        </h2>
        <p className={`font-quicksand font-bold text-label-bold mb-1 ${tier.color}`}>
          {tier.label}
        </p>
        <p className="font-nunito text-label-status text-on-surface-variant mb-4">
          {t("eloRating")}: <span className="font-bold text-primary">{user.eloRating ?? 1200}</span>
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-low/60 rounded-2xl p-3 border border-outline-variant/20 hover:border-primary/30 transition-colors">
            <p className="font-nunito text-label-status text-on-surface-variant mb-1">
              {t("winRate")}
            </p>
            <p className="font-quicksand font-bold text-headline-md text-primary">{winRate}%</p>
          </div>
          <div className="bg-surface-container-low/60 rounded-2xl p-3 border border-outline-variant/20 hover:border-secondary/30 transition-colors">
            <p className="font-nunito text-label-status text-on-surface-variant mb-1">
              {t("matches")}
            </p>
            <p className="font-quicksand font-bold text-headline-md text-primary">
              {formatNumber(gamesPlayed)}
            </p>
          </div>
        </div>

        {/* Win / Loss / Draw quick stats */}
        <div className="mt-3 flex gap-2 justify-center flex-wrap">
          <span className="bg-green-500/10 text-green-600 border border-green-500/20 px-2.5 py-0.5 rounded-full font-quicksand font-bold text-[11px]">
            W: {wins}
          </span>
          <span className="bg-red-500/10 text-red-600 border border-red-500/20 px-2.5 py-0.5 rounded-full font-quicksand font-bold text-[11px]">
            L: {losses}
          </span>
          <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-quicksand font-bold text-[11px]">
            D: {draws}
          </span>
        </div>

        {/* Win Streak stats badge */}
        {user.winStreak !== undefined && user.winStreak > 0 && (
          <div className="mt-3 flex items-center justify-center gap-1.5 py-1 px-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[11px] font-bold font-quicksand w-fit mx-auto animate-pulse">
            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
            <span>Chuỗi thắng: {user.winStreak}</span>
          </div>
        )}
      </div>
    </div>
  );
};
