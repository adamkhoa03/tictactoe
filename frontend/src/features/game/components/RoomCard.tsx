import React from "react";
import { useTranslation } from "react-i18next";
import { PublicRoom } from "@/features/game/slices/gameSlice";

interface RoomCardProps {
  room: PublicRoom;
  onJoin: (roomId: string) => void;
  isJoining?: boolean;
}

const boardSizeLabel = (size: number): string => {
  const map: Record<number, string> = {
    3: "Classic 3×3",
    6: "Pro 6×6",
    9: "Expert 9×9",
    11: "Master 11×11",
    15: "Mega 15×15",
  };
  return map[size] ?? `${size}×${size}`;
};

const boardSizeIcon = (size: number): string => {
  if (size <= 3) return "grid_3x3";
  if (size <= 6) return "grid_4x4";
  return "grid_view";
};

const boardSizeColor = (size: number): string => {
  if (size <= 3) return "from-primary/20 to-primary/5 text-primary border-primary/20";
  if (size <= 6) return "from-secondary/20 to-secondary/5 text-secondary border-secondary/20";
  if (size <= 9) return "from-emerald-500/20 to-emerald-500/5 text-emerald-600 border-emerald-500/20";
  return "from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-500/20";
};

const timeAgo = (dateStr: string): string => {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
};

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin, isJoining }) => {
  const { t } = useTranslation();
  const colorClass = boardSizeColor(room.boardSize);

  return (
    <div
      id={`room-card-${room.id}`}
      className="group glass-panel rounded-2xl p-4 border border-outline-variant/20 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
      onClick={() => onJoin(room.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onJoin(room.id)}
    >
      <div className="flex items-center gap-3">
        {/* Board size icon badge */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} border flex items-center justify-center transition-transform group-hover:scale-110`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {boardSizeIcon(room.boardSize)}
          </span>
        </div>

        {/* Room info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-quicksand font-bold text-label-bold text-on-surface truncate">
              {boardSizeLabel(room.boardSize)}
            </h3>
            <span className="flex-shrink-0 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded-full font-quicksand font-bold text-[10px] uppercase tracking-wider">
              {t("waiting")}
            </span>
          </div>
          <p className="font-nunito text-label-status text-on-surface-variant truncate mt-0.5">
            🎮 {room.hostUsername} · {t("winCondition")}: {room.winCondition} · {timeAgo(room.createdAt)}
          </p>
        </div>

        {/* Join button */}
        <button
          id={`btn-join-${room.id}`}
          className="flex-shrink-0 bg-primary text-on-primary px-4 py-2 rounded-xl font-quicksand font-bold text-label-bold shadow-md shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isJoining}
          onClick={(e) => {
            e.stopPropagation();
            onJoin(room.id);
          }}
        >
          {isJoining ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              {t("joining")}
            </span>
          ) : (
            t("join")
          )}
        </button>
      </div>
    </div>
  );
};
