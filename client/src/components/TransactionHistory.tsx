import { ExternalLink, Filter, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { Contribution, Campaign } from '../App';

type TransactionHistoryProps = {
  contributions: Contribution[];
  campaigns: Campaign[];
};

export function TransactionHistory({ contributions, campaigns }: TransactionHistoryProps) {
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const getCampaignTitle = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.title || 'Unknown Campaign';
  };

  const getCampaignImage = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.imageUrl || '';
  };

  let sortedContributions = [...contributions];
  
  if (sortBy === 'date') {
    sortedContributions.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    sortedContributions.sort((a, b) => b.amount - a.amount);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
        <p className="text-slate-400">All contributions are recorded on the blockchain for complete transparency</p>
      </div>

      {/* Filters and Sort */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setFilterType('sent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'sent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              Sent
            </button>
            <button
              onClick={() => setFilterType('received')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'received'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
            >
              Received
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <p className="text-sm text-blue-400 mb-2">Total Transactions</p>
          <p className="text-3xl font-bold text-white">{contributions.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
          <p className="text-sm text-purple-400 mb-2">Total Volume</p>
          <p className="text-3xl font-bold text-white">
            {contributions.reduce((sum, c) => sum + c.amount, 0).toFixed(2)} ETH
          </p>
        </div>
        <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-6">
          <p className="text-sm text-pink-400 mb-2">Average Amount</p>
          <p className="text-3xl font-bold text-white">
            {contributions.length > 0
              ? (contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length).toFixed(3)
              : '0.00'} ETH
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Campaign</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Contributor</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {sortedContributions.length > 0 ? (
                sortedContributions.map(contribution => (
                  <tr
                    key={contribution.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCampaignImage(contribution.campaignId)}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-white font-medium text-sm line-clamp-1">
                            {getCampaignTitle(contribution.campaignId)}
                          </p>
                          {contribution.rewardTier && (
                            <p className="text-xs text-blue-400">Reward tier selected</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                        <span className="text-slate-300 text-sm">{contribution.contributor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-bold">{contribution.amount} {contribution.currency}</p>
                        <p className="text-slate-500 text-xs">≈ ${(contribution.amount * 2345).toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm">
                          {new Date(contribution.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {new Date(contribution.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`View on block explorer: ${contribution.txHash}`);
                        }}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        <span>{contribution.txHash}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                      <ArrowUpDown className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No transactions yet</h3>
                    <p className="text-slate-400">Start backing campaigns to see your transaction history</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blockchain Info */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-blue-400" />
          Blockchain Transparency
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400 mb-1">Network</p>
            <p className="text-white font-medium">Ethereum Mainnet</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">All transactions are</p>
            <p className="text-white font-medium">Publicly verifiable</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">Data storage</p>
            <p className="text-white font-medium">Immutable on-chain</p>
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-4">
          Every contribution is recorded on the Ethereum blockchain, providing permanent, tamper-proof records that anyone can verify. Click any transaction hash to view it on a block explorer.
        </p>
      </div>
    </div>
  );
}
