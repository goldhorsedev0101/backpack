import React, { useState } from "react";
import { Link, useLocation } from "wouter";
// import { useAuth } from "../hooks/useAuth"; // Disabled for demo mode
import { Button } from "./ui/button";
import { queryClient } from "../lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useIsMobile } from "../hooks/use-mobile";
import { useScrollDirection } from "../hooks/useScrollDirection";
// import logoCompact from "../../attached_assets/tripwise-logo-compact.svg";
import { 
  Compass, 
  Home, 
  Search, 
  Calendar, 
  Users, 
  DollarSign,
  Trophy,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Database,
  MapPin,
  Cloud
} from "lucide-react";

const navigationItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/my-trips", label: "Plan Trip", icon: Calendar },
  { href: "/explore", label: "Explore", icon: MapPin },
  { href: "/weather", label: "Weather", icon: Cloud },
  { href: "/community", label: "Community", icon: Users },
  { href: "/budget-tracker", label: "Budget", icon: DollarSign },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/collector-data", label: "Collector Data", icon: Compass },
  { href: "/ingestion-dashboard", label: "Ingestion Dashboard", icon: Database },
];

export default function Navigation() {
  const [location] = useLocation();
  // Always show sidebar - no authentication required
  const user = { name: "Guest User", email: "guest@tripwise.com" }; 
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isVisible } = useScrollDirection();

  const handleLogout = async () => {
    try {
      // Clear all React Query cache
      queryClient.clear();
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies by setting them to expire
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Navigate to logout endpoint which will destroy server session
      window.location.href = "/api/logout";
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: force reload to clear everything
      window.location.href = "/api/logout";
    }
  };

  const userInitials = "G"; // Guest user
  const userName = "Guest User"; // Always accessible

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-50 md:hidden">
          <div className="px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">TW</div>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
              <div className="px-4 py-4 space-y-4">
                {navigationItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left justify-start ${
                      location === item.href
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-gray-100"
                    }`}
                  >
                    <Link href={item.href}>
                      {item.icon ? (
                        <>
                          <span className="mr-3"><item.icon className="w-5 h-5" /></span>
                          <span className="text-sm font-medium">{item.label}</span>
                        </>
                      ) : item.label}
                    </Link>
                  </Button>
                ))}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center px-3 py-2 mb-4">
                    <Avatar className="w-8 h-8 mr-3">
                      <AvatarImage src={(user as any)?.profileImageUrl} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{userName}</p>
                      <p className="text-xs text-gray-500">{(user as any)?.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-slate-600 hover:bg-gray-100 rounded-lg"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Bottom Navigation - Sliding */}
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden z-50 transition-transform duration-300 ease-in-out ${
            isVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 8px)'
          }}
        >
          <div className="flex justify-around items-center py-2 px-2">
            {navigationItems.slice(0, 5).map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={`flex flex-col items-center py-2 px-2 rounded-lg transition-colors min-w-[60px] h-auto ${
                  location === item.href
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                <Link href={item.href}>
                  {item.icon ? (
                    <>
                      <span className="mb-1"><item.icon className="w-5 h-5" /></span>
                      <span className="text-xs font-medium truncate">{item.label}</span>
                    </>
                  ) : item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Desktop Right Sidebar
  return (
    <>
      {/* Desktop Right Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl border-l border-gray-200 z-50 hidden md:flex flex-col">
        {/* Sidebar Header with Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center justify-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">TW</div>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={`w-full justify-start px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location === item.href
                  ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                  : "text-slate-700 hover:bg-gray-100 hover:text-slate-900"
              }`}
            >
              <Link href={item.href}>
                {item.icon && (
                  <span className="ml-1 mr-3">
                    <item.icon className="w-5 h-5" />
                  </span>
                )}
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
        
        {/* User Profile and Logout at Bottom */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-10 h-10 mr-3">
              <AvatarImage src={(user as any)?.profileImageUrl} />
              <AvatarFallback className="bg-orange-200 text-orange-800">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{(user as any)?.email || "demo@tripwise.com"}</p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start px-4 py-3 text-slate-700 border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
