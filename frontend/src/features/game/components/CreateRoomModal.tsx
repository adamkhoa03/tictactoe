import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (boardSize: number, winCondition: number) => void;
  isCreating?: boolean;
}

const BOARD_SIZES = [
  { size: 3, label: "Classic 3×3", icon: "grid_3x3", description: "Win with 3 in a row", winOptions: [3] },
  { size: 6, label: "Pro 6×6", icon: "grid_4x4", description: "Win with 4 in a row", winOptions: [3, 4] },
  { size: 9, label: "Expert 9×9", icon: "grid_view", description: "Win with 5 in a row", winOptions: [3, 4, 5] },
  { size: 11, label: "Master 11×11", icon: "grid_view", description: "Win with 5 in a row", winOptions: [4, 5] },
  { size: 15, label: "Mega 15×15", icon: "grid_view", description: "Win with 5 in a row", winOptions: [5] },
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isCreating,
}) => {
  const { t } = useTranslation();
  const [selectedSize, setSelectedSize] = useState(3);
  const [selectedWin, setSelectedWin] = useState(3);

  const currentBoard = BOARD_SIZES.find((b) => b.size === selectedSize) ?? BOARD_SIZES[0];

  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
    const board = BOARD_SIZES.find((b) => b.size === size)!;
    // Auto-select first valid win condition
    setSelectedWin(board.winOptions[board.winOptions.length - 1]);
  };

  const handleCreate = () => {
    onCreate(selectedSize, selectedWin);
  };

  if (!isOpen) return null;

  return (
    <div
      id="create-room-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal Panel */}
      <div
        id="create-room-modal"
        className="relative glass-panel rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-white/30 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-quicksand font-bold text-headline-md text-on-surface">
              {t("createRoom")}
            </h2>
            <p className="font-nunito text-label-status text-on-surface-variant mt-1">
              {t("chooseBoardSize")}
            </p>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Board size selector */}
        <div className="mb-6">
          <p className="font-quicksand font-bold text-label-bold text-on-surface-variant uppercase tracking-wider mb-3 text-[11px]">
            {t("boardSize")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BOARD_SIZES.map((board) => (
              <button
                key={board.size}
                id={`board-size-${board.size}`}
                onClick={() => handleSizeSelect(board.size)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 group ${
                  selectedSize === board.size
                    ? "bg-primary/10 border-primary/40 shadow-md shadow-primary/10"
                    : "bg-surface-container-low/40 border-outline-variant/20 hover:border-primary/25 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`material-symbols-outlined text-[18px] transition-colors ${
                      selectedSize === board.size ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {board.icon}
                  </span>
                  <span
                    className={`font-quicksand font-bold text-label-bold transition-colors ${
                      selectedSize === board.size ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {board.size}×{board.size}
                  </span>
                </div>
                <p className="font-nunito text-[11px] text-on-surface-variant leading-tight">
                  {board.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Win condition selector */}
        <div className="mb-8">
          <p className="font-quicksand font-bold text-label-bold text-on-surface-variant uppercase tracking-wider mb-3 text-[11px]">
            {t("winCondition")} ({t("inARow")})
          </p>
          <div className="flex gap-2">
            {currentBoard.winOptions.map((win) => (
              <button
                key={win}
                id={`win-condition-${win}`}
                onClick={() => setSelectedWin(win)}
                className={`flex-1 py-2.5 rounded-xl font-quicksand font-bold text-label-bold transition-all duration-200 ${
                  selectedWin === win
                    ? "bg-secondary text-on-secondary shadow-md shadow-secondary/20"
                    : "glass-panel text-on-surface-variant border border-outline-variant/30 hover:border-secondary/30 hover:text-secondary"
                }`}
              >
                {win}
              </button>
            ))}
          </div>
        </div>

        {/* Summary card */}
        <div className="mb-6 bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[22px]">info</span>
          <p className="font-nunito text-label-status text-on-surface-variant">
            {t("roomSummary", {
              size: `${selectedSize}×${selectedSize}`,
              win: selectedWin,
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            id="btn-cancel-create"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-quicksand font-bold text-label-bold glass-panel border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50 transition-all"
          >
            {t("cancel")}
          </button>
          <button
            id="btn-confirm-create"
            onClick={handleCreate}
            disabled={isCreating}
            className="flex-1 py-3 rounded-2xl font-quicksand font-bold text-label-bold bg-primary text-on-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                {t("creating")}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                {t("createRoom")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
