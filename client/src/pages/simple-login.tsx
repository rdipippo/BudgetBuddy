import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

export default function SimpleLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await apiRequest('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      // Reload the page to trigger auth check
      window.location.reload();
    } catch (error) {
      console.error('Login failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">BudgetTrack</CardTitle>
          <CardDescription>
            Access your personal financial dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Logging in..." : "Continue to Dashboard"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}