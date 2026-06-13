import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { UserProfileWidget } from "@/features/game/components/UserProfileWidget";
import { RoomListPanel } from "@/features/game/components/RoomListPanel";
import { OnlinePlayersPanel } from "@/features/game/components/OnlinePlayersPanel";
import { CreateRoomModal } from "@/features/game/components/CreateRoomModal";
import { useSocket, useSocketEvent } from "@/features/socket/hooks/useSocket";
import { setWaitingRooms } from "@/features/game/slices/gameSlice";
import { updateUser } from "@/features/auth/slices/authSlice";

export const LobbyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isConnected = useAppSelector((state) => state.socket.isConnected);
  const socketError = useAppSelector((state) => state.socket.error);
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "lobby";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [isQuickMatching, setIsQuickMatching] = useState(false);

  const [lobbyPlayers, setLobbyPlayers] = useState<any[]>([]);
  const [totalOnline, setTotalOnline] = useState<number>(0);
  const [activeInvite, setActiveInvite] = useState<{ roomId: string, inviterUsername: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);

  const pendingInviteUserId = useRef<string | null>(null);

  // Request players and rooms list on connect or mount
  useEffect(() => {
    if (isConnected) {
      socket.emit("get_lobby_players");
      socket.emit("get_lobby_rooms");
      socket.emit("get_leaderboard");
      socket.emit("get_match_history");
    }
  }, [isConnected, socket]);

  // Listen to lobby rooms updates
  useSocketEvent<any>("lobby_rooms", (data) => {
    dispatch(setWaitingRooms(data.rooms));
  });

  // Listen to lobby players updates
  useSocketEvent<any>("lobby_players", (data) => {
    setLobbyPlayers(data.players);
    setTotalOnline(data.totalOnline);
  });

  // Listen to leaderboard updates
  useSocketEvent<any>("leaderboard_data", (data) => {
    setLeaderboard(data.leaderboard);
  });

  // Listen to match history updates
  useSocketEvent<any>("match_history_data", (data) => {
    setMatchHistory(data.matches);
  });

  // Listen to user profile updates
  useSocketEvent<any>("profile_update", (data) => {
    dispatch(updateUser(data.user));
    socket.emit("get_match_history"); // refresh history
  });

  // Listen to game invitations
  useSocketEvent<any>("receive_invite", (data) => {
    setActiveInvite(data);
  });

  // Navigate to GamePage when game start event is received
  useSocketEvent<any>("game_start", (data) => {
    navigate(`/game/${data.room.id}`);
  });

  useSocketEvent<any>("match_found", (data) => {
    setIsQuickMatching(false);
    navigate(`/game/${data.roomId}`);
  });

  // Handle room creation state redirect from socket
  useSocketEvent<any>("room_state", (data) => {
    setIsCreating(false);
    setIsCreateModalOpen(false);

    if (pendingInviteUserId.current) {
      socket.emit("invite_player", { roomId: data.room.id, targetUserId: pendingInviteUserId.current });
      pendingInviteUserId.current = null;
    }

    navigate(`/game/${data.room.id}`);
  });

  const handleJoinRoom = useCallback((roomId: string) => {
    setJoiningRoomId(roomId);
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join_room", { roomId });
    setTimeout(() => setJoiningRoomId(null), 3000);
  }, [socket]);

  const handleQuickMatch = useCallback(() => {
    setIsQuickMatching(true);
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("quick_match");
  }, [socket]);

  const handleCancelQuickMatch = useCallback(() => {
    setIsQuickMatching(false);
    socket.emit("cancel_quick_match");
  }, [socket]);

  const handleInvitePlayer = useCallback((targetUserId: string) => {
    pendingInviteUserId.current = targetUserId;
    setIsCreating(true);
    if (!socket.connected) {
      socket.connect();
    }
    // Create room with default configurations to invite player
    socket.emit("create_room", { boardSize: 15, winCondition: 5 });
  }, [socket]);

  useEffect(() => {
    return () => {
      socket.emit("cancel_quick_match");
    };
  }, [socket]);

  const handleCreateRoom = useCallback((boardSize: number, winCondition: number) => {
    setIsCreating(true);
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("create_room", { boardSize, winCondition });
  }, [socket]);

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
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 py-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* === LEFT COLUMN: Profile + Board size quick filters === */}
        <aside className="lg:col-span-3 space-y-5">
          {/* User profile widget */}
          <UserProfileWidget />

          {/* Bento info cards */}
          <div className="flex flex-col gap-4">
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
        </aside>

        {/* === MIDDLE COLUMN === */}
        <main className="lg:col-span-6 flex flex-col">
          {activeTab === "lobby" && (
            <>
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

              {/* Room list panel in glass container */}
              <div className="glass-panel rounded-3xl p-6 shadow-xl flex-1 flex flex-col min-h-[500px]">
                <RoomListPanel
                  onJoinRoom={handleJoinRoom}
                  onCreateRoom={() => setIsCreateModalOpen(true)}
                  joiningRoomId={joiningRoomId}
                />
              </div>
            </>
          )}

          {activeTab === "leaderboard" && (
            <div className="glass-panel rounded-3xl p-6 shadow-xl flex-1 flex flex-col min-h-[500px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <span className="material-symbols-outlined">leaderboard</span>
                </div>
                <div>
                  <h2 className="font-quicksand font-bold text-headline-sm text-on-surface">
                    {t("leaderboard")}
                  </h2>
                  <p className="font-nunito text-xs text-on-surface-variant">
                    Top 10 cao thủ có điểm ELO cao nhất
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-on-surface-variant text-xs font-bold font-quicksand">
                      <th className="py-3 px-4">Hạng</th>
                      <th className="py-3 px-4">Người chơi</th>
                      <th className="py-3 px-4 text-center">ELO</th>
                      <th className="py-3 px-4 text-center">Số trận</th>
                      <th className="py-3 px-4 text-center">Thắng/Thua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 font-nunito text-sm">
                    {leaderboard.map((player) => {
                      const isSelf = player.id === user?.id;
                      let rankBadge = `${player.rank}`;
                      if (player.rank === 1) rankBadge = "🏆 1";
                      else if (player.rank === 2) rankBadge = "🥈 2";
                      else if (player.rank === 3) rankBadge = "🥉 3";

                      return (
                        <tr
                          key={player.id}
                          className={`hover:bg-surface-container-low/40 transition-colors ${isSelf ? "bg-primary/5 font-bold text-primary" : "text-on-surface"
                            }`}
                        >
                          <td className="py-3 px-4 font-quicksand font-bold text-base">{rankBadge}</td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            <span className="truncate">{player.username}</span>
                            {player.winStreak > 2 && (
                              <span className="inline-flex items-center text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full font-bold">
                                🔥 {player.winStreak}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-quicksand font-bold">{player.eloRating}</td>
                          <td className="py-3 px-4 text-center">{player.gamesPlayed}</td>
                          <td className="py-3 px-4 text-center text-xs">
                            <span className="text-green-500">{player.wins}W</span> - <span className="text-red-500">{player.losses}L</span>
                          </td>
                        </tr>
                      );
                    })}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant font-nunito">
                          Chưa có dữ liệu bảng xếp hạng.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="glass-panel rounded-3xl p-6 shadow-xl flex-1 flex flex-col min-h-[500px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <div>
                  <h2 className="font-quicksand font-bold text-headline-sm text-on-surface">
                    {t("history")}
                  </h2>
                  <p className="font-nunito text-xs text-on-surface-variant">
                    Lịch sử các trận đấu gần đây của bạn
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[450px] space-y-3 pr-2 custom-scrollbar flex-1">
                {matchHistory.map((match) => {
                  const isPlayer1 = match.player1 === user?.id;
                  const opponentName = isPlayer1 ? match.player2Username : match.player1Username;
                  const myEloChange = isPlayer1 ? match.eloChange1 : match.eloChange2;

                  let resultLabel = "Hòa";
                  let resultClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  if (match.winnerId === "draw") {
                    resultLabel = "Hòa";
                    resultClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                  } else if (match.winnerId === user?.id) {
                    resultLabel = "Thắng";
                    resultClass = "bg-green-500/10 text-green-500 border-green-500/20";
                  } else {
                    resultLabel = "Thua";
                    resultClass = "bg-red-500/10 text-red-600 border-red-500/20";
                  }

                  const formattedDate = new Date(match.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 bg-surface-container-low/40 rounded-2xl border border-outline-variant/15 hover:border-primary/20 transition-all"
                    >
                      <div className="min-w-0">
                        <p className="font-quicksand font-bold text-sm text-on-surface flex items-center gap-2">
                          <span>vs {opponentName}</span>
                          <span className="font-nunito text-[11px] text-on-surface-variant font-normal">
                            ({match.boardSize}x{match.boardSize})
                          </span>
                        </p>
                        <p className="font-nunito text-xs text-on-surface-variant mt-0.5">
                          {formattedDate} • {match.reason === "surrender" ? "Đối thủ đầu hàng" : "Kết thúc bình thường"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-quicksand font-bold border ${resultClass}`}>
                          {resultLabel}
                        </span>
                        <span className={`font-quicksand font-bold text-sm ${myEloChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {myEloChange >= 0 ? `+${myEloChange}` : myEloChange} ELO
                        </span>
                      </div>
                    </div>
                  );
                })}
                {matchHistory.length === 0 && (
                  <div className="py-12 text-center text-on-surface-variant font-nunito">
                    Bạn chưa chơi trận đấu nào. Bắt đầu tìm trận ngay!
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* === RIGHT COLUMN: Online players === */}
        <aside className="lg:col-span-3">
          <OnlinePlayersPanel
            players={lobbyPlayers}
            totalOnline={totalOnline}
            currentUserId={user?.id}
            showInviteButton={true}
            onInvite={handleInvitePlayer}
          />
        </aside>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateRoom}
        isCreating={isCreating}
      />

      {/* Lời mời chơi game */}
      {activeInvite && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel max-w-sm w-full p-6 rounded-[24px] border border-white/20 shadow-2xl text-center">
            <span className="material-symbols-outlined text-primary text-[44px] mb-3">mail</span>
            <h3 className="font-quicksand font-bold text-headline-sm text-on-surface mb-2">Lời mời chơi game</h3>
            <p className="font-nunito text-on-surface-variant text-sm mb-6">
              Người chơi <strong>{activeInvite.inviterUsername}</strong> mời bạn tham gia phòng đấu cùng họ!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigate(`/game/${activeInvite.roomId}`);
                  setActiveInvite(null);
                }}
                className="flex-1 py-2.5 bg-primary text-on-primary font-quicksand font-bold text-xs rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all"
              >
                Đồng ý
              </button>
              <button
                onClick={() => setActiveInvite(null)}
                className="flex-1 py-2.5 border border-outline-variant/40 text-on-surface-variant font-quicksand font-bold text-xs rounded-xl hover:bg-red-500/5 hover:text-error hover:border-red-400/40 transition-all"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
