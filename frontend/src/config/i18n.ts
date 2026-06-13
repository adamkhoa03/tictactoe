import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { z } from "zod";
import authVi from "../features/auth/locales/vi";
import authEn from "../features/auth/locales/en";
import gameVi from "../features/game/locales/vi";
import gameEn from "../features/game/locales/en";

const resources = {
  vi: {
    translation: {
      ...authVi,
      ...gameVi,
    },
  },
  en: {
    translation: {
      ...authEn,
      ...gameEn,
    },
  },
};

const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  let message = ctx.defaultError;

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined") {
        message = i18n.t("validation.required");
      }
      break;
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        if (issue.minimum === 1) {
          message = i18n.t("validation.required");
        } else {
          message = i18n.t("validation.minLength", { count: Number(issue.minimum) });
        }
      }
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === "string") {
        message = i18n.t("validation.maxLength", { count: Number(issue.maximum) });
      }
      break;
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        message = i18n.t("validation.invalidEmail");
      } else if (issue.validation === "regex") {
        message = i18n.t("validation.invalidPattern");
      }
      break;
    case z.ZodIssueCode.custom:
      // Custom refinement error for password mismatch
      if (issue.path.includes("confirmPassword") || issue.message === "passwordsMustMatch") {
        message = i18n.t("validation.passwordsMustMatch");
      }
      break;
  }

  return { message };
};

z.setErrorMap(zodErrorMap);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ["localStorage", "cookie", "navigator", "htmlTag", "path", "subdomain"],
      caches: ["localStorage"],
    },
  });

export default i18n;
