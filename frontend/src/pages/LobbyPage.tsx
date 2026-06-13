import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { UserProfileWidget } from "@/features/game/components/UserProfileWidget";
import { RoomListPanel } from "@/features/game/components/RoomListPanel";
import { OnlinePlayersPanel } from "@/features/game/components/OnlinePlayersPanel";
import { CreateRoomModal } from "@/features/game/components/CreateRoomModal";

export const LobbyPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const isConnected = useAppSelector((state) => state.socket.isConnected);
  const socketError = useAppSelector((state) => state.socket.error);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [isQuickMatching, setIsQuickMatching] = useState(false);

  const handleJoinRoom = useCallback((roomId: string) => {
    setJoiningRoomId(roomId);
    // TODO: dispatch socket join_room event
    setTimeout(() => setJoiningRoomId(null), 1500); // placeholder
  }, []);

  const handleQuickMatch = useCallback(() => {
    setIsQuickMatching(true);
    // TODO: dispatch socket find_random_room event
    setTimeout(() => setIsQuickMatching(false), 4000); // placeholder
  }, []);

  const handleCancelQuickMatch = useCallback(() => {
    setIsQuickMatching(false);
    // TODO: cancel socket matchmaking
  }, []);

  const handleCreateRoom = useCallback((_boardSize: number, _winCondition: number) => {
    setIsCreating(true);
    // TODO: dispatch socket create_room event
    setTimeout(() => {
      setIsCreating(false);
      setIsCreateModalOpen(false);
    }, 1200); // placeholder
  }, []);

  const getConnectionBanner = () => {
    if (socketError) {
      return (
        <div
          id="connection-error-banner"
          className="mx-6 md:mx-8 mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-600"
        >
          <span className="material-symbols-outlined text-[20px]">wifi_off</span>
          <div>
            <p className="font-quicksand font-bold text-label-bold">{t("connectionError")}</p>
            <p className="font-nunito text-label-status opacity-80">{socketError}</p>
          </div>
        </div>
      );
    }
    if (!isConnected) {
      return (
        <div
          id="connecting-banner"
          className="mx-6 md:mx-8 mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600"
        >
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="font-quicksand font-bold text-label-bold">{t("connectingToServer")}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Connection status banner */}
      {getConnectionBanner()}

      {/* Main 3-column grid */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* === LEFT COLUMN: Profile + Board size quick filters === */}
        <aside className="lg:col-span-3 space-y-5">
          {/* User profile widget */}
          <UserProfileWidget />

          {/* Board size quick nav */}
          <div className="glass-panel rounded-3xl p-3 hidden lg:block">
            <p className="font-quicksand font-bold text-label-status text-on-surface-variant uppercase tracking-wider px-2 pt-1 pb-2 text-[10px]">
              {t("quickFilter")}
            </p>
            <div className="flex flex-col gap-1">
              {[
                { label: "Classic 3×3", icon: "grid_3x3", size: 3, active: true },
                { label: "Pro 6×6", icon: "grid_4x4", size: 6, active: false },
                { label: "Expert 9×9", icon: "grid_view", size: 9, active: false },
                { label: "Master 11×11", icon: "grid_view", size: 11, active: false },
                { label: "Mega 15×15", icon: "grid_view", size: 15, active: false },
              ].map((item) => (
                <button
                  key={item.size}
                  id={`sidebar-filter-${item.size}`}
                  className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] ${
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-quicksand font-bold text-label-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* === MIDDLE COLUMN: Room list === */}
        <main className="lg:col-span-6 flex flex-col">
          {/* Hero greeting */}
          <div className="text-center mb-4 py-4">
            <h1 className="font-quicksand font-bold text-headline-lg text-on-surface tracking-tight mb-2">
              {t("lobbyTitle")}
            </h1>
            <p className="font-nunito text-body-md text-on-surface-variant">
              {t("lobbySubtitle")}{" "}
              <span className="text-primary font-bold">{user?.username}</span>!
            </p>
          </div>

          {/* ===== QUICK MATCH BUTTON ===== */}
          <div className="mb-5">
            {isQuickMatching ? (
              /* Searching state */
              <div
                id="quick-match-searching"
                className="relative glass-panel rounded-3xl p-5 border border-primary/30 shadow-xl overflow-hidden"
              >
                {/* Animated scanning line */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                  <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 animate-scanning" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Pulsing radar icon */}
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDelay: "0.4s" }} />
                      <div className="relative w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[24px]">radar</span>
                      </div>
                    </div>

                    <div>
                      <p className="font-quicksand font-bold text-label-bold text-on-surface">
                        {t("searchingMatch")}
                      </p>
                      <p className="font-nunito text-label-status text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="inline-flex gap-0.5">
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                        {t("searchingMatchDesc")}
                      </p>
                    </div>
                  </div>

                  <button
                    id="btn-cancel-quick-match"
                    onClick={handleCancelQuickMatch}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl border border-outline-variant/40 text-on-surface-variant hover:text-error hover:border-red-400/40 hover:bg-red-500/5 font-quicksand font-bold text-label-bold transition-all duration-200"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                    {t("cancelSearch")}
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Match button */
              <button
                id="btn-quick-match"
                onClick={handleQuickMatch}
                className="group relative w-full py-5 rounded-3xl overflow-hidden shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-secondary transition-all duration-500" />
                {/* Shimmer sweep */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12" />

                <div className="relative flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-on-primary text-[24px] group-hover:rotate-[360deg] transition-transform duration-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    bolt
                  </span>
                  <span className="font-quicksand font-bold text-[20px] text-on-primary tracking-tight">
                    {t("quickMatch")}
                  </span>
                  <span className="material-symbols-outlined text-on-primary/70 text-[20px]">arrow_forward</span>
                </div>
                <p className="relative font-nunito text-label-status text-on-primary/75 mt-1">
                  {t("quickMatchDesc")}
                </p>
              </button>
            )}
          </div>
          {/* ============================= */}

          {/* Room list panel in glass container */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl flex-1 flex flex-col min-h-[500px]">
            <RoomListPanel
              onJoinRoom={handleJoinRoom}
              onCreateRoom={() => setIsCreateModalOpen(true)}
              joiningRoomId={joiningRoomId}
            />
          </div>

          {/* Bento info cards */}
          <div className="grid grid-cols-2 gap-4 mt-5">
            <div
              id="daily-mission-card"
              className="glass-panel p-5 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-surface/90 transition-all hover:shadow-lg"
            >
              <div className="w-11 h-11 rounded-2xl bg-secondary/15 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">emoji_events</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-quicksand font-bold text-label-bold text-on-surface">
                  {t("dailyMission")}
                </h3>
                <p className="font-nunito text-label-status text-on-surface-variant truncate">
                  {t("dailyMissionDesc")}
                </p>
              </div>
            </div>

            <div
              id="hot-streak-card"
              className="glass-panel p-5 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-surface/90 transition-all hover:shadow-lg"
            >
              <div className="w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">local_fire_department</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-quicksand font-bold text-label-bold text-on-surface">
                  {t("hotStreak")}
                </h3>
                <p className="font-nunito text-label-status text-on-surface-variant truncate">
                  {t("hotStreakDesc")}
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* === RIGHT COLUMN: Online players === */}
        <aside className="lg:col-span-3">
          <OnlinePlayersPanel totalOnline={142} />
        </aside>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
        isCreating={isCreating}
      />
    </>
  );
};
