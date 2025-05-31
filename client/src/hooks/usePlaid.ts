import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function usePlaid() {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  // Create link token
  const createLinkToken = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/plaid/create-link-token', {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data.error) {
        toast({
          title: "Error creating link",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      return data.link_token;
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to create link token",
        variant: "destructive",
      });
    }
  });

  // Exchange public token
  const exchangePublicToken = useMutation({
    mutationFn: async (publicToken: string) => {
      const response = await apiRequest('POST', '/api/plaid/exchange-token', { public_token: publicToken });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account connected",
        description: "Your financial accounts have been successfully connected.",
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setIsLinking(false);
      setIsLinkModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect account",
        variant: "destructive",
      });
      setIsLinking(false);
    }
  });

  // Handle Plaid success
  const handlePlaidSuccess = (publicToken: string) => {
    setIsLinking(true);
    exchangePublicToken.mutate(publicToken);
  };

  // Handle Plaid exit
  const handlePlaidExit = () => {
    setIsLinking(false);
    setIsLinkModalOpen(false);
  };

  // Dashboard data
  const dashboardData = useQuery({
    queryKey: ['/api/dashboard'],
    retry: false,
  });

  // Accounts data
  const accountsData = useQuery({
    queryKey: ['/api/accounts'],
    retry: false,
  });

  return {
    dashboardData: dashboardData.data,
    isDashboardLoading: dashboardData.isLoading,
    accounts: accountsData.data,
    isAccountsLoading: accountsData.isLoading,
    openLinkModal: () => {
      setIsLinkModalOpen(true);
      createLinkToken.mutate();
    },
    closeLinkModal: () => setIsLinkModalOpen(false),
    isLinkModalOpen,
    linkToken: createLinkToken.data?.link_token,
    isCreatingLinkToken: createLinkToken.isPending,
    isLinking,
    handlePlaidSuccess,
    handlePlaidExit,
  };
}
