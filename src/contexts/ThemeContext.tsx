import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { appConfig } from "@/config/app";
type ThemeMode = "light" | "dark" | "system";
const key = `${appConfig.storagePrefix}:theme`;
const ThemeContext = createContext<
  | {
      currentTheme: ThemeMode;
      resolvedTheme: "light" | "dark";
      setTheme: (theme: ThemeMode) => void;
    }
  | undefined
>(undefined);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(key);
    return saved === "dark" || saved === "system" ? saved : "light";
  });
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const resolvedTheme =
    currentTheme === "system" ? (systemDark ? "dark" : "light") : currentTheme;
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const change = () => setSystemDark(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    localStorage.setItem(key, currentTheme);
  }, [currentTheme, resolvedTheme]);
  return (
    <ThemeContext.Provider value={{ currentTheme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("ThemeProvider is required");
  return value;
}
