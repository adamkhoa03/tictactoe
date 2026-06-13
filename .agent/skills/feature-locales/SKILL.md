---
name: feature-locales
description: Guidelines to keep localization (locales/i18n) files separated per feature rather than grouped in a single global locales directory. Each feature folder must contain its own locales subdirectory for translations, and the main i18n configuration merges these feature-specific translations.
---

# Feature-Specific Locales

Guidelines to ensure translation/locales files are decentralized and maintained within their respective features instead of a single global directory. This simplifies maintenance, prevents conflicts, and keeps feature-related code self-contained.

## When to Apply This Skill

Always use this skill when:
- Adding new translation keys or languages to the project.
- Creating a new feature that contains UI text requiring localization.
- Refactoring existing translations or i18n configurations.

## Folder Structure Rule

Every feature in the project (under `src/features/<feature-name>`) that requires localization should contain a `locales` folder with language files:

```
src/features/
└── <feature-name>/
    └── locales/
        ├── en.ts   # English translations for this feature
        └── vi.ts   # Vietnamese translations for this feature
```

## Naming Convention Rule

> [!IMPORTANT]
> **Always use camelCase for i18n keys**. Snake_case (like `my_key_name`) or PascalCase (like `MyKeyName`) are prohibited for internationalization keys.

## How to Structure Feature Locale Files

Each locale file should export a default object with key-value pairs representing translation strings in camelCase:

```typescript
// src/features/my-feature/locales/en.ts
export default {
  myFeatureTitle: "My Feature Title",
  myFeatureDescription: "Description of the feature.",
};
```

## Merging Translations in the main i18n Config

In `src/config/i18n.ts`, import the individual feature locales and merge them into the translation resources object:

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import feature-specific locales
import authEn from "../features/auth/locales/en";
import authVi from "../features/auth/locales/vi";
import gameEn from "../features/game/locales/en";
import gameVi from "../features/game/locales/vi";

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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "cookie", "navigator", "htmlTag", "path", "subdomain"],
      caches: ["localStorage"],
    },
  });

export default i18n;
```

## Code Examples

### ❌ Incorrect Pattern

Grouping all translations from different modules into a single, global locale file or using snake_case/PascalCase keys:

```typescript
// src/locales/en.ts
export default {
  // Auth keys
  welcome_back: "Welcome Back!", // ❌ Snake_case keys!
  username: "Username",
  
  // Game keys
  game_start: "Start Game", // ❌ Snake_case keys!
  game_over: "Game Over", // ❌ Avoid placing everything here!
};
```

###  Correct Pattern

Splitting translations into their respective features and importing them dynamically using camelCase keys:

```typescript
// src/features/auth/locales/en.ts
export default {
  welcomeBack: "Welcome Back!",
  username: "Username",
};

// src/features/game/locales/en.ts
export default {
  gameStart: "Start Game",
  gameOver: "Game Over",
};
```

## Validation Error Styling Rule

> [!IMPORTANT]
> **Always display validation error messages in red text**. Ensure error paragraph tags (like those placed under inputs) use the `text-error` styling class (or another Tailwind red text class such as `text-destructive`) to clearly highlight inputs with errors to the user.

## Universal i18n Usage Rule

> [!IMPORTANT]
> **Always use i18n everywhere when possible**. Avoid using hardcoded language strings anywhere in the application logic, including:
> - Fallback messages in Redux slices and thunks (e.g. `rejectWithValue(error.message || i18n.t("errorKey"))`).
> - Fallbacks in API response handling and utility functions.
> - Default status/notification messages.
