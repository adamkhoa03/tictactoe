import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { RoomCard } from "./RoomCard";

interface RoomListPanelProps {
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  joiningRoomId?: string | null;
}

type FilterMode = "all" | "3" | "6" | "9" | "11" | "15";

export const RoomListPanel: React.FC<RoomListPanelProps> = ({
  onJoinRoom,
  onCreateRoom,
  joiningRoomId,
}) => {
  const { t } = useTranslation();
  const { waitingRooms, isLoading } = useAppSelector((state) => state.game);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Use real rooms from the server
  const rooms = waitingRooms;

  const filteredRooms = rooms.filter((room) => {
    const matchesFilter = filter === "all" || room.boardSize === Number(filter);
    const matchesSearch =
      searchQuery === "" ||
      room.hostUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(room.boardSize).includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const filterButtons: { label: string; value: FilterMode }[] = [
    { label: t("all"), value: "all" },
    { label: "3×3", value: "3" },
    { label: "6×6", value: "6" },
    { label: "9×9", value: "9" },
    { label: "15×15", value: "15" },
  ];

  return (
    <div id="room-list-panel" className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-quicksand font-bold text-headline-md text-on-surface">
            {t("availableRooms")}
          </h2>
          <p className="font-nunito text-label-status text-on-surface-variant mt-0.5">
            {filteredRooms.length} {t("roomsAvailable")}
          </p>
        </div>

        <button
          id="btn-create-room"
          onClick={onCreateRoom}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-2xl font-quicksand font-bold text-label-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {t("createRoom")}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          id="room-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchRooms")}
          className="w-full pl-10 pr-4 py-2.5 glass-panel rounded-2xl font-nunito text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {filterButtons.map(({ label, value }) => (
          <button
            key={value}
            id={`filter-${value}`}
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 rounded-full font-quicksand font-bold text-label-bold transition-all duration-200 ${filter === value
              ? "bg-primary text-on-primary shadow-md shadow-primary/20"
              : "glass-panel text-on-surface-variant hover:text-primary border border-outline-variant/30 hover:border-primary/30"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Room list */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
        {isLoading ? (
          /* Skeleton loaders */
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl p-4 border border-outline-variant/20 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-surface-container rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded-full w-1/2" />
                  <div className="h-3 bg-surface-container rounded-full w-3/4" />
                </div>
                <div className="w-16 h-9 bg-surface-container rounded-xl" />
              </div>
            </div>
          ))
        ) : filteredRooms.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-surface-variant text-[36px]">
                meeting_room
              </span>
            </div>
            <h3 className="font-quicksand font-bold text-headline-md text-on-surface mb-2">
              {t("noRoomsFound")}
            </h3>
            <p className="font-nunito text-body-md text-on-surface-variant mb-6 max-w-[250px]">
              {searchQuery ? t("noRoomsMatchSearch") : t("noRoomsYet")}
            </p>
            <button
              onClick={onCreateRoom}
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-2xl font-quicksand font-bold text-label-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t("createFirstRoom")}
            </button>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={onJoinRoom}
              isJoining={joiningRoomId === room.id}
            />
          ))
        )}
      </div>

      {/* Refresh hint */}
      {!isLoading && filteredRooms.length > 0 && (
        <div className="mt-4 flex items-center gap-2 justify-center text-on-surface-variant/50">
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          <span className="font-nunito text-label-status text-[11px]">{t("autoRefresh")}</span>
        </div>
      )}
    </div>
  );
};
