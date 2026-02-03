import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronLeft, LogOut, HelpCircle, Activity, Settings, MapPin, Package, Calendar, Users, UserPlus, Bell, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AppSidebarProps {
  setShowLogoutDialog: (show: boolean) => void;
  setShowSupportPopup: (show: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

interface NavItem {
  name: string;
  icon: any;
  path?: string;
  children?: { name: string; icon: any; path: string }[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    icon: Activity,
    path: '/dashboard'
  },
  {
    name: 'Operations',
    icon: Settings,
    children: [
      { name: 'Locations', icon: MapPin, path: '/locations' },
      { name: 'Pods', icon: Package, path: '/pods' },
      { name: 'Reservations', icon: Calendar, path: '/reservations' }
    ]
  },
  {
    name: 'Users & Network',
    icon: Users,
    children: [
      { name: 'Users', icon: Users, path: '/users' },
      { name: 'Partner', icon: UserPlus, path: '/partner' },
      { name: 'Notification', icon: Bell, path: '/notification' },
      { name: 'Payments', icon: CreditCard, path: '/payments' },
      { name: 'Logs', icon: FileText, path: '/logs' }
    ]
  }
];

const AppSidebar: React.FC<AppSidebarProps> = ({ setShowLogoutDialog, setShowSupportPopup, isExpanded, setIsExpanded }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { skin } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Operations', 'Users & Network']);

  const isFlipkart = skin === "FLIPKART_UI";
  const sidebarBg = isFlipkart ? "bg-white border-r border-gray-200" : "bg-amber-100 border-r border-amber-200";
  const itemHoverBg = isFlipkart ? "hover:bg-blue-50" : "hover:bg-amber-200";
  const itemActiveBg = isFlipkart ? "bg-blue-100 text-blue-600" : "bg-amber-300 text-black";
  const textColor = isFlipkart ? "text-gray-700" : "text-black";
  const borderColor = isFlipkart ? "border-gray-200" : "border-amber-200";

  const isActive = (path: string) => location.pathname === path;
  
  const isGroupActive = (item: NavItem) => {
    if (item.path) return isActive(item.path);
    return item.children?.some(child => isActive(child.path)) || false;
  };

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => 
      prev.includes(name) 
        ? prev.filter(g => g !== name)
        : [...prev, name]
    );
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside 
        className={cn(
          "h-[calc(100vh-3.5rem)] fixed top-14 left-0 flex flex-col overflow-hidden transition-all duration-300 z-40",
          sidebarBg,
          isExpanded ? "w-56" : "w-14"
        )}
      >
        {/* Navigation with inline toggle */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {/* Toggle Button - inline at top */}
          <div className={cn("flex mb-2", isExpanded ? "justify-end" : "justify-center")}>
            <button
              onClick={toggleSidebar}
              className={cn("p-1 rounded-md transition-colors", itemHoverBg)}
              title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isExpanded ? (
                <ChevronLeft className={cn("w-4 h-4", textColor)} />
              ) : (
                <ChevronRight className={cn("w-4 h-4", textColor)} />
              )}
            </button>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    {isExpanded ? (
                      <button
                        onClick={() => toggleGroup(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          textColor,
                          isGroupActive(item) ? itemActiveBg : itemHoverBg
                        )}
                      >
                        <span className="flex items-center">
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </span>
                        {expandedGroups.includes(item.name) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={toggleSidebar}
                            className={cn(
                              "w-full flex items-center justify-center p-2 rounded-md transition-colors",
                              textColor,
                              isGroupActive(item) ? itemActiveBg : itemHoverBg
                            )}
                          >
                            <item.icon className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {isExpanded && expandedGroups.includes(item.name) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.name}
                            onClick={() => handleNavClick(child.path)}
                            className={cn(
                              "w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                              textColor,
                              isActive(child.path) ? itemActiveBg + " font-medium" : itemHoverBg
                            )}
                          >
                            <child.icon className="w-4 h-4 mr-3" />
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  isExpanded ? (
                    <button
                      onClick={() => handleNavClick(item.path!)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        textColor,
                        isActive(item.path!) ? itemActiveBg : itemHoverBg
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleNavClick(item.path!)}
                          className={cn(
                            "w-full flex items-center justify-center p-2 rounded-md transition-colors",
                            textColor,
                            isActive(item.path!) ? itemActiveBg : itemHoverBg
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Support */}
          <div className={cn("mt-4 pt-4 border-t", borderColor)}>
            {isExpanded ? (
              <button
                onClick={() => setShowSupportPopup(true)}
                className={cn("w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors", textColor, itemHoverBg)}
              >
                <HelpCircle className="w-4 h-4 mr-3" />
                Support
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowSupportPopup(true)}
                    className={cn("w-full flex items-center justify-center p-2 rounded-md transition-colors", textColor, itemHoverBg)}
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Support</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </nav>

        {/* User & Logout */}
        <div className={cn("p-2 border-t", borderColor)}>
          {isExpanded ? (
            <>
              {user && (
                <div className={cn("text-xs font-medium mb-2 px-2", textColor)}>
                  Welcome, {user.user_name}
                </div>
              )}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className={cn("w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors", textColor, itemHoverBg)}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className={cn("w-full flex items-center justify-center p-2 rounded-md transition-colors", textColor, itemHoverBg)}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AppSidebar;