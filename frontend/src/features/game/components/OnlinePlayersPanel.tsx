import React from "react";
import { useTranslation } from "react-i18next";

interface OnlinePlayer {
  id: string;
  username: string;
  rank: string;
  isPlaying: boolean;
}

// Static mock data — will be replaced by socket events in Phase 2
const MOCK_ONLINE_PLAYERS: OnlinePlayer[] = [
  { id: "1", username: "Kai_Zenith", rank: "Grandmaster", isPlaying: false },
  { id: "2", username: "MoonLight", rank: "Diamond III", isPlaying: true },
  { id: "3", username: "StormWalker", rank: "Gold I", isPlaying: false },
  { id: "4", username: "NeonBlade", rank: "Platinum II", isPlaying: false },
  { id: "5", username: "StarForge", rank: "Diamond I", isPlaying: true },
  { id: "6", username: "VoidRunner", rank: "Silver II", isPlaying: false },
];

interface OnlinePlayersPanelProps {
  totalOnline?: number;
}

export const OnlinePlayersPanel: React.FC<OnlinePlayersPanelProps> = ({
  totalOnline = 142,
}) => {
  const { t } = useTranslation();

  const getRankColor = (rank: string): string => {
    const lower = rank.toLowerCase();
    if (lower.includes("grand")) return "text-amber-500";
    if (lower.includes("diamond")) return "text-cyan-500";
    if (lower.includes("plat")) return "text-emerald-500";
    if (lower.includes("gold")) return "text-yellow-500";
    if (lower.includes("silver")) return "text-slate-400";
    return "text-amber-700";
  };

  return (
    <div
      id="online-players-panel"
      className="glass-panel rounded-3xl p-5 shadow-lg border border-outline-variant/20 flex flex-col h-full"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-quicksand font-bold text-headline-md text-on-surface">
          {t("onlinePlayers")}
        </h3>
        <span className="flex items-center gap-1.5 bg-green-500/10 text-green-600 border border-green-500/25 px-2.5 py-1 rounded-full font-quicksand font-bold text-label-status">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          {totalOnline}
        </span>
      </div>

      {/* Players list */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {MOCK_ONLINE_PLAYERS.map((player) => (
          <div
            key={player.id}
            id={`online-player-${player.id}`}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-container/60 transition-colors group cursor-pointer"
          >
            {/* Avatar with status dot */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-outline-variant/30 flex items-center justify-center">
                <span className="font-quicksand font-bold text-[13px] text-primary">
                  {player.username.slice(0, 2).toUpperCase()}
                </span>
              </div>
              {/* Online status dot */}
              <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full bg-green-500">
                {!player.isPlaying && (
                  <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75" />
                )}
              </div>
            </div>

            {/* Player info */}
            <div className="flex-1 min-w-0">
              <p className="font-quicksand font-bold text-label-bold text-on-surface truncate">
                {player.username}
              </p>
              <p className={`font-nunito text-[10px] font-bold uppercase tracking-wider truncate ${getRankColor(player.rank)}`}>
                {player.isPlaying ? (
                  <span className="text-amber-500">⚔ In Game</span>
                ) : (
                  player.rank
                )}
              </p>
            </div>

            {/* Challenge button (visible on hover) */}
            {!player.isPlaying && (
              <button
                id={`btn-challenge-${player.id}`}
                className="flex-shrink-0 bg-primary text-on-primary px-3 py-1.5 rounded-xl font-quicksand font-bold text-label-status opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 whitespace-nowrap"
              >
                {t("challenge")}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer action */}
      <div className="pt-4 mt-4 border-t border-outline-variant/15">
        <button
          id="btn-invite-friend"
          className="w-full py-2.5 rounded-2xl glass-panel border border-outline-variant/30 text-on-surface font-quicksand font-bold text-label-bold hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          {t("inviteFriend")}
        </button>
      </div>
    </div>
  );
};
