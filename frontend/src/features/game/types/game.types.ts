export type GameOverReason = "normal" | "surrender" | "timeout";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: string;
}

export interface CellCoords {
  row: number;
  col: number;
}
