import React from "react";
import { PlayerSymbol } from "@/features/game/slices/gameSlice";

interface PlayerCardProps {
  username: string;
  symbol: PlayerSymbol;
  score: number;
  level?: number;
  avatarUrl?: string;
  isActive: boolean;
  isCurrentUser: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  username,
  symbol,
  score,
  level = 1,
  avatarUrl,
  isActive,
  isCurrentUser,
}) => {
  // Setup default placeholder avatars or design specs avatars
  const defaultAvatar =
    symbol === "X"
      ? "https://lh3.googleusercontent.com/aida-public/AB6AXuA96QDCOMN-7p6kC0hxlX6PZVKzix7med3UQbC5hAWj91KKB0vEtPRO3ChQYBtLGxAyXGFHttOxuNsGZYdaEmDXKwA0KJ1fdNoKPtTHBol5ChYALIYUfFDZKtSzzbIA82EcfG-21Z3bvRAmb_KNMA-oA-ZC7j46EZNzAUbgPTQpA-0EUuMSwnZJE3R2w5KKimFY0HqgrKov2Mvl9-pyof2_xSirKSnrkXUdI6yAp0BA2D684s29GunlNzchF_vyrnYgL93DMkmhpdw"
      : "https://lh3.googleusercontent.com/aida-public/AB6AXuDLnPZ0PnO0dTZjb1gwSPFULB7HLQVDKUcnd-z_hosQ5lgZ5Wh9TDIv3eKRMH_0fQ9xsnqmeS63_VKgfJy-SpMokL8vuTsRVxL329Ogb1T9VqdghyZ4gAeopFj9WVgqHZ1kbXlpASeUfRjLml4Vom8AQepMxw-9yDVm6vX1mmqP5S4hJK1GD-WIiqzpxBG2eq9uD8-GsC_Nu6iGeFQEfTw9ssLTErRQm9FnC2lImGiqVwA_HeAspuXjRh5e7wjkssrUAsllyspHhKw";

  const displayAvatar = avatarUrl || defaultAvatar;

  return (
    <div
      className={`
        glass-panel rounded-3xl p-5 shadow-xl transition-all duration-300 border-2
        ${
          isActive
            ? symbol === "X"
              ? "border-primary active-turn-glow shadow-primary/10"
              : "border-secondary active-turn-glow shadow-secondary/10"
            : "border-transparent opacity-85 hover:opacity-100"
        }
      `}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img
            alt={username}
            className={`w-14 h-14 rounded-2xl object-cover bg-surface-container-high border-2 ${
              symbol === "X" ? "border-primary/20" : "border-secondary/20"
            }`}
            src={displayAvatar}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-surface rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`font-headline-md truncate ${
              isCurrentUser
                ? symbol === "X"
                  ? "text-primary"
                  : "text-secondary"
                : "text-on-surface"
            }`}
          >
            {isCurrentUser ? `${username} (You)` : username}
          </h4>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`
                px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                ${
                  symbol === "X"
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-secondary-container text-on-secondary-container"
                }
              `}
            >
              LVL {level}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
        <span
          className={`font-display-game-piece text-4xl select-none ${
            symbol === "X" ? "game-piece-x" : "game-piece-o"
          }`}
        >
          {symbol}
        </span>
        <div className="text-right">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
            Score
          </p>
          <p className="text-xl font-bold font-quicksand text-on-surface">
            {score}
          </p>
        </div>
      </div>
    </div>
  );
};
