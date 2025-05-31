import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlaid } from "@/hooks/usePlaid";
import { ConnectAccountModal } from "@/components/modals/ConnectAccountModal";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function Accounts() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { 
    accounts,
    isAccountsLoading,
    openLinkModal,
    closeLinkModal,
    isLinkModalOpen,
    linkToken,
    isCreatingLinkToken,
    isLinking,
    handlePlaidSuccess,
    handlePlaidExit
  } = usePlaid();

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

  return (
    <AppLayout
      title="Your Accounts"
      subtitle="Manage your connected financial accounts"
      actions={
        <Button onClick={openLinkModal}>
          <Link className="h-4 w-4 mr-2" />
          Connect Account
        </Button>
      }
    >
      {isAccountsLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-24" /></CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-32 mb-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : accounts?.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{account.name}</CardTitle>
                <p className="text-sm text-gray-500 capitalize">{account.type} {account.subtype ? `- ${account.subtype}` : ''}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className="text-2xl font-semibold tabular-nums">{formatCurrency(account.balanceCurrent)}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Available Balance</span>
                    <span className="font-medium tabular-nums">{formatCurrency(account.balanceAvailable)}</span>
                  </div>
                  {account.balanceLimit !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Credit Limit</span>
                      <span className="font-medium tabular-nums">{formatCurrency(account.balanceLimit)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account #</span>
                    <span className="font-medium">••••{account.mask || '0000'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add new account card */}
          <Card className="border-dashed border-2 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={openLinkModal}>
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Add Account</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Connect a new financial account to track your balance and transactions
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <Link className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Connect your first account</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Get started by connecting your bank accounts, credit cards, and other financial institutions to track your finances in one place.
            </p>
            <Button onClick={openLinkModal} size="lg">
              <Link className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          </CardContent>
        </Card>
      )}

      <ConnectAccountModal
        isOpen={isLinkModalOpen}
        onClose={closeLinkModal}
        linkToken={linkToken}
        onPlaidSuccess={handlePlaidSuccess}
        onPlaidExit={handlePlaidExit}
        isCreatingLinkToken={isCreatingLinkToken}
        isLinking={isLinking}
      />
    </AppLayout>
  );
}
