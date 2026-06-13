import React from "react";

interface GameBoardProps {
  board: string[][];
  boardSize: number;
  onCellClick: (row: number, col: number) => void;
  onCellHover?: (row: number | null, col: number | null) => void;
  opponentHover?: { row: number | null; col: number | null } | null;
  opponentSymbol?: "X" | "O" | "";
  winningCells?: { row: number; col: number }[];
  disabled?: boolean;
  currentPlayerSymbol?: "X" | "O" | "";
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  boardSize,
  onCellClick,
  onCellHover,
  opponentHover,
  opponentSymbol = "O",
  winningCells = [],
  disabled = false,
  currentPlayerSymbol = "X",
}) => {
  // Check if a cell is part of the winning line
  const isWinningCell = (r: number, c: number) => {
    return winningCells.some((cell) => cell.row === r && cell.col === c);
  };

  // Determine classes based on board size
  const getGridConfig = () => {
    switch (boardSize) {
      case 3:
        return {
          gridClass: "grid-cols-3 gap-3.5",
          textClass: "text-6xl md:text-7xl font-extrabold",
          tileRadius: "rounded-[24px]",
        };
      case 6:
        return {
          gridClass: "grid-cols-6 gap-2.5",
          textClass: "text-4xl md:text-5xl font-bold",
          tileRadius: "rounded-[16px]",
        };
      case 9:
        return {
          gridClass: "grid-cols-9 gap-2",
          textClass: "text-2xl md:text-3xl font-bold",
          tileRadius: "rounded-xl",
        };
      case 11:
        return {
          gridClass: "grid-cols-11 gap-1.5",
          textClass: "text-xl md:text-2xl font-bold",
          tileRadius: "rounded-lg",
        };
      case 15:
        return {
          gridClass: "grid-cols-15 gap-[3px]",
          textClass: "text-sm md:text-base lg:text-lg font-bold",
          tileRadius: "rounded-md",
        };
      default:
        // Fallback for custom size
        if (boardSize <= 5) {
          return {
            gridClass: "grid-cols-5 gap-2.5",
            textClass: "text-4xl",
            tileRadius: "rounded-xl",
          };
        }
        return {
          gridClass: `grid-cols-${boardSize} gap-[3px]`,
          textClass: "text-xs",
          tileRadius: "rounded",
        };
    }
  };

  const { gridClass, textClass, tileRadius } = getGridConfig();

  // Create inline custom style for grid layout to guarantee grid-cols works dynamic if not predefined in tailwind
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
  };

  return (
    <div className="w-full aspect-square max-w-[600px] p-4 md:p-5 glass-panel rounded-[40px] shadow-2xl flex items-center justify-center border border-white/20">
      <div 
        style={gridStyle} 
        className={`w-full h-full ${gridClass}`}
        id="game-board-grid"
      >
        {board.map((rowArr, rowIndex) =>
          rowArr.map((cellValue, colIndex) => {
            const isWinner = isWinningCell(rowIndex, colIndex);
            const isEmpty = !cellValue;
            const isOpponentHover = opponentHover && opponentHover.row === rowIndex && opponentHover.col === colIndex && isEmpty;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => !disabled && isEmpty && onCellClick(rowIndex, colIndex)}
                onMouseEnter={() => onCellHover && onCellHover(rowIndex, colIndex)}
                onMouseLeave={() => onCellHover && onCellHover(null, null)}
                className={`
                  relative flex items-center justify-center aspect-square cursor-pointer transition-all duration-300
                  bg-surface-container-low/80 hover:scale-[1.04] active:scale-95 hover:bg-surface-container-high
                  border border-outline-variant/35 shadow-sm
                  ${tileRadius}
                  ${disabled || !isEmpty ? "cursor-not-allowed" : ""}
                  ${
                    isEmpty && !disabled
                      ? currentPlayerSymbol === "X"
                        ? "tile-hover-x hover:shadow-primary/5 hover:border-primary/30"
                        : "tile-hover-o hover:shadow-secondary/5 hover:border-secondary/30"
                      : ""
                  }
                  ${
                    isWinner
                      ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20 active-turn-glow"
                      : ""
                  }
                  ${
                    isOpponentHover
                      ? opponentSymbol === "X"
                        ? "border-primary/70 border-2 border-dashed bg-primary/10 scale-[1.02] shadow-md shadow-primary/10"
                        : "border-secondary/70 border-2 border-dashed bg-secondary/10 scale-[1.02] shadow-md shadow-secondary/10"
                      : ""
                  }
                `}
                id={`tile-${rowIndex}-${colIndex}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !disabled && isEmpty) {
                    onCellClick(rowIndex, colIndex);
                  }
                }}
              >
                {cellValue && (
                  <span
                    className={`
                      font-display-game-piece select-none transition-all duration-300 transform scale-100
                      ${textClass}
                      ${
                        cellValue === "X"
                          ? "game-piece-x"
                          : cellValue === "O"
                          ? "game-piece-o"
                          : "text-on-surface"
                      }
                      ${isWinner ? "scale-110 animate-bounce" : ""}
                    `}
                  >
                    {cellValue}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
