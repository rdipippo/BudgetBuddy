import {
  users,
  type User,
  type UpsertUser,
  plaidItems,
  type PlaidItem,
  type InsertPlaidItem,
  accounts,
  type Account,
  type InsertAccount,
  transactions,
  type Transaction,
  type InsertTransaction,
  budgets,
  type Budget,
  type InsertBudget,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Plaid Item operations
  createPlaidItem(item: InsertPlaidItem): Promise<PlaidItem>;
  getPlaidItemsByUserId(userId: string): Promise<PlaidItem[]>;
  getPlaidItemByItemId(itemId: string): Promise<PlaidItem | undefined>;
  
  // Account operations
  createAccount(account: InsertAccount): Promise<Account>;
  getAccountsByUserId(userId: string): Promise<Account[]>;
  getAccountByAccountId(accountId: string): Promise<Account | undefined>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  
  // Budget operations
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgetsByUserId(userId: string): Promise<Budget[]>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Plaid Item operations
  async createPlaidItem(item: InsertPlaidItem): Promise<PlaidItem> {
    const [newItem] = await db
      .insert(plaidItems)
      .values(item)
      .returning();
    return newItem;
  }

  async getPlaidItemsByUserId(userId: string): Promise<PlaidItem[]> {
    return await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.userId, userId));
  }

  async getPlaidItemByItemId(itemId: string): Promise<PlaidItem | undefined> {
    const [item] = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.itemId, itemId));
    return item;
  }

  // Account operations
  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db
      .insert(accounts)
      .values(account)
      .onConflictDoUpdate({
        target: accounts.accountId,
        set: {
          ...account,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newAccount;
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
  }

  async getAccountByAccountId(accountId: string): Promise<Account | undefined> {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.accountId, accountId));
    return account;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .onConflictDoUpdate({
        target: transactions.transactionId,
        set: {
          ...transaction,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newTransaction;
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));
  }

  // Budget operations
  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db
      .insert(budgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async getBudgetsByUserId(userId: string): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));
  }

  async updateBudget(id: number, budgetData: Partial<InsertBudget>): Promise<Budget> {
    const [updatedBudget] = await db
      .update(budgets)
      .set({
        ...budgetData,
        updatedAt: new Date(),
      })
      .where(eq(budgets.id, id))
      .returning();
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<void> {
    await db
      .delete(budgets)
      .where(eq(budgets.id, id));
  }
}

export const storage = new DatabaseStorage();
