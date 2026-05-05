'use client'

import { useEffect } from "react";
import { buildThemeVars, themePairs } from "./theme";

export default function ThemeBootstrap() {
  useEffect(() => {
    const pair = themePairs[Math.floor(Math.random() * themePairs.length)] ?? themePairs[0];
    const root = document.documentElement;
    const themeVars = buildThemeVars(pair);

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  return null;
}
