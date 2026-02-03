import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import qikpodLogo from "@/assets/qikpod-logo.png";
import flipkartLogo from "@/assets/flipkart-logo.svg";

interface ThemedLogoProps {
  className?: string;
  alt?: string;
}

const ThemedLogo: React.FC<ThemedLogoProps> = ({ className = "h-6 w-auto", alt = "Logo" }) => {
  const { skin } = useTheme();
  
  const logo = skin === "FLIPKART_UI" ? flipkartLogo : qikpodLogo;
  const logoAlt = skin === "FLIPKART_UI" ? "Flipkart Logo" : "QikPod Logo";
  
  return (
    <img
      src={logo}
      alt={alt || logoAlt}
      className={className}
    />
  );
};

export default ThemedLogo;
