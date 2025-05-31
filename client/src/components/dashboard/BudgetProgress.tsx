import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, getBudgetProgressColor } from '@/lib/formatters';
import { calculateBudgetProgress } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

interface BudgetProgressProps {
  budgets: Budget[];
  isLoading?: boolean;
}

export function BudgetProgress({ budgets = [], isLoading = false }: BudgetProgressProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div className="space-y-2" key={i}>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2.5 w-full" />
              </div>
            ))
          ) : budgets.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No budgets created yet
            </div>
          ) : (
            budgets.map((budget) => {
              const percentage = calculateBudgetProgress(budget.spent, budget.amount);
              const progressColor = getBudgetProgressColor(percentage);
              
              return (
                <div className="space-y-2" key={budget.id}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">{budget.name}</div>
                    <div className="text-sm font-medium text-gray-700 tabular-nums">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`${progressColor} h-2.5 rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href="/budgets" className="font-medium text-primary-600 hover:text-primary-500">
            Manage budgets
            <span className="sr-only"> Budget Progress</span>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
