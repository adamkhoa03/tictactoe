import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser, clearError } from "@/features/auth/slices/authSlice";
import { loginSchema, LoginInput } from "@/features/auth/schemas/auth.schema";
import { useTranslation } from "react-i18next";
import logoImg from "@/assets/logo.png";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
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

  const onSubmit = (data: LoginInput) => {
    dispatch(loginUser(data));
  };

  return (
    <Card className="px-4 md:p-4 text-center transition-all duration-500 hover:shadow-2xl">
      {/* Brand / Logo Area */}
      <div className="mb-8 flex flex-col items-center select-none">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-110"></div>
          <img src={logoImg} alt="NeonXO Logo" className="w-24 h-24 relative z-10 drop-shadow-lg" />
        </div>
        <h1 className="font-quicksand text-headline-lg font-bold text-on-surface mb-2 select-none">
          {t("welcomeBack")}
        </h1>
        <p className="font-nunito text-body-md font-normal text-on-surface-variant select-none">
          {t("readyMatch")}
        </p>
      </div>

      {/* Alert Error Message */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
        {/* Username/Email */}
        <div className="space-y-2">
          <Label htmlFor="identifier">{t("username")}</Label>
          <Input
            id="identifier"
            icon="person"
            placeholder={t("usernamePlaceholder")}
            error={!!errors.identifier}
            {...register("identifier")}
          />
          {errors.identifier && (
            <p className="text-error font-nunito text-[13px] font-normal ml-1">
              {errors.identifier.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">{t("password")}</Label>
          </div>
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
          <div className="text-right">
            <a href="#forgot" className="font-quicksand text-label-bold font-bold text-primary hover:text-primary-container transition-colors duration-300">
              {t("forgotPassword")}
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full flex items-center justify-center gap-2 group text-white"
          disabled={isLoading}
        >
          <span>{isLoading ? t("loading") : t("login")}</span>
          {!isLoading && (
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform select-none">
              arrow_forward
            </span>
          )}
        </Button>
      </form>

      {/* Footer / Switch View */}
      <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
        <p className="font-nunito text-body-md font-normal text-on-surface-variant mb-4 select-none">
          {t("noAccount")}
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container font-quicksand font-bold text-label-bold hover:bg-secondary hover:text-on-secondary transition-colors duration-300"
        >
          <span>{t("registerNow")}</span>
          <span className="material-symbols-outlined text-[18px] select-none">
            person_add
          </span>
        </Link>
      </div>
    </Card>
  );
};
