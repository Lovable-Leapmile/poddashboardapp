import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeSkin = "QIKPOD_UI" | "FLIPKART_UI";

interface ThemeContextType {
  skin: ThemeSkin;
  setSkin: (skin: ThemeSkin) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skin, setSkin] = useState<ThemeSkin>(() => {
    const envSkin = import.meta.env.VITE_DEPLOYMENT_CSS_SKIN;
    if (envSkin === "FLIPKART_UI" || envSkin === "QIKPOD_UI") {
      return envSkin;
    }
    return "QIKPOD_UI";
  });

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.remove("theme-qikpod", "theme-flipkart");
    document.documentElement.classList.add(skin === "FLIPKART_UI" ? "theme-flipkart" : "theme-qikpod");
    
    // Update CSS variables based on skin
    const root = document.documentElement;
    
    if (skin === "FLIPKART_UI") {
      // Flipkart theme colors
      root.style.setProperty("--theme-primary", "217 91% 55%"); // #2874F0
      root.style.setProperty("--theme-primary-foreground", "0 0% 100%");
      root.style.setProperty("--theme-accent", "45 97% 58%"); // #FBC02D
      root.style.setProperty("--theme-accent-foreground", "220 26% 14%");
      root.style.setProperty("--theme-header-bg", "217 91% 55%"); // #2874F0
      root.style.setProperty("--theme-header-text", "0 0% 100%");
      root.style.setProperty("--theme-sidebar-bg", "0 0% 100%");
      root.style.setProperty("--theme-sidebar-text", "220 26% 14%");
      root.style.setProperty("--theme-sidebar-accent", "217 91% 95%"); // Light blue
      root.style.setProperty("--theme-button-primary-bg", "217 91% 55%");
      root.style.setProperty("--theme-button-primary-text", "0 0% 100%");
      root.style.setProperty("--theme-button-primary-hover", "217 91% 45%");
      root.style.setProperty("--theme-success", "122 39% 40%"); // #388E3C
      root.style.setProperty("--theme-warning", "27 94% 49%"); // #F57C00
      root.style.setProperty("--theme-error", "4 70% 50%"); // #D32F2F
      root.style.setProperty("--theme-border", "0 0% 88%"); // #E0E0E0
      root.style.setProperty("--theme-muted-text", "0 0% 53%"); // #878787
      root.style.setProperty("--theme-text-primary", "0 0% 13%"); // #212121
      root.style.setProperty("--theme-bg-light", "0 0% 98%"); // #FAFAFA
    } else {
      // QikPod theme colors (default)
      root.style.setProperty("--theme-primary", "49 100% 64%"); // #FDDC4E
      root.style.setProperty("--theme-primary-foreground", "240 10% 3.9%");
      root.style.setProperty("--theme-accent", "49 100% 64%");
      root.style.setProperty("--theme-accent-foreground", "240 10% 3.9%");
      root.style.setProperty("--theme-header-bg", "49 100% 64%"); // #FDDC4E
      root.style.setProperty("--theme-header-text", "0 0% 0%");
      root.style.setProperty("--theme-sidebar-bg", "49 100% 64%");
      root.style.setProperty("--theme-sidebar-text", "0 0% 0%");
      root.style.setProperty("--theme-sidebar-accent", "49 100% 74%");
      root.style.setProperty("--theme-button-primary-bg", "49 100% 64%");
      root.style.setProperty("--theme-button-primary-text", "0 0% 0%");
      root.style.setProperty("--theme-button-primary-hover", "49 100% 54%");
      root.style.setProperty("--theme-success", "142 71% 45%");
      root.style.setProperty("--theme-warning", "38 92% 50%");
      root.style.setProperty("--theme-error", "0 84% 60%");
      root.style.setProperty("--theme-border", "240 5.9% 90%");
      root.style.setProperty("--theme-muted-text", "240 3.8% 46.1%");
      root.style.setProperty("--theme-text-primary", "240 10% 3.9%");
      root.style.setProperty("--theme-bg-light", "0 0% 98%");
    }
  }, [skin]);

  return (
    <ThemeContext.Provider value={{ skin, setSkin }}>
      {children}
    </ThemeContext.Provider>
  );
};
