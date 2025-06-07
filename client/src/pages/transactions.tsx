import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  formatCurrency, 
  formatDate, 
  getCategoryColor
} from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ArrowDown, ArrowUp, Edit3, Settings } from 'lucide-react';
import { groupTransactionsByMonth, sortTransactionsByDate } from "@/lib/utils";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { EditCategoryModal } from "@/components/modals/EditCategoryModal";
import { CategoryManagerModal } from "@/components/modals/CategoryManagerModal";

export default function Transactions() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30days");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions', dateFilter, categoryFilter],
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = '/api/login';
    }
  }, [isAuthLoading, isAuthenticated]);

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Filter and sort transactions
  const filteredTransactions = transactions ? transactions.filter((t: any) => {
    // Search filter
    const nameMatch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = !searchTerm || (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const passesCategoryFilter = categoryFilter === "all" || 
      (t.category && t.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    
    return (nameMatch || categoryMatch) && passesCategoryFilter;
  }) : [];

  // Sort transactions
  const sortedTransactions = sortTransactionsByDate(filteredTransactions || []);
  
  // Group transactions by month
  const groupedTransactions = groupTransactionsByMonth(
    sortDirection === "desc" ? sortedTransactions : [...sortedTransactions].reverse()
  );

  // Get unique categories for filter
  const categories = transactions ? [...new Set(
    transactions
      .filter((t: any) => t.category)
      .map((t: any) => t.category.split(',')[0].trim())
  )].sort() : [];

  return (
    <AppLayout
      title="Transactions"
      subtitle="View and manage your transaction history"
    >
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
                title={sortDirection === "desc" ? "Oldest first" : "Newest first"}
              >
                {sortDirection === "desc" ? (
                  <ArrowDown className="h-4 w-4" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        {/* Transaction list content */}
        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <TransactionsLoading />
          ) : filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No transactions found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedTransactions).map(([month, monthTransactions]) => (
              <div key={month} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{month}</h3>
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {monthTransactions.map((transaction: any) => {
                            const { bg, text } = getCategoryColor(transaction.category || 'Other');
                            const amountColor = transaction.amount > 0 ? 'text-danger-600' : 'text-success-600';
                            
                            return (
                              <tr key={transaction.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(transaction.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{transaction.name}</div>
                                  {transaction.merchantName && (
                                    <div className="text-xs text-gray-500">{transaction.merchantName}</div>
                                  )}
                                  {transaction.pending && (
                                    <Badge variant="outline" className="mt-1 text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
                                      Pending
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
                                    {transaction.category || 'Uncategorized'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {transaction.accountName}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${amountColor} text-right tabular-nums`}>
                                  {transaction.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="income" className="mt-0">
          {/* Income transactions would filter by amount < 0 (in Plaid income is negative) */}
          <p className="text-gray-500 text-center p-8">Income transactions will be displayed here.</p>
        </TabsContent>

        <TabsContent value="expenses" className="mt-0">
          {/* Expense transactions would filter by amount > 0 (in Plaid expenses are positive) */}
          <p className="text-gray-500 text-center p-8">Expense transactions will be displayed here.</p>
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          {/* Pending transactions would filter by pending = true */}
          <p className="text-gray-500 text-center p-8">Pending transactions will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function TransactionsLoading() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array(8).fill(0).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
