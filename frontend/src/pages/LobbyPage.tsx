import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/features/auth/slices/authSlice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <Card className="text-center transition-all duration-500 hover:shadow-2xl">
      {/* Brand / Logo Area */}
      <div className="mb-8 flex flex-col items-center select-none">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110"></div>
          <div className="w-20 h-20 relative z-10 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
            <span className="material-symbols-outlined text-primary text-[50px] font-bold select-none">
              sports_esports
            </span>
          </div>
        </div>
        <h1 className="font-quicksand text-headline-lg font-bold text-on-surface mb-2 select-none">
          Lobby Arena
        </h1>
        <p className="font-nunito text-body-md font-normal text-on-surface-variant select-none">
          Chào mừng, <span className="font-bold text-primary">{user?.username}</span>!
        </p>
      </div>

      <div className="space-y-4 text-left font-nunito text-body-md font-normal text-on-surface-variant bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/30 mb-8">
        <div>
          <span className="font-bold text-on-surface">Email:</span> {user?.email}
        </div>
        <div>
          <span className="font-bold text-on-surface">ELO Rating:</span> {user?.eloRating ?? 1200}
        </div>
        <div>
          <span className="font-bold text-on-surface">Matches Played:</span> {user?.matchesPlayed ?? 0}
        </div>
        <div>
          <span className="font-bold text-on-surface">Matches Won:</span> {user?.matchesWon ?? 0}
        </div>
      </div>

      <Button onClick={handleLogout} className="w-full" variant="outline">
        Đăng xuất
      </Button>
    </Card>
  );
};
