# BudgetTrack - Financial Management Application

## Overview

BudgetTrack is a web application for personal finance management that allows users to connect their financial accounts, track transactions, manage budgets, and analyze spending patterns. It's built with a modern React frontend and Node.js/Express backend, using PostgreSQL for data storage and Plaid for financial account connectivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture:

1. **Frontend**: React application with Shadcn UI components, using React Query for data fetching and state management.
2. **Backend**: Express.js server handling API requests, authentication, and database operations.
3. **Database**: PostgreSQL with Drizzle ORM for schema management and data operations.
4. **Authentication**: Replit Auth for user authentication and session management.
5. **Financial Data**: Plaid API integration for connecting to banks and financial institutions.

The application uses a monorepo structure with clear separation between client, server, and shared code.

## Key Components

### Frontend

- **Client Framework**: React with TypeScript
- **State Management**: React Query for server state, React Context for application state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn UI (based on Radix UI) with Tailwind CSS for styling
- **Forms**: React Hook Form with Zod for validation

Key frontend pages include:
- Dashboard: Overview of financial status
- Accounts: Managing connected financial accounts
- Transactions: Viewing and filtering transaction history
- Budgets: Creating and managing spending budgets

### Backend

- **Server Framework**: Express.js
- **Database Access**: Drizzle ORM with @neondatabase/serverless
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express-session with PostgreSQL session storage
- **Financial Data**: Plaid API client

Main server responsibilities:
- API routes for CRUD operations
- Authentication and session management
- Plaid API integration
- Transaction synchronization

### Database Schema

The database uses the following main tables:
- **users**: User profiles and authentication data
- **sessions**: Session storage for authentication
- **plaid_items**: Connected financial institutions/accounts
- **accounts**: Financial account details
- **transactions**: Transaction history
- **budgets**: User-defined budget categories and amounts

## Data Flow

1. **User Authentication**:
   - User authenticates via Replit Auth (OpenID Connect)
   - Server creates/verifies session and user record
   - Frontend receives user data and authenticated status

2. **Account Connection**:
   - Frontend requests Plaid link token from backend
   - User connects financial institution via Plaid Link
   - Backend exchanges public token for access token
   - Backend stores Plaid item and account information

3. **Transaction Management**:
   - Backend syncs transactions from Plaid API
   - Transactions are stored in database
   - Frontend displays transactions with filtering/sorting options

4. **Budget Management**:
   - User creates/edits budgets through the frontend
   - Backend stores budget data and tracks spending against budgets
   - Dashboard shows budget progress and alerts

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Data fetching and server state management
- **@radix-ui/react-***: UI component primitives
- **class-variance-authority**: Utility for component styling variants
- **wouter**: Lightweight router for React
- **tailwindcss**: Utility-first CSS framework

### Backend Dependencies
- **@neondatabase/serverless**: PostgreSQL client for serverless environments
- **drizzle-orm**: TypeScript ORM for database operations
- **plaid**: Official Plaid API client
- **express**: Web server framework
- **openid-client**: OpenID Connect client for authentication

### External Services
- **Plaid API**: For connecting to financial institutions
- **Replit Auth**: For user authentication

## Deployment Strategy

The application is configured for deployment on Replit with:

1. **Development Mode**:
   - Uses Vite for development server
   - Runs both client and server in development mode
   - Hot module replacement for frontend code

2. **Production Mode**:
   - Builds frontend with Vite
   - Bundles server code with esbuild
   - Serves static assets from Express
   - Environment variables for configuration

3. **Database**:
   - Uses PostgreSQL database provisioned by Replit
   - Database URL provided via environment variables
   - Schema managed with Drizzle ORM

The deployment process is defined in the `.replit` configuration file, which specifies build and run commands for both development and production environments.