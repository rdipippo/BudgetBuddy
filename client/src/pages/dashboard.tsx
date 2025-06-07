import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { SpendingByCategory } from "@/components/dashboard/SpendingByCategory";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { PlaidLink } from "@/components/shared/PlaidLink";
import { useAuth } from "@/hooks/useAuth";
import { Download, Link, Wallet, ShoppingCart } from "lucide-react";
import { calculatePercentage } from "@/lib/formatters";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  
  // Get dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    retry: false,
  });

  // Create link token
  const createLinkToken = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/plaid/create-link-token', {});
      return response.json();
    },
    onSuccess: (data) => {
      setLinkToken(data.link_token);
      setIsCreatingToken(false);
    },
    onError: () => {
      setIsCreatingToken(false);
      toast({
        title: "Connection failed",
        description: "Failed to create bank connection",
        variant: "destructive",
      });
    }
  });

  // Exchange public token
  const exchangePublicToken = useMutation({
    mutationFn: async (publicToken: string) => {
      const response = await apiRequest('POST', '/api/plaid/exchange-token', { public_token: publicToken });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account connected",
        description: "Your financial accounts have been successfully connected.",
      });
      // Refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setLinkToken(null);
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect account",
        variant: "destructive",
      });
    }
  });

  const handleCreateToken = () => {
    setIsCreatingToken(true);
    createLinkToken.mutate();
  };

  const handlePlaidSuccess = (publicToken: string) => {
    exchangePublicToken.mutate(publicToken);
  };

  const handlePlaidExit = () => {
    setLinkToken(null);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = '/api/login';
    }
  }, [isAuthLoading, isAuthenticated]);

  // Show loading toast when fetching dashboard data
  useEffect(() => {
    if (isDashboardLoading) {
      toast({
        title: "Loading your financial data",
        description: "Please wait while we fetch your latest information."
      });
    }
  }, [isDashboardLoading, toast]);

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Prepare data for spending by category
  const spendingCategories = dashboardData?.spendingByCategory 
    ? Object.entries(dashboardData.spendingByCategory).map(([name, amount]) => {
        const percentage = calculatePercentage(amount as number, dashboardData.expenses);
        return {
          name,
          amount: amount as number,
          percentage,
          color: getCategoryColorClass(name)
        };
      }).sort((a, b) => b.amount - a.amount)
    : [];

  // Prepare transactions data
  const transactions = dashboardData?.recentTransactions?.map(t => ({
    id: t.id,
    date: t.date,
    name: t.name,
    category: t.category,
    accountName: t.accountName || 'Unknown Account',
    amount: t.amount
  })) || [];

  // Prepare budget data
  const budgets = dashboardData?.budgets?.map(b => ({
    id: b.id,
    name: b.name,
    amount: b.amount,
    spent: b.spent
  })) || [];

  return (
    <AppLayout
      title="Financial Dashboard"
      subtitle="Get an overview of your financial health"
      actions={
        <>
          {!linkToken ? (
            <Button 
              variant="default"
              onClick={handleCreateToken}
              disabled={isCreatingToken}
            >
              <Link className="h-4 w-4 mr-2" />
              {isCreatingToken ? 'Creating...' : 'Connect Account'}
            </Button>
          ) : (
            <PlaidLink
              linkToken={linkToken}
              onSuccess={handlePlaidSuccess}
              onExit={handlePlaidExit}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              <Link className="h-4 w-4 mr-2" />
              Open Bank Connection
            </PlaidLink>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard
          title="Total Balance"
          amount={dashboardData?.totalBalance || 0}
          change={3.2}
          icon={<Wallet className="h-5 w-5 text-primary-600" />}
          iconBgColor="bg-primary-100"
          footerLink="/accounts"
          footerText="View all accounts"
          isLoading={isDashboardLoading}
        />
        
        <BalanceCard
          title="Monthly Income"
          amount={dashboardData?.income || 0}
          change={5.4}
          icon={<i className="ri-funds-line text-xl text-success-600" />}
          iconBgColor="bg-success-100"
          changeColor="text-success-600"
          footerLink="/transactions?type=income"
          footerText="View income details"
          isLoading={isDashboardLoading}
        />
        
        <BalanceCard
          title="Monthly Expenses"
          amount={dashboardData?.expenses || 0}
          change={2.1}
          icon={<ShoppingCart className="h-5 w-5 text-danger-600" />}
          iconBgColor="bg-danger-100"
          changeColor="text-danger-600"
          footerLink="/transactions?type=expense"
          footerText="View expense details"
          isLoading={isDashboardLoading}
        />

        <div className="col-span-1 md:col-span-2">
          <MonthlyOverview
            data={dashboardData?.monthlyData || Array(12).fill(0)}
            isLoading={isDashboardLoading}
          />
        </div>

        <div className="col-span-1">
          <BudgetProgress
            budgets={budgets}
            isLoading={isDashboardLoading}
          />
        </div>

        <div className="col-span-1 lg:col-span-2">
          <SpendingByCategory
            categories={spendingCategories}
            isLoading={isDashboardLoading}
          />
        </div>

        <div className="col-span-1 lg:col-span-3">
          <RecentTransactions
            transactions={transactions}
            isLoading={isDashboardLoading}
          />
        </div>
      </div>

    </AppLayout>
  );
}

// Helper function to determine color for categories
function getCategoryColorClass(category: string): string {
  const categoryColors: Record<string, string> = {
    'Food and Drink': 'bg-success-500',
    'Groceries': 'bg-success-500',
    'Transportation': 'bg-primary-500',
    'Travel': 'bg-primary-500',
    'Entertainment': 'bg-danger-500',
    'Shopping': 'bg-warning-500',
    'Income': 'bg-gray-500',
    'Payment': 'bg-purple-500',
    'Transfer': 'bg-blue-500',
  };
  
  // Check if category starts with any of the keys
  for (const key in categoryColors) {
    if (category.startsWith(key)) {
      return categoryColors[key];
    }
  }
  
  return 'bg-gray-500';
}
