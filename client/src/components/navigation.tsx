import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext.js";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button.js";
import { queryClient } from "../lib/queryClient.js";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.js";
import { AuthModal } from "./auth/AuthModal.js";
import { LanguageToggle } from "./LanguageToggle.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.js";
import { useIsMobile } from "../hooks/use-mobile.js";
import { useScrollDirection } from "../hooks/useScrollDirection.js";
// import logoCompact from "../assets/tripwise-logo-compact.svg";
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
  Cloud,
} from "lucide-react";

// Navigation items will be translated dynamically
const getNavigationItems = (t: any) => [
  { href: "/", label: t('navigation.home'), icon: Home },
  { href: "/my-trips", label: t('navigation.my_trips'), icon: Calendar },
  { href: "/explore", label: t('navigation.explore'), icon: MapPin },
  { href: "/weather", label: t('navigation.weather'), icon: Cloud },
  { href: "/community", label: t('navigation.community'), icon: Users },
  { href: "/achievements", label: t('navigation.achievements'), icon: Trophy },
  { href: "/budget-tracker", label: t('navigation.budget_tracker'), icon: DollarSign },
  { href: "/dashboard", label: t('navigation.dashboard'), icon: Database },
];

export default function Navigation() {
  const [location] = useLocation();
  const { user, signOut, isLoading } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { isVisible } = useScrollDirection();
  
  const navigationItems = getNavigationItems(t);

  const handleLogout = async () => {
    try {
      // Clear all React Query cache
      queryClient.clear();
      
      // Sign out using Supabase Auth
      await signOut();
      
      setMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";
  const userName = user?.user_metadata?.full_name || user?.email || "Guest User";

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-[60] md:hidden">
          <div className="px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center">
                <div className="text-lg font-bold text-orange-600">TripWise</div>
              </Link>
              
              <div className="flex items-center space-x-2">
                <LanguageToggle />
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
                  {user ? (
                    <>
                      <div className="flex items-center px-3 py-2 mb-4">
                        <Avatar className="w-8 h-8 mr-3">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{userName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full flex items-center px-3 py-2 text-slate-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        {isLoading ? t('common.loading') : t('auth.sign_out')}
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          setAuthModalOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full"
                        disabled={isLoading}
                        data-testid="button-sign-in"
                      >
                        <User className="w-5 h-5 mr-2" />
                        {t('auth.sign_in')}
                      </Button>
                      <Button
                        onClick={() => {
                          setAuthModalOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                        data-testid="button-create-account"
                      >
                        {t('auth.create_account')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Bottom Navigation - Sliding */}
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 md:hidden z-[60] transition-transform duration-300 ease-in-out ${
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
        
        {/* Auth Modal for Mobile */}
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen}
        />
      </>
    );
  }

  // Desktop Right Sidebar
  return (
    <>
      {/* Desktop Right Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl border-l border-gray-200 z-[60] hidden md:flex flex-col">
        {/* Sidebar Header with Logo and Language Toggle */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center justify-center mb-4">
            <div className="text-xl font-bold text-orange-600">TripWise</div>
          </Link>
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
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
        
        {/* User Profile and Auth Section at Bottom */}
        <div className="p-4 border-t border-gray-200">
          {user ? (
            <>
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-orange-200 text-orange-800">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                disabled={isLoading}
                className="w-full justify-start px-4 py-3 text-slate-700 border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {isLoading ? t('common.loading') : t('auth.sign_out')}
              </Button>
            </>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="w-full"
                disabled={isLoading}
              >
                <User className="w-5 h-5 mr-2" />
                {t('auth.sign_in')}
              </Button>
              <Button
                onClick={() => setAuthModalOpen(true)}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                {t('auth.create_account')}
              </Button>
            </div>
          )}
        </div>
      </aside>
      
      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
    </>
  );
}
