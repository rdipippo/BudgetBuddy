import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: "ri-dashboard-line",
    },
    {
      title: "Accounts",
      href: "/accounts",
      icon: "ri-bank-line",
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: "ri-exchange-funds-line",
    },
    {
      title: "Budgets",
      href: "/budgets",
      icon: "ri-pie-chart-line",
    },
    {
      title: "Reports",
      href: "/reports",
      icon: "ri-line-chart-line",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: "ri-settings-line",
    },
  ];

  return (
    <aside className={cn("flex flex-col fixed inset-y-0 border-r border-gray-200 bg-white", className)} {...props}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-primary-600">BudgetTrack</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/" && location.startsWith(item.href));
            
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                isActive 
                  ? "text-white bg-primary-600" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <i className={cn(
                item.icon, 
                "mr-3 text-xl",
                isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
              )}></i>
              {item.title}
            </Link>
          );
        })}
      </nav>
      
      {user && (
        <div className="flex items-center px-4 py-3 border-t border-gray-200">
          <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded-full">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.firstName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <i className="ri-user-line text-gray-500 text-xl"></i>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">
              {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email || 'User'}
            </p>
            <p className="text-xs text-gray-500">View profile</p>
          </div>
          <a href="/api/logout" className="ml-auto text-gray-500 hover:text-gray-700">
            <i className="ri-logout-box-line text-lg"></i>
          </a>
        </div>
      )}
    </aside>
  );
}
