import React from "react";
import { useTranslation } from "react-i18next";

export interface OnlinePlayer {
  id: string;
  username: string;
  rank: string;
  isPlaying: boolean;
  isOnline: boolean;
}

interface OnlinePlayersPanelProps {
  players?: OnlinePlayer[];
  totalOnline?: number;
  currentUserId?: string;
  onInvite?: (userId: string) => void;
  showInviteButton?: boolean;
}

export const OnlinePlayersPanel: React.FC<OnlinePlayersPanelProps> = ({
  players = [],
  totalOnline = 0,
  currentUserId = "",
  onInvite,
  showInviteButton = false,
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
      className="glass-panel rounded-3xl p-5 shadow-lg border border-outline-variant/20 flex flex-col h-full max-h-[500px]"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <h3 className="font-quicksand font-bold text-headline-md text-on-surface">
          {t("onlinePlayers", "Người chơi")}
        </h3>
        <span className="flex items-center gap-1.5 bg-green-500/10 text-green-600 border border-green-500/25 px-2.5 py-1 rounded-full font-quicksand font-bold text-label-status">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          {totalOnline} online
        </span>
      </div>

      {/* Players list */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {players.length === 0 ? (
          <p className="text-center font-nunito text-on-surface-variant text-sm py-8">
            Chưa có người chơi nào
          </p>
        ) : (
          players.map((player) => {
            const isMe = player.id === currentUserId;
            
            return (
              <div
                key={player.id}
                id={`online-player-${player.id}`}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface-container/60 transition-colors group"
              >
                {/* Avatar with status dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-outline-variant/30 flex items-center justify-center">
                    <span className="font-quicksand font-bold text-[13px] text-primary">
                      {player.username.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  {/* Online/Offline status dot */}
                  <div 
                    className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full ${
                      player.isOnline ? "bg-green-500" : "bg-slate-400"
                    }`}
                  >
                    {player.isOnline && !player.isPlaying && (
                      <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75" />
                    )}
                  </div>
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <p className="font-quicksand font-bold text-label-bold text-on-surface truncate">
                    {player.username} {isMe && <span className="text-primary font-normal text-xs">(Bạn)</span>}
                  </p>
                  <p className={`font-nunito text-[10px] font-bold uppercase tracking-wider truncate ${getRankColor(player.rank)}`}>
                    {player.isPlaying ? (
                      <span className="text-amber-500">⚔ In Game</span>
                    ) : player.isOnline ? (
                      <span className="text-green-500">Online</span>
                    ) : (
                      <span className="text-slate-400">Offline</span>
                    )}
                  </p>
                </div>

                {/* Invite button (visible on hover) */}
                {player.isOnline && !player.isPlaying && !isMe && showInviteButton && onInvite && (
                  <button
                    id={`btn-invite-${player.id}`}
                    onClick={() => onInvite(player.id)}
                    className="flex-shrink-0 bg-primary text-on-primary px-3 py-1.5 rounded-xl font-quicksand font-bold text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                  >
                    Mời
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
