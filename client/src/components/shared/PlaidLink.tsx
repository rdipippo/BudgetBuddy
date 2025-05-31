import { useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PlaidLinkProps {
  linkToken: string | null | undefined;
  onSuccess: (publicToken: string) => void;
  onExit?: () => void;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PlaidLink({
  linkToken,
  onSuccess,
  onExit,
  isLoading = false,
  className = '',
  children,
}: PlaidLinkProps) {
  const onPlaidSuccess = useCallback(
    (public_token: string) => {
      onSuccess(public_token);
    },
    [onSuccess]
  );

  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    }
  }, [onExit]);

  const { open, ready } = usePlaidLink({
    token: linkToken || '',
    onSuccess: onPlaidSuccess,
    onExit: handleExit,
  });

  useEffect(() => {
    if (linkToken && ready) {
      // Auto-open if we have a token and component is ready
      // Uncomment if you want to open automatically when token is ready
      // open();
    }
  }, [linkToken, ready, open]);

  return (
    <Button
      disabled={!linkToken || !ready || isLoading}
      onClick={() => open()}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        children || 'Connect Account'
      )}
    </Button>
  );
}
