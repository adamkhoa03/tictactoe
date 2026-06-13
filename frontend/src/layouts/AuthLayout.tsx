import React from "react";
import { useTranslation } from "react-i18next";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "vi";
  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-nunito text-body-md font-normal text-on-background relative overflow-hidden select-none">
      {/* Background elements matching Stitch mockup */}
      <div className="fixed inset-0 neon-grid z-0 pointer-events-none"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] -z-10 animate-drift bg-primary/20 top-[-100px] left-[-100px] pointer-events-none"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] -z-10 animate-drift bg-secondary/20 bottom-[-100px] right-[-100px] pointer-events-none" style={{ animationDelay: "-5s" }}></div>

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-primary font-quicksand text-headline-lg font-bold tracking-tight select-none">
            Cờ Ca Rô
          </span>
        </div>

        {/* Language selector pill */}
        <div className="flex items-center glass-panel rounded-full p-1 border-outline-variant/30">
          <button
            onClick={() => setLanguage("vi")}
            className={`px-4 py-1.5 rounded-full text-label-bold font-quicksand font-bold transition-all duration-300 ${currentLanguage.startsWith("vi")
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
          >
            Tiếng Việt
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-4 py-1.5 rounded-full text-label-bold font-quicksand font-bold transition-all duration-300 ${currentLanguage.startsWith("en")
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
          >
            English
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center relative z-10">
        <div className="w-full max-w-[460px] perspective-[1000px]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant/70 max-w-7xl mx-auto">
        <div className="flex gap-6 font-quicksand font-bold text-[14px]">
          <a className="hover:text-primary transition-colors cursor-pointer" href="#terms">
            {t("terms")}
          </a>
          <a className="hover:text-primary transition-colors cursor-pointer" href="#privacy">
            {t("privacy")}
          </a>
          <a className="hover:text-primary transition-colors cursor-pointer" href="#help">
            {t("help")}
          </a>
        </div>
      </footer>
    </div>
  );
};
