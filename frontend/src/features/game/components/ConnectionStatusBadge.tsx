import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";

export const ConnectionStatusBadge: React.FC = () => {
  const { t } = useTranslation();
  const isConnected = useAppSelector((state) => state.socket.isConnected);
  const socketError = useAppSelector((state) => state.socket.error);

  const getStatusConfig = () => {
    if (isConnected) {
      return {
        dotClass: "bg-green-500",
        pulseClass: "bg-green-500",
        label: t("connected"),
        labelClass: "text-green-600 dark:text-green-400",
        containerClass: "bg-green-500/10 border-green-500/30",
      };
    }
    if (socketError) {
      return {
        dotClass: "bg-red-500",
        pulseClass: "bg-red-500",
        label: t("connectionError"),
        labelClass: "text-red-600 dark:text-red-400",
        containerClass: "bg-red-500/10 border-red-500/30",
      };
    }
    return {
      dotClass: "bg-amber-500",
      pulseClass: "bg-amber-500",
      label: t("connecting"),
      labelClass: "text-amber-600 dark:text-amber-400",
      containerClass: "bg-amber-500/10 border-amber-500/30",
    };
  };

  const config = getStatusConfig();

  return (
    <div
      id="connection-status-badge"
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border glass-panel ${config.containerClass} transition-all duration-500`}
      title={socketError ?? (isConnected ? t("connected") : t("connecting"))}
    >
      {/* Pulsing dot */}
      <div className="relative flex items-center justify-center w-2.5 h-2.5">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.pulseClass}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass}`} />
      </div>
      <span className={`font-quicksand font-bold text-[11px] hidden sm:inline ${config.labelClass}`}>
        {config.label}
      </span>
    </div>
  );
};
