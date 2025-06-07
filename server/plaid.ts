import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { storage } from './storage';

// Ensure Plaid credentials are set in environment variables
const PLAID_CLIENT_ID = (process.env.PLAID_CLIENT_ID || '').trim();
const PLAID_SECRET = (process.env.PLAID_SECRET || '').trim();
const PLAID_ENV = (process.env.PLAID_ENV || 'sandbox').trim();

// Debug log the credentials (without exposing the full secret)
console.log('Plaid Config:');
console.log('Client ID:', PLAID_CLIENT_ID);
console.log('Secret (first 10 chars):', PLAID_SECRET.substring(0, 10) + '...');
console.log('Environment:', PLAID_ENV);

// Configure Plaid
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV as keyof typeof PlaidEnvironments],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Create a link token for the front-end Plaid Link integration
export async function createLinkToken(userId: string) {
  try {
    const request = {
      user: {
        client_user_id: userId,
      },
      client_name: 'BudgetTrack',
      products: ['transactions', 'auth'] as Products[],
      country_codes: ['US'] as CountryCode[],
      language: 'en',
      // Add sandbox configuration to skip phone verification
      ...(PLAID_ENV === 'sandbox' && {
        android_package_name: null,
        webhook: null,
        link_customization_name: null,
      }),
    };

    const response = await plaidClient.linkTokenCreate(request);
    return response.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
}

// Exchange public token for access token and item ID
export async function exchangePublicToken(userId: string, publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;

    // Check if item already exists
    const existingItem = await storage.getPlaidItemByItemId(itemId);
    
    let item;
    if (existingItem) {
      item = existingItem;
    } else {
      // Save item and accounts in database
      item = await storage.createPlaidItem({
        userId,
        itemId,
        accessToken,
        status: 'active',
      });
    }

    // Save each account (check for duplicates first)
    for (const account of accounts) {
      const existingAccount = await storage.getAccountByAccountId(account.account_id);
      
      if (!existingAccount) {
        await storage.createAccount({
          userId,
          itemId: item.id,
          accountId: account.account_id,
          name: account.name,
          officialName: account.official_name || account.name,
          type: account.type,
          subtype: account.subtype || null,
          mask: account.mask || null,
          balanceAvailable: account.balances.available || 0,
          balanceCurrent: account.balances.current || 0,
          balanceLimit: account.balances.limit || null,
          balanceIsoCurrencyCode: account.balances.iso_currency_code || 'USD',
        });
      }
    }

    // Sync transactions for accounts
    await syncTransactions(userId, accessToken);

    return {
      itemId: item.id,
      accounts: accounts.map(a => ({
        id: a.account_id,
        name: a.name,
        type: a.type,
        subtype: a.subtype,
        balanceAvailable: a.balances.available,
        balanceCurrent: a.balances.current,
      })),
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
}

// Sync transactions from Plaid to our database
export async function syncTransactions(userId: string, accessToken: string) {
  try {
    // Get transactions from the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });

    const transactions = response.data.transactions;

    // Save transactions to database
    for (const transaction of transactions) {
      await storage.createTransaction({
        userId,
        accountId: transaction.account_id,
        transactionId: transaction.transaction_id,
        amount: transaction.amount,
        date: new Date(transaction.date),
        name: transaction.name,
        merchantName: transaction.merchant_name || null,
        category: transaction.category ? transaction.category.join(', ') : null,
        categoryId: transaction.category_id || null,
        pending: transaction.pending || false,
        paymentChannel: transaction.payment_channel || null,
        isoCurrencyCode: transaction.iso_currency_code || 'USD',
      });
    }

    return transactions.length;
  } catch (error) {
    console.error('Error syncing transactions:', error);
    throw error;
  }
}

// Fetch all information for a user's financial dashboard
export async function getDashboardData(userId: string) {
  try {
    // Get accounts
    const accounts = await storage.getAccountsByUserId(userId);
    
    // Get transactions (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const transactions = await storage.getTransactionsByDateRange(
      userId,
      thirtyDaysAgo,
      now
    );
    
    // Get budgets
    const budgets = await storage.getBudgetsByUserId(userId);
    
    // Calculate summary data
    const totalBalance = accounts.reduce((sum, account) => sum + account.balanceCurrent, 0);
    
    // Calculate income (positive transactions)
    const income = transactions
      .filter(t => t.amount < 0) // Plaid reports deposits as negative amounts
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate expenses (negative transactions)
    const expenses = transactions
      .filter(t => t.amount > 0) // Plaid reports expenses as positive amounts
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Group transactions by category for spending breakdown
    const spendingByCategory = transactions
      .filter(t => t.amount > 0 && t.category) // Only include expenses with categories
      .reduce((groups, t) => {
        const category = t.category?.split(',')[0].trim() || 'Other';
        if (!groups[category]) {
          groups[category] = 0;
        }
        groups[category] += t.amount;
        return groups;
      }, {} as Record<string, number>);
    
    // Calculate monthly data for chart
    const monthlyData = Array(12).fill(0);
    transactions.forEach(t => {
      const month = t.date.getMonth();
      if (t.amount > 0) { // Expense
        monthlyData[month] += t.amount;
      }
    });
    
    return {
      accounts,
      totalBalance,
      income,
      expenses,
      recentTransactions: transactions.slice(0, 10),
      spendingByCategory,
      budgets,
      monthlyData,
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
}
