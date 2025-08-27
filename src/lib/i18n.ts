"use client";

import i18next, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";

// Seed minimal resources; add keys as admin UI grows
const resources: Resource = {
  en: { translation: {} },
  ro: { translation: {} },
};

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    defaultNS: "translation",
  });
}

export default i18next;


