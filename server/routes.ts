import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  createLinkToken, 
  exchangePublicToken, 
  syncTransactions, 
  getDashboardData 
} from "./plaid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Plaid routes
  app.post('/api/plaid/create-link-token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const linkToken = await createLinkToken(userId);
      res.json(linkToken);
    } catch (error) {
      console.error("Error creating link token:", error);
      res.status(500).json({ message: "Failed to create link token" });
    }
  });

  app.post('/api/plaid/exchange-token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { public_token } = req.body;

      if (!public_token) {
        return res.status(400).json({ message: "Missing public token" });
      }

      const result = await exchangePublicToken(userId, public_token);
      res.json(result);
    } catch (error) {
      console.error("Error exchanging public token:", error);
      res.status(500).json({ message: "Failed to exchange token" });
    }
  });

  app.post('/api/plaid/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { access_token } = req.body;

      if (!access_token) {
        return res.status(400).json({ message: "Missing access token" });
      }

      const count = await syncTransactions(userId, access_token);
      res.json({ message: `Synced ${count} transactions` });
    } catch (error) {
      console.error("Error syncing transactions:", error);
      res.status(500).json({ message: "Failed to sync transactions" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dashboardData = await getDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Account routes
  app.get('/api/accounts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getAccountsByUserId(userId);
      
      // Format accounts for frontend
      const formattedAccounts = accounts.map(account => ({
        id: account.id,
        name: account.name,
        officialName: account.officialName,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
        balanceAvailable: Number(account.balanceAvailable),
        balanceCurrent: Number(account.balanceCurrent),
        balanceLimit: account.balanceLimit ? Number(account.balanceLimit) : null
      }));
      
      res.json(formattedAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      let transactions;
      
      if (startDate && endDate) {
        transactions = await storage.getTransactionsByDateRange(
          userId,
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        // Default to last 30 days if no date range provided
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        transactions = await storage.getTransactionsByDateRange(
          userId,
          startDate,
          endDate
        );
      }
      
      // Get account names for each transaction
      const accounts = await storage.getAccountsByUserId(userId);
      const accountMap = accounts.reduce((map, account) => {
        map[account.accountId] = account.name;
        return map;
      }, {} as Record<string, string>);
      
      // Format transactions for frontend
      const formattedTransactions = await Promise.all(transactions.map(async (transaction) => {
        return {
          id: transaction.id,
          transactionId: transaction.transactionId,
          date: transaction.date,
          name: transaction.name,
          merchantName: transaction.merchantName,
          category: transaction.category,
          amount: Number(transaction.amount),
          accountName: accountMap[transaction.accountId] || 'Unknown Account',
          pending: transaction.pending
        };
      }));
      
      res.json(formattedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Budget routes
  app.get('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgets = await storage.getBudgetsByUserId(userId);
      
      // Get transactions to calculate spent amount for each budget
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transactions = await storage.getTransactionsByDateRange(
        userId,
        startOfMonth,
        now
      );
      
      // Format budgets with spent amount for frontend
      const formattedBudgets = budgets.map(budget => {
        // Calculate spent amount for this budget category
        // Note: Plaid returns expenses as positive amounts
        const spent = transactions
          .filter(t => {
            if (!budget.category || !t.category) return false;
            return t.amount > 0 && t.category.toLowerCase().includes(budget.category.toLowerCase());
          })
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        return {
          id: budget.id,
          name: budget.name,
          category: budget.category,
          amount: Number(budget.amount),
          spent,
          createdAt: budget.createdAt
        };
      });
      
      res.json(formattedBudgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post('/api/budgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, amount, category } = req.body;
      
      if (!name || !amount) {
        return res.status(400).json({ message: "Name and amount are required" });
      }
      
      const budget = await storage.createBudget({
        userId,
        name,
        amount,
        category: category || null
      });
      
      res.json({
        id: budget.id,
        name: budget.name,
        category: budget.category,
        amount: Number(budget.amount),
        spent: 0, // New budget, so spent is 0
        createdAt: budget.createdAt
      });
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.put('/api/budgets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { name, amount, category } = req.body;
      
      // Verify the budget belongs to the user
      const budgets = await storage.getBudgetsByUserId(userId);
      const budget = budgets.find(b => b.id === Number(id));
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      const updatedBudget = await storage.updateBudget(Number(id), {
        name,
        amount,
        category
      });
      
      res.json({
        id: updatedBudget.id,
        name: updatedBudget.name,
        category: updatedBudget.category,
        amount: Number(updatedBudget.amount),
        // We'd need to recalculate spent here based on transactions
        spent: 0, // Placeholder, would need to be calculated
        createdAt: updatedBudget.createdAt
      });
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete('/api/budgets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify the budget belongs to the user
      const budgets = await storage.getBudgetsByUserId(userId);
      const budget = budgets.find(b => b.id === Number(id));
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      await storage.deleteBudget(Number(id));
      res.json({ message: "Budget deleted successfully" });
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
