import { useInstalledWallets, useUninstalledWallets, useWallet } from 'useink';
import { Button } from './Button';
import { Modal } from './Modal';
import { useEffect } from 'react';

type Props = {
  show: boolean;
  onClose: () => void;
};

export const ConnectWallet: React.FC<Props> = ({ show, onClose }) => {
  const { account, connect, accounts } = useWallet();
  const installed = useInstalledWallets();
  const uninstalled = useUninstalledWallets();

  useEffect(() => {
    account && onClose();
  }, [account, onClose]);

  const isConnectedWithZeroEnabledAccounts = !account && accounts?.length === 0;

  return (
    <Modal open={show} className="p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-8">Connect Wallet</h2>

      {isConnectedWithZeroEnabledAccounts ? (
        <p>Please open your wallet settings and enable at least one account for this URL.</p>
      ) : (
        !account &&
        installed.length > 0 && (
          <ul>
            {installed.map((w) => (
              <li key={w.title} className="mt-3">
                <Button className="flex items-center gap-2 w-full" onClick={() => connect(w.extensionName)}>
                  <img className="w-10 mr-2" src={w.logo.src} alt={w.logo.alt} />
                  Connect to {w.extensionName}
                </Button>
              </li>
            ))}
          </ul>
        )
      )}

      {!account && uninstalled.length && installed.length === 0 && (
        <>
          <p className="font-semibold my-6 text-center">Please install one of these supported wallets.</p>

          <ul>
            {uninstalled.map((w) => (
              <li key={w.title} className="mt-3">
                <Button
                  className="flex items-center gap-2 w-full"
                  onClick={() => window.open(w.installUrl, '_blank')}
                  rel="noopener noreferrer"
                >
                  <img className="w-10 mr-2" src={w.logo.src} alt={w.logo.alt} />
                  Install {w.extensionName}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Button className="mt-6" onClick={onClose}>
        Close
      </Button>
    </Modal>
  );
};
