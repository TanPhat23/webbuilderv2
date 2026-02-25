"use client";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      variant="outline"
      size="icon"
    >
      {isDark ? <Moon /> : <Sun />}
    </Button>
  );
}
