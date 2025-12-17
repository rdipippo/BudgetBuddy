import { Router, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Accounts from "@/pages/accounts";
import Transactions from "@/pages/transactions";
import Budgets from "@/pages/budgets";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Router base="/BudgetBuddy">
      <Route path="/" component={Dashboard} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/budgets" component={Budgets} />
      <Route component={NotFound} />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
