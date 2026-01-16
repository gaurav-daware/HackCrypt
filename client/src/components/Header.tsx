import { Wallet, ArrowLeft, Coins, TrendingUp, History, Plus } from 'lucide-react';

type HeaderProps = {
  view: 'explore' | 'create' | 'dashboard' | 'history';
  setView: (view: 'explore' | 'create' | 'dashboard' | 'history') => void;
  walletConnected: boolean;
  setWalletConnected: () => void;
  userAddress: string;
  onBack: () => void;
  showBack: boolean;
};

export function Header({ view, setView, walletConnected, setWalletConnected, userAddress, onBack, showBack }: HeaderProps) {
  return (
    <header className="border-b border-blue-900/30 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BlockFund</h1>
                <p className="text-xs text-blue-400">Decentralized Crowdfunding</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setView('explore')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                view === 'explore'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Explore
            </button>
            <button
              onClick={() => setView('create')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                view === 'create'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                view === 'dashboard'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Coins className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                view === 'history'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </nav>
          
          <button
            onClick={setWalletConnected}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              walletConnected
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {walletConnected ? (
              <span className="hidden sm:inline">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
            ) : (
              <span>Connect Wallet</span>
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => setView('explore')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
              view === 'explore'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Explore
          </button>
          <button
            onClick={() => setView('create')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
              view === 'create'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
          <button
            onClick={() => setView('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
              view === 'dashboard'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Coins className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-sm whitespace-nowrap ${
              view === 'history'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </nav>
      </div>
    </header>
  );
}
