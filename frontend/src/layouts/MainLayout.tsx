import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/features/auth/slices/authSlice";
import { ConnectionStatusBadge } from "@/features/game/components/ConnectionStatusBadge";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "vi";
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-nunito text-body-md font-normal text-on-background relative overflow-x-hidden select-none">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 neon-grid z-0 pointer-events-none" />
      <div className="fixed w-[400px] h-[400px] rounded-full blur-[100px] -z-10 animate-drift bg-primary/15 top-[-150px] left-[-150px] pointer-events-none" />
      <div className="fixed w-[400px] h-[400px] rounded-full blur-[100px] -z-10 animate-drift bg-secondary/15 bottom-[-150px] right-[-150px] pointer-events-none" style={{ animationDelay: "-7s" }} />
      <div className="fixed w-[250px] h-[250px] rounded-full blur-[80px] -z-10 animate-drift bg-tertiary/10 top-[40%] right-[20%] pointer-events-none" style={{ animationDelay: "-14s" }} />

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-white/20 px-6 md:px-8 h-16 flex justify-between items-center">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/lobby" className="flex items-center gap-2 no-underline">
            <span className="font-quicksand text-headline-md font-bold text-primary tracking-tight">
              NeonXO
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/lobby"
              id="nav-lobby"
              className="px-4 py-2 rounded-xl font-quicksand font-bold text-label-bold text-primary bg-primary/10 transition-all no-underline"
            >
              {t("lobby")}
            </Link>
            <a
              href="#leaderboard"
              id="nav-leaderboard"
              className="px-4 py-2 rounded-xl font-quicksand font-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all no-underline"
            >
              {t("leaderboard")}
            </a>
            <a
              href="#history"
              id="nav-history"
              className="px-4 py-2 rounded-xl font-quicksand font-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all no-underline"
            >
              {t("history")}
            </a>
          </nav>
        </div>

        {/* Right: Status + Lang + User + Logout */}
        <div className="flex items-center gap-3">
          {/* Socket connection badge */}
          <ConnectionStatusBadge />

          {/* Language toggle */}
          <div className="hidden sm:flex items-center glass-panel rounded-full p-1">
            <button
              onClick={() => i18n.changeLanguage("vi")}
              id="lang-vi"
              className={`px-3 py-1 rounded-full text-label-bold font-quicksand font-bold text-[12px] transition-all duration-300 ${
                currentLanguage.startsWith("vi")
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              VN
            </button>
            <button
              onClick={() => i18n.changeLanguage("en")}
              id="lang-en"
              className={`px-3 py-1 rounded-full text-label-bold font-quicksand font-bold text-[12px] transition-all duration-300 ${
                currentLanguage.startsWith("en")
                  ? "bg-primary text-on-primary shadow-md"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              EN
            </button>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-outline-variant/40" />

          {/* Username display */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary font-bold text-[11px] font-quicksand">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-quicksand font-bold text-label-bold text-on-surface">
                {user.username}
              </span>
            </div>
          )}

          {/* Logout */}
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-quicksand font-bold text-label-bold text-on-surface-variant hover:text-error hover:bg-error/5 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-5 px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-outline-variant/10 text-on-surface-variant/60 mt-auto">
        <p className="font-nunito text-label-status text-[12px]">
          © 2024 NeonXO Gaming. All Rights Reserved.
        </p>
        <div className="flex gap-5 font-quicksand font-bold text-[12px]">
          <a href="#terms" className="hover:text-primary transition-colors cursor-pointer no-underline">
            {t("terms")}
          </a>
          <a href="#privacy" className="hover:text-primary transition-colors cursor-pointer no-underline">
            {t("privacy")}
          </a>
          <a href="#help" className="hover:text-primary transition-colors cursor-pointer no-underline">
            {t("help")}
          </a>
        </div>
      </footer>
    </div>
  );
};
