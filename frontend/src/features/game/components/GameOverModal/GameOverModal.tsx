import React from "react";
import { useTranslation } from "react-i18next";
import { GameOverReason } from "@/features/game/types/game.types";

interface GameOverModalProps {
  isOpen: boolean;
  winnerSymbol: "X" | "O" | "DRAW";
  mySymbol: "X" | "O";
  reason: GameOverReason | "normal";
  opponentName: string;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
  onClose?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winnerSymbol,
  mySymbol,
  reason,
  opponentName,
  onPlayAgain,
  onLeaveRoom,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isWin = winnerSymbol === mySymbol;
  const isDraw = winnerSymbol === "DRAW";

  const getReasonText = () => {
    switch (reason) {
      case "surrender":
        return isWin
          ? t("gameOverSurrenderWin", { name: opponentName, defaultValue: `${opponentName} đã đầu hàng!` })
          : t("gameOverSurrenderLose", "Bạn đã đầu hàng.");
      case "timeout":
        return isWin
          ? t("gameOverTimeoutWin", { name: opponentName, defaultValue: `${opponentName} hết thời gian đi!` })
          : t("gameOverTimeoutLose", "Bạn đã hết thời gian đi.");
      default:
        return isDraw
          ? t("gameOverDrawDesc", "Bàn cờ đã đầy. Trận đấu kết thúc với kết quả Hòa!")
          : isWin
          ? t("gameOverNormalWin", "Chúc mừng! Bạn đã giành chiến thắng!")
          : t("gameOverNormalLose", { name: opponentName, defaultValue: `${opponentName} đã chiến thắng.` });
    }
  };

  const getResultConfig = () => {
    if (isDraw) {
      return {
        title: t("gameOverDraw", "Hòa"),
        titleClass: "text-amber-500",
        icon: "handshake",
        bgIconClass: "bg-amber-100 dark:bg-amber-950/20 text-amber-500 border-amber-500/20",
        shadowClass: "shadow-amber-500/10",
      };
    }
    if (isWin) {
      return {
        title: t("gameOverVictory", "Chiến thắng! 🎉"),
        titleClass: "text-emerald-500",
        icon: "emoji_events",
        bgIconClass: "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-500 border-emerald-500/20",
        shadowClass: "shadow-emerald-500/10 border-emerald-500/20",
      };
    }
    return {
      title: t("gameOverDefeat", "Thất bại"),
      titleClass: "text-red-500",
      icon: "sentiment_very_dissatisfied",
      bgIconClass: "bg-red-100 dark:bg-red-950/20 text-red-500 border-red-500/20",
      shadowClass: "shadow-red-500/10 border-red-500/20",
    };
  };

  const config = getResultConfig();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative glass-panel max-w-md w-full p-8 rounded-[32px] border shadow-2xl text-center animate-scaleIn ${config.shadowClass}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        )}

        {/* Result Icon */}
        <div
          className={`w-16 h-16 rounded-3xl border flex items-center justify-center mx-auto mb-5 transition-transform duration-500 hover:scale-110 ${config.bgIconClass}`}
        >
          <span className="material-symbols-outlined text-3xl">{config.icon}</span>
        </div>

        {/* Status Title */}
        <h2 className={`font-headline-lg text-3xl font-bold font-quicksand mb-3 tracking-tight ${config.titleClass}`}>
          {config.title}
        </h2>

        {/* Reason Description */}
        <p className="text-sm text-on-surface-variant font-nunito leading-relaxed mb-8 px-2">
          {getReasonText()}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onLeaveRoom}
            className="flex-1 order-2 sm:order-1 px-6 py-3.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest border border-outline-variant/20 font-quicksand font-bold text-xs text-on-surface transition-all active:scale-95"
            id="btn-leave-match"
          >
            {t("leaveLobby", "Về Lobby")}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 order-3 px-6 py-3.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest border border-outline-variant/20 font-quicksand font-bold text-xs text-on-surface transition-all active:scale-95"
            >
              Đóng
            </button>
          )}
          <button
            onClick={onPlayAgain}
            className="flex-1 order-1 sm:order-2 px-6 py-3.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-quicksand font-bold text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
            id="btn-play-again"
          >
            {t("playAgain", "Chơi lại")}
          </button>
        </div>
      </div>
    </div>
  );
};
