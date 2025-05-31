import React, { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Menu, Bell } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AppLayout({ 
  children, 
  title = "Financial Dashboard", 
  subtitle = "Get an overview of your financial health",
  actions
}: AppLayoutProps) {
  const { user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const [location] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar - Shown when mobileMenuOpen is true */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
          <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
            <div className="absolute top-0 right-0 pt-2 pr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <i className="ri-close-line text-2xl"></i>
              </Button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top Nav Bar (Mobile & Tablet) */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6 md:px-8">
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-500" />
            </Button>
            <h1 className="ml-3 text-xl font-semibold text-primary-600">BudgetTrack</h1>
          </div>
          
          <div className="flex items-center ml-auto">
            <Button variant="ghost" size="icon" className="text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="relative ml-3 md:hidden">
              <Button variant="ghost" size="icon" className="flex items-center max-w-xs rounded-full">
                {user && (user as any).profileImageUrl ? (
                  <img
                    src={(user as any).profileImageUrl}
                    alt={(user as any).firstName || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 overflow-hidden rounded-full bg-gray-300 flex items-center justify-center">
                    <i className="ri-user-line text-gray-500"></i>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 sm:px-6 md:px-8">
          {/* Page Header */}
          <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            </div>
            {actions && (
              <div className="mt-4 flex space-x-3 md:mt-0">
                {actions}
              </div>
            )}
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Mobile & Tablet) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-10">
        <a href="/" className={cn(
          "flex-1 flex flex-col items-center py-2 text-xs font-medium",
          location === "/" ? 
            "text-primary-600 border-t-2 border-primary-500" : 
            "text-gray-500 hover:text-gray-700"
        )}>
          <i className="ri-dashboard-line text-xl mb-1"></i>
          Dashboard
        </a>
        <a href="/accounts" className={cn(
          "flex-1 flex flex-col items-center py-2 text-xs font-medium",
          location.pathname === "/accounts" ? 
            "text-primary-600 border-t-2 border-primary-500" : 
            "text-gray-500 hover:text-gray-700"
        )}>
          <i className="ri-bank-line text-xl mb-1"></i>
          Accounts
        </a>
        <a href="/transactions" className={cn(
          "flex-1 flex flex-col items-center py-2 text-xs font-medium",
          location.pathname === "/transactions" ? 
            "text-primary-600 border-t-2 border-primary-500" : 
            "text-gray-500 hover:text-gray-700"
        )}>
          <i className="ri-exchange-funds-line text-xl mb-1"></i>
          Transactions
        </a>
        <a href="/budgets" className={cn(
          "flex-1 flex flex-col items-center py-2 text-xs font-medium",
          location.pathname === "/budgets" ? 
            "text-primary-600 border-t-2 border-primary-500" : 
            "text-gray-500 hover:text-gray-700"
        )}>
          <i className="ri-pie-chart-line text-xl mb-1"></i>
          Budgets
        </a>
        <a href="/more" className={cn(
          "flex-1 flex flex-col items-center py-2 text-xs font-medium",
          location.pathname === "/more" ? 
            "text-primary-600 border-t-2 border-primary-500" : 
            "text-gray-500 hover:text-gray-700"
        )}>
          <i className="ri-more-line text-xl mb-1"></i>
          More
        </a>
      </nav>
    </div>
  );
}
