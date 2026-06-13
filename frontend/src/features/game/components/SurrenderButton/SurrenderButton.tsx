import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface SurrenderButtonProps {
  onSurrender: () => void;
  disabled?: boolean;
}

export const SurrenderButton: React.FC<SurrenderButtonProps> = ({
  onSurrender,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onSurrender();
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={disabled}
        className="group flex items-center justify-center gap-2 px-10 py-4 bg-red-600/90 text-white rounded-full font-label-bold font-quicksand text-sm shadow-lg hover:shadow-red-600/35 hover:scale-[1.03] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        id="btn-surrender"
      >
        <span className="material-symbols-outlined transition-transform duration-300 group-hover:rotate-12">
          flag
        </span>
        {t("surrender", "Đầu hàng")}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div 
            className="glass-panel max-w-sm w-full p-6 rounded-3xl shadow-2xl border border-red-500/20 text-center animate-scaleIn"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4 text-red-600">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="font-headline-md text-red-600 font-bold mb-2">
              {t("confirmSurrenderTitle", "Đầu hàng?")}
            </h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              {t("confirmSurrenderDesc", "Bạn có chắc chắn muốn nhận thua trận đấu này? Điểm ELO của bạn có thể bị giảm.")}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-full bg-surface-container-high/60 border border-outline-variant/20 font-quicksand font-bold text-xs text-on-surface hover:bg-surface-container-highest transition-all"
              >
                {t("cancel", "Hủy")}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-full bg-red-600 text-white font-quicksand font-bold text-xs shadow-md shadow-red-600/20 hover:bg-red-700 transition-all"
                id="confirm-surrender-yes"
              >
                {t("confirmSurrenderAction", "Đầu hàng")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
