import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Transaction {
  id: number;
  name: string;
  category: string | null;
  amount: number;
  date: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  isDefault: boolean;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  categories: Category[];
}

export function EditCategoryModal({ isOpen, onClose, transaction, categories }: EditCategoryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ transactionId, category }: { transactionId: number; category: string }) => {
      await apiRequest(`/api/transactions/${transactionId}/category`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Transaction category updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update transaction category",
        variant: "destructive",
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const response = await apiRequest("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      return response;
    },
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setSelectedCategory(newCategory.name);
      setIsCreatingNew(false);
      setNewCategoryName("");
      setNewCategoryColor("#3B82F6");
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!transaction) return;

    if (isCreatingNew && newCategoryName.trim()) {
      createCategoryMutation.mutate({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });
    } else if (selectedCategory) {
      updateTransactionMutation.mutate({
        transactionId: transaction.id,
        category: selectedCategory,
      });
    }
  };

  const handleCreateNewCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });
    }
  };

  const colorOptions = [
    { value: "#3B82F6", label: "Blue" },
    { value: "#10B981", label: "Green" },
    { value: "#F59E0B", label: "Orange" },
    { value: "#EF4444", label: "Red" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#06B6D4", label: "Cyan" },
    { value: "#84CC16", label: "Lime" },
    { value: "#F97316", label: "Orange" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction Category</DialogTitle>
        </DialogHeader>
        
        {transaction && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Transaction</p>
              <p className="font-medium">{transaction.name}</p>
              <p className="text-sm text-muted-foreground">
                Current category: {transaction.category || "Uncategorized"}
              </p>
            </div>

            {!isCreatingNew ? (
              <div className="space-y-2">
                <Label htmlFor="category">Select Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingNew(true)}
                  className="w-full"
                >
                  Create New Category
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newCategoryName">Category Name</Label>
                  <Input
                    id="newCategoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newCategoryColor">Color</Label>
                  <Select value={newCategoryColor} onValueChange={setNewCategoryColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setNewCategoryName("");
                      setNewCategoryColor("#3B82F6");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateNewCategory}
                    disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                    className="flex-1"
                  >
                    {createCategoryMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            )}

            {!isCreatingNew && (
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!selectedCategory || updateTransactionMutation.isPending}
                  className="flex-1"
                >
                  {updateTransactionMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}