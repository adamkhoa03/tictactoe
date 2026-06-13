import React from "react";
import { useTranslation } from "react-i18next";

interface TurnTimerProps {
  timeLeft: number;
  maxTime?: number;
  symbolColor?: "X" | "O";
}

export const TurnTimer: React.FC<TurnTimerProps> = ({
  timeLeft,
  maxTime = 30,
  symbolColor = "X",
}) => {
  const { t } = useTranslation();

  // SVG parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  // Calculate percentage offset
  const progress = Math.max(0, Math.min(timeLeft, maxTime)) / maxTime;
  const strokeDashoffset = circumference - progress * circumference;

  const isLowTime = timeLeft <= 10;
  
  // Set timer color based on active symbol and time status
  const getTimerColors = () => {
    if (isLowTime) {
      return {
        text: "text-error animate-pulse",
        circle: "text-error",
      };
    }
    return symbolColor === "X"
      ? { text: "text-primary", circle: "text-primary" }
      : { text: "text-secondary", circle: "text-secondary" };
  };

  const colors = getTimerColors();

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-lg">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            className="text-outline-variant/15"
            cx="56"
            cy="56"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            className={`timer-circle transition-all duration-1000 ease-linear ${colors.circle}`}
            cx="56"
            cy="56"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="6"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-headline-lg text-3xl font-bold font-quicksand ${colors.text}`}>
            {timeLeft}s
          </span>
        </div>
      </div>
      <p className="mt-3 font-label-bold text-on-surface-variant uppercase text-[10px] tracking-widest text-center">
        {t("timeLeft", "Time Remaining")}
      </p>
    </div>
  );
};
