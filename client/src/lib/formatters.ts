/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Calculate the percentage of two numbers
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format percentage as a string with % symbol
 */
export function formatPercentage(percentage: number): string {
  return `${percentage}%`;
}

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Helper to get the color class for a budget progress bar
 */
export function getBudgetProgressColor(percentage: number): string {
  if (percentage < 70) return 'bg-success-500';
  if (percentage < 90) return 'bg-warning-500';
  return 'bg-danger-500';
}

/**
 * Get color for transaction amount
 */
export function getTransactionAmountColor(amount: number): string {
  return amount > 0 ? 'text-danger-600' : 'text-success-600';
}

/**
 * Get color for transaction category badge
 */
export function getCategoryColor(category: string): {bg: string, text: string} {
  const categories: Record<string, {bg: string, text: string}> = {
    'Food and Drink': {bg: 'bg-success-100', text: 'text-success-800'},
    'Groceries': {bg: 'bg-success-100', text: 'text-success-800'},
    'Transportation': {bg: 'bg-primary-100', text: 'text-primary-800'},
    'Travel': {bg: 'bg-primary-100', text: 'text-primary-800'},
    'Entertainment': {bg: 'bg-danger-100', text: 'text-danger-800'},
    'Shopping': {bg: 'bg-warning-100', text: 'text-warning-800'},
    'Income': {bg: 'bg-gray-100', text: 'text-gray-800'},
    'Payment': {bg: 'bg-purple-100', text: 'text-purple-800'},
    'Transfer': {bg: 'bg-blue-100', text: 'text-blue-800'},
  };
  
  // Check if category starts with any of the keys
  for (const key in categories) {
    if (category.startsWith(key)) {
      return categories[key];
    }
  }
  
  return {bg: 'bg-gray-100', text: 'text-gray-800'};
}
