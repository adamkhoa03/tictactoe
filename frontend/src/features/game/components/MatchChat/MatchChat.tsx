import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChatMessage } from "@/features/game/types/game.types";

interface MatchChatProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
}

export const MatchChat: React.FC<MatchChatProps> = ({
  messages,
  currentUserId,
  onSendMessage,
}) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="glass-panel rounded-3xl p-5 flex flex-col h-[380px] shadow-lg border border-outline-variant/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h5 className="font-label-bold text-on-surface flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-primary text-base">
            chat_bubble
          </span>
          {t("matchChat", "Match Chat")}
        </h5>
        <span className="text-[9px] bg-primary/10 px-2 py-0.5 rounded-full text-primary font-bold tracking-wider animate-pulse uppercase">
          {t("liveBadge", "LIVE")}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-on-surface-variant/60 italic">
            {t("noMessages", "Say hi to start the match chat!")}
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-[9px] font-bold text-on-surface-variant/70 mb-0.5 px-1">
                  {isMe ? t("chatYou", "You") : msg.senderUsername}
                </span>
                <div
                  className={`
                    px-3.5 py-1.5 rounded-2xl text-xs max-w-[85%] break-words shadow-sm
                    ${
                      isMe
                        ? "bg-primary text-on-primary rounded-tr-none"
                        : "bg-surface-container-high/60 text-on-surface rounded-tl-none border border-outline-variant/5"
                    }
                  `}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="mt-3 relative flex-shrink-0">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full bg-surface-container-low/80 border border-outline-variant/20 rounded-full pl-4 pr-10 py-2.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-on-surface-variant/40"
          placeholder={t("typeMessagePlaceholder", "Type a message...")}
          type="text"
          id="chat-input-field"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/10"
          id="btn-chat-send"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </div>
  );
};
