import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wallet, Loader2, ShieldCheck } from 'lucide-react';
import { loginWithMetaMask } from '../blockchain/auth';
import { toast } from 'sonner';

interface LoginProps {
    onLoginSuccess: (address: string) => void;
    onConnectWallet: () => Promise<string>;
    walletConnected: boolean;
}

export function Login({ onLoginSuccess, onConnectWallet }: LoginProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setIsLoading(true);

            // 1. Ensure wallet is connected first
            await onConnectWallet();

            // 2. Perform cryptographic login
            const { address, isAuthenticated } = await loginWithMetaMask();

            if (isAuthenticated && address) {
                toast.success("Successfully logged in!");
                onLoginSuccess(address);
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md bg-slate-950 border-slate-800 text-slate-100 shadow-2xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

                <CardHeader className="space-y-1 relative z-10">
                    <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-blue-500/20">
                        <ShieldCheck className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Login to BlockFund
                    </CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        Secure authentication using your Web3 Wallet
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 relative z-10">
                    <div className="text-center space-y-4 py-4">
                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 text-sm text-slate-400">
                            <p>
                                We use cryptographic signatures to verify your identity.
                                No password or email required.
                            </p>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11 transition-all"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wallet className="mr-2 h-4 w-4" />
                        )}
                        {isLoading ? 'Waiting for signature...' : 'Connect & Sign'}
                    </Button>

                    <p className="text-xs text-center text-slate-500">
                        By connecting, you agree to sign a message verifying your ownership of the wallet.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
