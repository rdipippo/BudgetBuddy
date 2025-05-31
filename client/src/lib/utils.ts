import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Group transactions by month
 */
export function groupTransactionsByMonth(transactions: any[]) {
  if (!transactions?.length) return [];
  
  return transactions.reduce((acc: Record<string, any[]>, transaction) => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const key = `${month} ${year}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(transaction);
    return acc;
  }, {});
}

/**
 * Calculate monthly data for charts
 */
export function calculateMonthlyData(transactions: any[]) {
  if (!transactions?.length) return Array(12).fill(0);
  
  const monthlyData = Array(12).fill(0);
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const month = date.getMonth();
    // Only include expenses (positive amounts in Plaid)
    if (transaction.amount > 0) {
      monthlyData[month] += transaction.amount;
    }
  });
  
  return monthlyData;
}

/**
 * Calculate spending by category
 */
export function calculateSpendingByCategory(transactions: any[]) {
  if (!transactions?.length) return {};
  
  return transactions.reduce((categories: Record<string, number>, transaction) => {
    if (transaction.amount <= 0 || !transaction.category) return categories;
    
    const category = transaction.category.split(',')[0].trim();
    if (!categories[category]) {
      categories[category] = 0;
    }
    
    categories[category] += transaction.amount;
    return categories;
  }, {});
}

/**
 * Sort transactions by date (newest first)
 */
export function sortTransactionsByDate(transactions: any[]) {
  if (!transactions?.length) return [];
  
  return [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Calculate budget progress
 */
export function calculateBudgetProgress(spent: number, budgeted: number) {
  if (budgeted <= 0) return 0;
  return Math.min(Math.round((spent / budgeted) * 100), 100);
}
