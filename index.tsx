
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// === From types.ts ===
interface Wallet {
  address: string;
  privateKey: string;
}
type Network = 'testnet' | 'mainnet';
type NodeStatus = 'Online' | 'Offline';
interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// === From services/nexaiService.ts ===
const randomHex = (length: number) => {
  let result = '';
  const characters = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const nexaiService = {
  generateWallet: async (): Promise<Wallet> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          address: `0x${randomHex(40)}`,
          privateKey: `0x${randomHex(64)}`,
        });
      }, 500);
    });
  },
  importWallet: async (privateKey: string): Promise<Wallet | null> => {
    if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
        return Promise.resolve(null);
    }
    return new Promise((resolve) => {
       setTimeout(() => {
        const address = `0x${randomHex(40)}`;
        resolve({ address, privateKey });
      }, 500);
    });
  },
  getBalance: async (address: string, network: string): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(parseFloat((Math.random() * 1000).toFixed(4)));
      }, 800);
    });
  },
  sendTokens: async (
    sender: Wallet,
    recipient: string,
    amount: number
  ): Promise<string> => {
    console.log(`Sending ${amount} NEXAI from ${sender.address} to ${recipient}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`0x${randomHex(64)}`);
      }, 2000);
    });
  },
};

// === From components/icons.tsx ===
const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m12 3V9m-6 3V9" />
  </svg>
);
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375v-3.375a1.125 1.125 0 00-1.125-1.125h-1.5a1.125 1.125 0 00-1.125 1.125v3.375" />
  </svg>
);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
);
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
);


// === From App.tsx ===
// --- Reusable UI Components (defined in same file to avoid imports) ---
interface CardProps {
    children: React.ReactNode;
    className?: string;
}
const Card: React.FC<CardProps> = ({ children, className }) => (
    <div className={`bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = 'primary', isLoading = false, disabled, className, ...props }, ref) => {
    const baseClasses = 'w-full font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2';
    const variantClasses = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-800 disabled:text-gray-400',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500 disabled:bg-gray-800 disabled:text-gray-500',
    };
    const disabledClasses = 'disabled:cursor-not-allowed';

    return (
        <button ref={ref} disabled={disabled || isLoading} className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`} {...props}>
            {isLoading && <Spinner className="h-5 w-5" />}
            {children}
        </button>
    );
});
interface PrivateKeyModalProps {
    wallet: Wallet;
    onClose: () => void;
}
const PrivateKeyModal: React.FC<PrivateKeyModalProps> = ({ wallet, onClose }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(wallet.privateKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md animate-fade-in-up">
                <div className="flex items-center gap-3 text-2xl font-bold text-yellow-400">
                    <KeyIcon className="h-8 w-8"/>
                    <span>Save Your Private Key</span>
                </div>
                <p className="text-red-400 bg-red-900/50 border border-red-700 rounded-lg p-3 mt-4 text-sm font-semibold">
                    Warning: This is the ONLY time you will see your private key. Store it somewhere safe and secret. If you lose it, you will lose access to your wallet forever.
                </p>
                <div className="mt-6">
                    <label className="text-gray-400 text-sm font-bold">Your Private Key</label>
                    <div className="relative mt-1">
                        <input
                            type="text"
                            readOnly
                            value={wallet.privateKey}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 pr-12 text-gray-300 font-mono text-sm"
                        />
                        <button onClick={handleCopy} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white transition-colors">
                            {copied ? <CheckCircleIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <div className="mt-6 flex items-center">
                    <input id="isSavedCheckbox" type="checkbox" checked={isSaved} onChange={() => setIsSaved(!isSaved)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="isSavedCheckbox" className="ml-2 block text-sm text-gray-300">I have saved my private key securely.</label>
                </div>
                <Button onClick={onClose} disabled={!isSaved} className="mt-6">
                    Access My Wallet
                </Button>
            </Card>
        </div>
    );
};

// --- Main App Component ---
function App() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [newlyGeneratedWallet, setNewlyGeneratedWallet] = useState<Wallet | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [network, setNetwork] = useState<Network>('testnet');
    const [nodeStatus, setNodeStatus] = useState<NodeStatus>('Offline');
    const [nodeReward, setNodeReward] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    const addToast = (message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };

    // Manage node rewards
    useEffect(() => {
        let interval: number;
        if (nodeStatus === 'Online') {
            interval = window.setInterval(() => {
                setNodeReward(prev => prev + 0.000138);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [nodeStatus]);

    // Fetch balance when wallet or network changes
    const fetchBalance = useCallback(async () => {
        if (wallet) {
            setIsLoading(prev => ({ ...prev, balance: true }));
            try {
                const newBalance = await nexaiService.getBalance(wallet.address, network);
                setBalance(newBalance);
            } catch (error) {
                addToast("Failed to fetch balance.", "error");
            } finally {
                setIsLoading(prev => ({ ...prev, balance: false }));
            }
        }
    }, [wallet, network, addToast]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    
    // --- Handlers ---
    const handleGenerateWallet = async () => {
        setIsLoading(prev => ({ ...prev, generate: true }));
        try {
            const newWallet = await nexaiService.generateWallet();
            setNewlyGeneratedWallet(newWallet);
        } catch (error) {
            addToast("Failed to generate wallet.", "error");
        } finally {
            setIsLoading(prev => ({ ...prev, generate: false }));
        }
    };
    
    const handleImportWallet = async (privateKey: string) => {
        if (!privateKey) {
            addToast("Private key cannot be empty.", "error");
            return;
        }
        setIsLoading(prev => ({ ...prev, import: true }));
        try {
            const importedWallet = await nexaiService.importWallet(privateKey);
            if(importedWallet) {
                setWallet(importedWallet);
                addToast("Wallet imported successfully!", "success");
            } else {
                addToast("Invalid private key.", "error");
            }
        } catch (error) {
            addToast("Failed to import wallet.", "error");
        } finally {
            setIsLoading(prev => ({ ...prev, import: false }));
        }
    };

    const handleAccessNewWallet = () => {
        if (newlyGeneratedWallet) {
            setWallet(newlyGeneratedWallet);
            setNewlyGeneratedWallet(null);
            addToast("Welcome to your new wallet!", "success");
        }
    };
    
    const handleSend = async (recipient: string, amountStr: string) => {
        const amount = parseFloat(amountStr);
        if (!wallet || !recipient || !amount || amount <= 0) {
            addToast("Invalid recipient or amount.", "error");
            return;
        }
        if (amount > balance) {
            addToast("Insufficient balance.", "error");
            return;
        }
        
        setIsLoading(prev => ({ ...prev, send: true }));
        try {
            const txHash = await nexaiService.sendTokens(wallet, recipient, amount);
            addToast(`Transaction sent! Hash: ${txHash.substring(0, 10)}...`, "success");
            await fetchBalance();
        } catch (error) {
            addToast("Transaction failed.", "error");
        } finally {
            setIsLoading(prev => ({ ...prev, send: false }));
        }
    };

    const handleCopyAddress = () => {
        if(wallet) {
            navigator.clipboard.writeText(wallet.address);
            addToast("Address copied to clipboard!", "success");
        }
    };
    
    const truncatedAddress = useMemo(() => {
        if (!wallet) return '';
        return `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
    }, [wallet]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
            <header className="text-center mb-8">
                 <div className="flex items-center justify-center gap-3">
                    <WalletIcon className="h-10 w-10 text-blue-400" />
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                        NEXai Wallet
                    </h1>
                </div>
            </header>

            <main className="w-full max-w-md mx-auto">
                {wallet ? (
                    // Wallet Dashboard View
                    <Card className="space-y-6 animate-fade-in">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">Address</span>
                                <select id="network" value={network} onChange={(e) => setNetwork(e.target.value as Network)} className="bg-gray-800 border-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500">
                                    <option value="testnet">Testnet</option>
                                    <option value="mainnet">Mainnet</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg">
                                <span className="font-mono text-lg text-gray-300">{truncatedAddress}</span>
                                <button onClick={handleCopyAddress} className="text-gray-400 hover:text-white transition"><CopyIcon className="h-5 w-5"/></button>
                            </div>
                        </div>
                        
                        <div>
                            <span className="text-sm text-gray-400">Balance</span>
                            <div className="text-4xl font-bold flex items-baseline gap-2">
                                {isLoading.balance ? <Spinner className="h-8 w-8 text-blue-400"/> : <span>{balance.toLocaleString()}</span>} 
                                <span className="text-2xl text-gray-400">NEXAI</span>
                            </div>
                        </div>

                        {/* Node Status Section */}
                        <div className="border-t border-gray-700 pt-6 space-y-4">
                            <h3 className="text-lg font-semibold text-center">Node Status</h3>
                            <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                                <p>Status: <span className={nodeStatus === 'Online' ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{nodeStatus}</span></p>
                                <div className="flex gap-2">
                                    <button onClick={() => setNodeStatus('Online')} disabled={nodeStatus === 'Online'} className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded disabled:bg-green-800 disabled:cursor-not-allowed">Online</button>
                                    <button onClick={() => setNodeStatus('Offline')} disabled={nodeStatus === 'Offline'} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded disabled:bg-red-800 disabled:cursor-not-allowed">Offline</button>
                                </div>
                            </div>
                             <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                                <p>Reward:</p>
                                <p className="font-mono">{nodeReward.toFixed(6)} NEXAI</p>
                            </div>
                        </div>
                        
                        {/* Send Section */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold text-center mb-4">Send NEXAI</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleSend(formData.get('recipient') as string, formData.get('amount') as string);
                                e.currentTarget.reset();
                            }} className="space-y-4">
                                <input name="recipient" type="text" placeholder="Recipient Address" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" />
                                <input name="amount" type="number" step="any" placeholder="Amount" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" />
                                <Button type="submit" isLoading={isLoading.send} disabled={isLoading.send}>
                                    <SendIcon className="h-5 w-5"/> Send
                                </Button>
                            </form>
                        </div>
                    </Card>
                ) : (
                    // Wallet Connection View
                    <Card className="space-y-6 animate-fade-in">
                        <Button onClick={handleGenerateWallet} isLoading={isLoading.generate}>
                            <KeyIcon className="h-5 w-5" /> Generate New Wallet
                        </Button>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="flex-shrink mx-4 text-gray-400">Or</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleImportWallet(new FormData(e.currentTarget).get('privateKey') as string);
                        }} className="space-y-4">
                            <input name="privateKey" type="password" placeholder="Import with Private Key" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" />
                            <Button type="submit" variant="secondary" isLoading={isLoading.import}>Import Wallet</Button>
                        </form>
                    </Card>
                )}
            </main>
            
            {/* Modal for new wallet */}
            {newlyGeneratedWallet && <PrivateKeyModal wallet={newlyGeneratedWallet} onClose={handleAccessNewWallet} />}

            {/* Toast Notifications */}
            <div className="fixed bottom-4 right-4 w-full max-w-xs space-y-3 z-50">
                {toasts.map(toast => (
                    <div key={toast.id} className={`flex items-center gap-3 w-full p-4 rounded-lg shadow-lg text-white animate-fade-in-right ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                        {toast.type === 'success' ? <CheckCircleIcon className="h-6 w-6"/> : <XCircleIcon className="h-6 w-6"/>}
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                ))}
            </div>

            <footer className="mt-8 text-center text-gray-500 text-sm">
                 <div className="flex justify-center items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} NEXai. All rights reserved.</p>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository" className="hover:text-gray-300 transition-colors">
                        <GithubIcon className="h-5 w-5" />
                    </a>
                </div>
            </footer>
        </div>
    );
}

// === Mount React App ===
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
