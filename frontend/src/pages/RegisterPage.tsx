import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerUser, clearError } from "@/features/auth/slices/authSlice";
import { registerSchema, RegisterInput } from "@/features/auth/schemas/auth.schema";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.png";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/lobby");
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when leaving page
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = (data: RegisterInput) => {
    dispatch(registerUser(data));
  };

  return (
    <Card className="text-center transition-all duration-500 hover:shadow-2xl">
      {/* Brand / Logo Area */}
      <div className="mb-6 flex flex-col items-center select-none">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full scale-110"></div>
          <img src={logoImg} alt="NeonXO Logo" className="w-24 h-24 relative z-10 drop-shadow-lg" />
        </div>
        <h1 className="font-quicksand text-headline-lg font-bold text-on-surface mb-2 select-none">
          {t("createAccount")}
        </h1>
        <p className="font-nunito text-body-md font-normal text-on-surface-variant select-none">
          {t("joinBattle")}
        </p>
      </div>

      {/* Alert Error Message */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {/* Username */}
        <div className="space-y-1">
          <Label htmlFor="username">{t("regUsername")}</Label>
          <Input
            id="username"
            icon="person"
            placeholder={t("regUsernamePlaceholder")}
            error={!!errors.username}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-error font-nunito text-[13px] font-normal ml-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            icon="mail"
            placeholder={t("emailPlaceholder")}
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-error font-nunito text-[13px] font-normal ml-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="password">{t("password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              icon="lock"
              placeholder={t("passwordPlaceholder")}
              error={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors duration-300"
            >
              <span className="material-symbols-outlined select-none text-[22px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="text-error font-nunito text-[13px] font-normal ml-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              icon="lock"
              placeholder={t("confirmPasswordPlaceholder")}
              error={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors duration-300"
            >
              <span className="material-symbols-outlined select-none text-[22px]">
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-error font-nunito text-[13px] font-normal ml-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2 group mt-6"
          disabled={isLoading}
        >
          <span>{isLoading ? t("loading") : t("register")}</span>
          {!isLoading && (
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform select-none">
              arrow_forward
            </span>
          )}
        </Button>
      </form>

      {/* Footer / Switch View */}
      <div className="mt-6 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-nunito text-body-md font-normal text-on-surface-variant mb-4 select-none">
          {t("alreadyAccount")}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container font-quicksand font-bold text-label-bold hover:bg-secondary hover:text-on-secondary transition-colors duration-300"
        >
          <span>{t("loginNow")}</span>
          <span className="material-symbols-outlined text-[18px] select-none">
            login
          </span>
        </Link>
      </div>
    </Card>
  );
};
