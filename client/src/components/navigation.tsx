import { useState } from "react";
import { Link, useLocation } from "wouter";
// import { useAuth } from "@/hooks/useAuth"; // Disabled for demo mode
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import logoCompact from "@/assets/tripwise-logo-compact.svg";
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
  { href: "/tripadvisor-data", label: "Travel Data", icon: Database },
  { href: "/collector-data", label: "South America Data", icon: Compass },
];

export default function Navigation() {
  const [location] = useLocation();
  const user = null; // Demo mode - no auth
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

  const userInitials = "U"; // Demo mode
  const userName = "Demo User"; // Demo mode

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-50 md:hidden">
          <div className="px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <img src={logoCompact} alt="TripWise" className="h-8" />
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
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
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
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img src={logoCompact} alt="TripWise" className="h-8" />
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location === item.href
                        ? "text-primary bg-orange-50"
                        : "text-slate-600 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any)?.profileImageUrl} alt={userName} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {(user as any)?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
