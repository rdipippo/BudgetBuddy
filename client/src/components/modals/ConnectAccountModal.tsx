import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Link } from 'lucide-react';
import { PlaidLink } from '@/components/shared/PlaidLink';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkToken: string | null | undefined;
  onPlaidSuccess: (publicToken: string) => void;
  onPlaidExit: () => void;
  isCreatingLinkToken: boolean;
  isLinking: boolean;
}

export function ConnectAccountModal({
  isOpen,
  onClose,
  linkToken,
  onPlaidSuccess,
  onPlaidExit,
  isCreatingLinkToken,
  isLinking,
}: ConnectAccountModalProps) {
  const [institution, setInstitution] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start">
            <div className="mr-4 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Link className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <DialogTitle>Connect your bank account</DialogTitle>
              <DialogDescription className="mt-2">
                Connect your financial accounts securely using Plaid. We use bank-level encryption to keep your information safe.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLinking && (
          <div className="mt-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-3 text-sm font-medium text-gray-700">Connecting to your bank...</span>
          </div>
        )}

        {!isLinking && (
          <div className="mt-6 text-center">
            <div className="mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Link className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                Connect securely to your bank using Plaid's encrypted connection.
              </p>
            </div>
            
            <PlaidLink
              linkToken={linkToken}
              onSuccess={onPlaidSuccess}
              onExit={onPlaidExit}
              onOpen={onClose}
              isLoading={isCreatingLinkToken}
              className="w-full py-3"
            >
              Connect Bank Account
            </PlaidLink>
          </div>
        )}

        <DialogFooter className="flex space-x-2 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLinking}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
