import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowDownLeft, ArrowUpRight, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function WalletActivity({ walletAddress }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, [walletAddress]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await base44.entities.Transaction.filter(
        { wallet_address: walletAddress },
        '-created_date',
        50
      );
      setTransactions(result || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Unable to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  const getIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case 'transfer':
        return <Send className="w-4 h-4 text-blue-400" />;
      default:
        return <Send className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getAmountColor = (type) => {
    return type === 'deposit' || type === 'transfer' ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-4 rounded-2xl text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={fetchTransactions}
          className="mt-3 text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-white transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <Send className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
        <p className="text-slate-400 text-sm">No transactions yet</p>
        <p className="text-slate-500 text-xs mt-1">Your deposits and withdrawals will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'deposit', 'withdrawal', 'transfer'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filter === type
                ? 'bg-teal-500/20 border border-teal-500 text-teal-400'
                : 'bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filteredTransactions.map((tx) => (
          <div
            key={tx.id}
            className="glass-card p-3 rounded-xl flex items-center justify-between hover:bg-slate-800/30 transition-all"
          >
            {/* Left: Icon + Details */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center flex-shrink-0">
                {getIcon(tx.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white text-sm capitalize">
                    {tx.type === 'withdrawal' ? 'Withdraw' : tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </p>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(tx.status)}
                    <span className={`text-xs capitalize ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tx.network && `${tx.network.charAt(0).toUpperCase() + tx.network.slice(1)}`}
                  {tx.timestamp && ` • ${format(new Date(tx.timestamp), 'MMM dd, HH:mm')}`}
                </p>
              </div>
            </div>

            {/* Right: Amount */}
            <div className="text-right flex-shrink-0">
              <p className={`font-semibold text-sm ${getAmountColor(tx.type)}`}>
                {tx.type === 'deposit' || tx.type === 'transfer' ? '+' : '-'}{tx.amount} {tx.asset}
              </p>
              {tx.fee && (
                <p className="text-xs text-slate-500">Fee: {tx.fee} {tx.asset}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredTransactions.length >= 50 && (
        <button
          onClick={fetchTransactions}
          className="w-full py-2 text-sm font-semibold text-teal-400 hover:text-teal-300 transition-all"
        >
          Load More
        </button>
      )}
    </div>
  );
}