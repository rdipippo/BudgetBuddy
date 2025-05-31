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
          <>
            <div className="mt-6">
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                Select your bank
              </label>
              <Select value={institution} onValueChange={setInstitution}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a bank or institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chase">Chase</SelectItem>
                  <SelectItem value="bank_of_america">Bank of America</SelectItem>
                  <SelectItem value="wells_fargo">Wells Fargo</SelectItem>
                  <SelectItem value="citibank">Citibank</SelectItem>
                  <SelectItem value="capital_one">Capital One</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 border rounded-md p-4 bg-gray-50">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-blue-500 rounded mr-2"></div>
                  <span className="font-medium">Plaid Secure Connection</span>
                </div>
                <span className="text-xs text-gray-500">Powered by Plaid</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                To connect your account securely, you'll be redirected to your bank's login page.
              </p>
              
              <PlaidLink
                linkToken={linkToken}
                onSuccess={onPlaidSuccess}
                onExit={onPlaidExit}
                isLoading={isCreatingLinkToken}
                className="w-full"
              >
                Continue with Plaid
              </PlaidLink>
            </div>
          </>
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
          
          {!isLinking && linkToken && (
            <PlaidLink
              linkToken={linkToken}
              onSuccess={onPlaidSuccess}
              onExit={onPlaidExit}
              isLoading={isCreatingLinkToken}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Continue
            </PlaidLink>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
