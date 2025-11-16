
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Wallet, Network, NodeStatus, ToastMessage } from './types';
import { nexaiService } from './services/nexaiService';
import { WalletIcon, CopyIcon, SendIcon, KeyIcon, Spinner, CheckCircleIcon, XCircleIcon } from './components/icons';

// --- Reusable UI Components (defined outside App to prevent re-renders) ---

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

export default function App() {
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [newlyGeneratedWallet, setNewlyGeneratedWallet] = useState<Wallet | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [network, setNetwork] = useState<Network>('testnet');
    const [nodeStatus, setNodeStatus] = useState<NodeStatus>('Offline');
    const [nodeReward, setNodeReward] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    // Manage node rewards
    useEffect(() => {
        // FIX: `setInterval` returns a `number` in browser environments, not a `NodeJS.Timeout` object.
        let interval: number;
        if (nodeStatus === 'Online') {
            interval = setInterval(() => {
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
    }, [wallet, network]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // Toast notification manager
    const addToast = (message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };
    
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
                <p>&copy; {new Date().getFullYear()} NEXai. All rights reserved.</p>
            </footer>
        </div>
    );
}

// Add keyframes for animations in tailwind config if possible, or a style tag in index.html
// Here we'll just rely on some simple class-based transitions from Tailwind.
// For custom animations, we can add this to index.html
/*
<style>
@keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes fade-in-right { 0% { opacity: 0; transform: translateX(20px); } 100% { opacity: 1; transform: translateX(0); } }
.animate-fade-in { animation: fade-in 0.5s ease-in-out; }
.animate-fade-in-up { animation: fade-in-up 0.5s ease-in-out; }
.animate-fade-in-right { animation: fade-in-right 0.5s ease-in-out; }
</style>
*/
// The required animations are simple enough to be handled by adding the styles directly to index.html,
// but for a cleaner approach, they are simulated here with Tailwind's transition classes.
// The provided CSS keyframes would be the ideal way.
