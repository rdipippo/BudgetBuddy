import {
  pgTable,
  text,
  serial,
  varchar,
  timestamp,
  jsonb,
  index,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Plaid items (connections to financial institutions)
export const plaidItems = pgTable("plaid_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: varchar("item_id").notNull().unique(),
  accessToken: varchar("access_token").notNull(),
  status: varchar("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial accounts
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => plaidItems.id),
  accountId: varchar("account_id").notNull().unique(),
  name: varchar("name").notNull(),
  officialName: varchar("official_name"),
  type: varchar("type").notNull(), // depository, credit, loan, investment, etc.
  subtype: varchar("subtype"), // checking, savings, credit card, etc.
  mask: varchar("mask"), // last 4 digits of account number
  balanceAvailable: decimal("balance_available", { precision: 19, scale: 4 }).default("0"),
  balanceCurrent: decimal("balance_current", { precision: 19, scale: 4 }).default("0"),
  balanceLimit: decimal("balance_limit", { precision: 19, scale: 4 }),
  balanceIsoCurrencyCode: varchar("balance_iso_currency_code").default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountId: varchar("account_id").notNull(),
  transactionId: varchar("transaction_id").notNull().unique(),
  amount: decimal("amount", { precision: 19, scale: 4 }).notNull(),
  date: timestamp("date").notNull(),
  name: varchar("name").notNull(),
  merchantName: varchar("merchant_name"),
  category: text("category"),
  categoryId: varchar("category_id"),
  pending: boolean("pending").default(false),
  paymentChannel: varchar("payment_channel"),
  isoCurrencyCode: varchar("iso_currency_code").default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budgets
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  amount: decimal("amount", { precision: 19, scale: 4 }).notNull(),
  category: varchar("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertPlaidItem = typeof plaidItems.$inferInsert;
export type PlaidItem = typeof plaidItems.$inferSelect;

export type InsertAccount = typeof accounts.$inferInsert;
export type Account = typeof accounts.$inferSelect;

export type InsertTransaction = typeof transactions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;

export type InsertBudget = typeof budgets.$inferInsert;
export type Budget = typeof budgets.$inferSelect;

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPlaidItemSchema = createInsertSchema(plaidItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
