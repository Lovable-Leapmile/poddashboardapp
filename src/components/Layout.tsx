import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ThemedLogo from "@/components/ThemedLogo";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileHeader from "./MobileHeader";
import MobileSidebar from "./MobileSidebar";
import SupportPopup from "./SupportPopup";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, breadcrumb }) => {
  const { logout, user } = useAuth();
  const { skin } = useTheme();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebarExpanded");
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Persist sidebar state
  React.useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Desktop & Tablet Layout - Header on top, Sidebar below */}
      <div className="hidden md:flex flex-col min-h-screen">
        {/* Fixed Desktop Header with Logo - using theme classes */}
        <header className={cn(
          "h-14 border-b flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50 theme-header",
          skin === "FLIPKART_UI" ? "border-blue-400" : "border-yellow-300"
        )}>
          <div className="flex items-center">
            <div className="cursor-pointer" onClick={() => navigate("/dashboard")}>
              <ThemedLogo className="h-6 w-auto" />
            </div>
          </div>
          {/* Welcome message and profile on the right */}
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-sm font-medium",
              skin === "FLIPKART_UI" ? "text-white" : "text-black"
            )}>Welcome, {user?.user_name || "User"}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "p-2 rounded-full transition-colors",
                  skin === "FLIPKART_UI" ? "hover:bg-blue-500" : "hover:bg-yellow-400"
                )}>
                  <User className={cn("w-5 h-5", skin === "FLIPKART_UI" ? "text-white" : "text-black")} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1">
                  <span className="font-medium">{user?.user_name || "User"}</span>
                  <span className="text-xs text-muted-foreground">Type: {user?.user_type || "N/A"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content area with sidebar - add top padding for fixed header */}
        <div className="flex flex-1 pt-14">
          {/* Fixed Sidebar below header */}
          <AppSidebar
            setShowLogoutDialog={setShowLogoutDialog}
            setShowSupportPopup={setShowSupportPopup}
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
          />

          {/* Main Content - with dynamic margin to account for sidebar */}
          <main
            className="flex-1 p-4 overflow-auto transition-all duration-300"
            style={{ marginLeft: isSidebarExpanded ? "14rem" : "3.5rem" }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout - Header + Content */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <MobileHeader isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          //onClose={() => setIsMobileMenuOpen(false)}
          setShowLogoutDialog={setShowLogoutDialog}
          setShowSupportPopup={setShowSupportPopup}
        />

        {/* Main Content with top padding for fixed header */}
        <main className="pt-14 pb-4 px-4">{children}</main>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to logout?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogout} className="theme-button-primary">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Popup */}
      <SupportPopup isOpen={showSupportPopup} onClose={() => setShowSupportPopup(false)} />
    </div>
  );
};

export default Layout;
