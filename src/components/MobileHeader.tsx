import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowLeft } from "lucide-react";
import ThemedLogo from "@/components/ThemedLogo";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { skin } = useTheme();
  const showBackButton = location.pathname !== "/dashboard";

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b lg:hidden theme-header",
      skin === "FLIPKART_UI" ? "border-blue-400" : "border-yellow-300"
    )}>
      <div className="flex justify-between items-center h-12 px-4">
        {/* Back Button and Logo */}
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className={cn(
                "h-8 w-8 p-0",
                skin === "FLIPKART_UI" ? "text-white hover:bg-blue-500" : "text-black hover:bg-yellow-400"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="cursor-pointer" onClick={handleLogoClick}>
            <ThemedLogo className="h-5 w-auto" />
          </div>
        </div>

        {/* Menu Button */}
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          variant="ghost"
          size="sm"
          className={cn(
            skin === "FLIPKART_UI" ? "text-white hover:bg-blue-500" : "text-black hover:bg-yellow-400"
          )}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
