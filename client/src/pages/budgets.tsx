import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency, getBudgetProgressColor } from "@/lib/formatters";
import { calculateBudgetProgress } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

const budgetFormSchema = z.object({
  name: z.string().min(2, {
    message: "Budget name must be at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Budget amount must be positive.",
  }),
  category: z.string().optional(),
});

export default function Budgets() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  // Budget form
  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      category: "",
    },
  });

  // Fetch budgets
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['/api/budgets'],
  });

  // Create budget mutation
  const createBudget = useMutation({
    mutationFn: async (values: z.infer<typeof budgetFormSchema>) => {
      const response = await apiRequest("POST", "/api/budgets", values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Budget created",
        description: "Your budget has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/budgets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setIsCreateModalOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating budget",
        description: error instanceof Error ? error.message : "Failed to create budget",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof budgetFormSchema>) => {
    createBudget.mutate(values);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = '/api/login';
    }
  }, [isAuthLoading, isAuthenticated]);

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Categories for select dropdown
  const categories = [
    "Food and Dining",
    "Transportation",
    "Housing",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Healthcare",
    "Travel",
    "Education",
    "Personal Care",
    "Gifts and Donations",
    "Other"
  ];

  return (
    <AppLayout
      title="Budgets"
      subtitle="Manage your monthly spending budgets"
      actions={
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : budgets?.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget: any) => {
            const percentage = calculateBudgetProgress(budget.spent, budget.amount);
            const progressColor = getBudgetProgressColor(percentage);
            const isOverBudget = budget.spent > budget.amount;
            
            return (
              <Card key={budget.id} className={isOverBudget ? "border-danger-200" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  {budget.category && (
                    <p className="text-sm text-gray-500">{budget.category}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="text-2xl font-semibold tabular-nums">
                        {formatCurrency(budget.spent)}
                      </p>
                      <p className="text-sm text-gray-500">
                        of {formatCurrency(budget.amount)}
                      </p>
                    </div>
                    <Progress value={percentage} className={progressColor} />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {isOverBudget ? 'Over budget by' : 'Remaining'}
                    </span>
                    <span className={isOverBudget ? 'text-danger-600 font-medium' : 'text-gray-900 font-medium'}>
                      {isOverBudget 
                        ? formatCurrency(budget.spent - budget.amount)
                        : formatCurrency(budget.amount - budget.spent)
                      }
                    </span>
                  </div>
                  
                  {isOverBudget && (
                    <div className="mt-4 flex items-center text-xs text-danger-600 bg-danger-50 p-2 rounded">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      You've exceeded this budget
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Add new budget card */}
          <Card className="border-dashed border-2 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => setIsCreateModalOpen(true)}>
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Create Budget</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Set up a new budget to track your spending
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Create your first budget</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Set spending limits for different categories to help manage your finances and reach your financial goals.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Budget Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Groceries" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input type="number" placeholder="0.00" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createBudget.isPending}
                >
                  {createBudget.isPending ? "Creating..." : "Create Budget"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
