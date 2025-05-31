import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthlyOverviewProps {
  data: number[];
  isLoading?: boolean;
}

export function MonthlyOverview({ data = [], isLoading = false }: MonthlyOverviewProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Find the maximum value to normalize heights
  const maxValue = Math.max(...data, 1); // Prevent division by zero

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-2 sm:px-6">
        {isLoading ? (
          <div className="h-[200px] flex items-end justify-between gap-2">
            {Array(12).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-24" />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <div className="chart-container" style={{ height: '200px', position: 'relative' }}>
              {data.map((value, index) => {
                const height = (value / maxValue) * 100;
                return (
                  <div
                    key={index}
                    className={`chart-bar ${index > 5 ? 'bg-primary-600' : 'bg-primary-500'}`}
                    style={{
                      left: `calc(8% * ${index})`,
                      height: `${height}%`,
                    }}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-6 gap-2 mt-2 text-xs text-gray-600">
              {months.map((month, index) => (
                <div key={month} className="text-center">{month}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
