import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { ArrowUp } from 'lucide-react';

interface BalanceCardProps {
  title: string;
  amount: number;
  change?: number;
  icon: React.ReactNode;
  iconBgColor: string;
  changeColor?: string;
  footerLink?: string;
  footerText?: string;
  isLoading?: boolean;
}

export function BalanceCard({
  title,
  amount,
  change,
  icon,
  iconBgColor,
  changeColor = 'text-success-600',
  footerLink,
  footerText,
  isLoading = false,
}: BalanceCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                {isLoading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(amount)}
                    </div>
                    {change && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`}>
                        <ArrowUp className="mr-0.5 h-4 w-4" />
                        <span className="sr-only">Increased by</span>
                        {change}%
                      </div>
                    )}
                  </>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {footerLink && footerText && (
        <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <a href={footerLink} className="font-medium text-primary-600 hover:text-primary-500">
              {footerText}
              <span className="sr-only"> {title}</span>
            </a>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
