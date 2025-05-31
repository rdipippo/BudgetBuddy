import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage, calculatePercentage } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface SpendingByCategoryProps {
  categories: Category[];
  isLoading?: boolean;
}

export function SpendingByCategory({ categories = [], isLoading = false }: SpendingByCategoryProps) {
  // Calculate total spending
  const totalSpending = categories.reduce((sum, category) => sum + category.amount, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-2 sm:px-6">
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="w-3 h-3 rounded-full mr-2" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-4 w-8 ml-2" />
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-2 text-center py-4 text-gray-500">
              No spending data available
            </div>
          ) : (
            categories.map((category) => (
              <div className="flex items-center" key={category.name}>
                <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                <div className="text-sm text-gray-600">{category.name}</div>
                <div className="ml-auto font-medium text-gray-900 tabular-nums">
                  {formatCurrency(category.amount)}
                </div>
                <div className="ml-2 text-xs text-gray-500">
                  {formatPercentage(category.percentage)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="/transactions" className="font-medium text-primary-600 hover:text-primary-500">
            View all categories
            <span className="sr-only"> Spending by Category</span>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
