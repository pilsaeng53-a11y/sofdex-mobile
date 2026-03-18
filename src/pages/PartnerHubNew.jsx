import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/shared/WalletContext';
import { base44 } from '@/api/base44Client';
import { FEE_POLICY, validatePartnerRates } from '@/services/FeeEngine';
import {
  Users, TrendingUp, DollarSign, ChevronRight, ChevronDown,
  Shield, Zap, AlertCircle, CheckCircle, ArrowDownToLine, Settings
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = '#00d4aa', icon: IconComp }) {
  return (
    <div className="glass-card rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-2">
        {IconComp && <IconComp className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />}
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[8px] text-slate-500">{sub}</p>}
    </div>
  );
}

function PartnerTreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 14;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-[#151c2e] rounded-lg transition-all cursor-pointer"
        style={{ marginLeft: indent }}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {hasChildren ? (
            open ? <ChevronDown className="w-3 h-3 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
          ) : (
            <div className="w-3 h-3 flex-shrink-0" />
          )}
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#3b82f6] flex items-center justify-center flex-shrink-0">
            <span className="text-[7px] font-bold text-white">{(node.display_name || 'P').charAt(0).toUpperCase()}</span>
          </div>
          <span className="text-[11px] font-semibold text-white truncate">{node.display_name || node.wallet_address?.slice(0, 8) + '…'}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[9px] text-[#00d4aa] font-bold">{(node.rate * 100).toFixed(0)}%</span>
          <span className="text-[8px] text-slate-500">${(node.total_volume / 1000).toFixed(1)}K vol</span>
          <span className="text-[8px] text-green-400">${node.accrued_balance?.toFixed(2)}</span>
        </div>
      </div>
      {open && hasChildren && (
        <div>
          {node.children.map(child => (
            <PartnerTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PartnerHubNew() {
  const { isConnected, address, requireWallet } = useWallet();
  const [myNode, setMyNode] = useState(null);
  const [children, setChildren] = useState([]);
  const [accruals, setAccruals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rateInput, setRateInput] = useState('');
  const [childWallet, setChildWallet] = useState('');
  const [rateError, setRateError] = useState('');
  const [rateSuccess, setRateSuccess] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) { setLoading(false); return; }
    loadPartnerData();
  }, [isConnected, address]);

  async function loadPartnerData() {
    setLoading(true);
    try {
      const [nodes, accrualsData] = await Promise.all([
        base44.entities.PartnerNode.filter({ user_id: address }),
        base44.entities.FeeAccrual.filter({ recipient_id: address }, '-created_date', 50),
      ]);
      if (nodes.length > 0) {
        const node = nodes[0];
        setMyNode(node);
        // Load children
        const childNodes = await base44.entities.PartnerNode.filter({ parent_id: address });
        // Attach children for tree view
        const childrenWithGrandkids = await Promise.all(
          childNodes.map(async (c) => {
            const grandkids = await base44.entities.PartnerNode.filter({ parent_id: c.user_id });
            return { ...c, children: grandkids.map(g => ({ ...g, children: [] })) };
          })
        );
        setChildren(childrenWithGrandkids);
      }
      setAccruals(accrualsData);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function handleWithdraw() {
    if (!myNode || myNode.accrued_balance < FEE_POLICY.MIN_PAYOUT_USD) return;
    setWithdrawing(true);
    try {
      await base44.entities.PartnerNode.update(myNode.id, {
        total_withdrawn: (myNode.total_withdrawn || 0) + myNode.accrued_balance,
        accrued_balance: 0,
      });
      setMyNode(n => ({ ...n, total_withdrawn: (n.total_withdrawn || 0) + n.accrued_balance, accrued_balance: 0 }));
    } catch (e) { console.error(e); }
    setWithdrawing(false);
  }

  async function handleAssignChild(e) {
    e.preventDefault();
    setRateError('');
    setRateSuccess('');
    const rate = parseFloat(rateInput) / 100;
    if (!childWallet || isNaN(rate)) { setRateError('Fill in wallet and rate.'); return; }
    if (myNode && rate > myNode.max_child_rate) {
      setRateError(`Rate cannot exceed your max child rate (${(myNode.max_child_rate * 100).toFixed(0)}%)`);
      return;
    }
    const validation = validatePartnerRates([
      { id: address, rate: myNode?.rate || 0.6 },
      { id: childWallet, rate },
    ]);
    if (!validation.valid) { setRateError(validation.error); return; }

    try {
      await base44.entities.PartnerNode.create({
        user_id: childWallet,
        wallet_address: childWallet,
        display_name: childWallet.slice(0, 8) + '…',
        parent_id: address,
        rate,
        max_child_rate: rate,
        status: 'active',
        accrued_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        total_volume: 0,
      });
      setRateSuccess('Sub-partner assigned successfully!');
      setChildWallet('');
      setRateInput('');
      loadPartnerData();
    } catch (err) {
      setRateError('Failed to assign sub-partner.');
    }
  }

  // ─── Not connected ─────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="px-4 py-10 max-w-lg mx-auto text-center space-y-4">
        <Shield className="w-12 h-12 text-[#00d4aa] mx-auto" />
        <h2 className="text-xl font-bold text-white">Partner Hub</h2>
        <p className="text-sm text-slate-400">Connect your wallet to access the Partner Hub</p>
        <button onClick={() => requireWallet()} className="btn-solana px-6 py-3 text-sm font-bold rounded-xl">
          Connect Wallet
        </button>
      </div>
    );
  }

  // ─── Not a partner yet ─────────────────────────────────────────────────────
  if (!loading && !myNode) {
    return (
      <div className="px-4 py-10 max-w-lg mx-auto text-center space-y-4">
        <Users className="w-12 h-12 text-[#8b5cf6] mx-auto" />
        <h2 className="text-xl font-bold text-white">Not a Partner Yet</h2>
        <p className="text-sm text-slate-400">Apply via the Sales Partner program to get approved and access commission features.</p>
        <a href="/FuturesSalesPartner" className="inline-block btn-purple px-6 py-3 text-sm font-bold rounded-xl">
          Apply Now →
        </a>
      </div>
    );
  }

  const totalEarnings = accruals.filter(a => a.status === 'settled').reduce((s, a) => s + a.amount, 0);
  const pendingEarnings = accruals.filter(a => a.status === 'pending').reduce((s, a) => s + a.amount, 0);
  const treeNode = myNode ? { ...myNode, children } : null;

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00d4aa] to-[#3b82f6] bg-clip-text text-transparent">
          Partner Hub
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Rate: <span className="text-[#00d4aa] font-bold">{myNode ? (myNode.rate * 100).toFixed(0) : '—'}%</span>
          {' · '}Tier: <span className="text-[#8b5cf6] font-bold capitalize">{myNode?.tier || '—'}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Accrued Balance" value={`$${(myNode?.accrued_balance || 0).toFixed(2)}`} sub="Ready to withdraw" color="#00d4aa" icon={DollarSign} />
        <StatCard label="Total Earned" value={`$${(myNode?.total_earned || 0).toFixed(2)}`} sub="All time" color="#22c55e" icon={TrendingUp} />
        <StatCard label="Total Volume" value={`$${((myNode?.total_volume || 0) / 1000).toFixed(1)}K`} sub="Your subtree" color="#3b82f6" icon={Zap} />
        <StatCard label="Sub-Partners" value={children.length} sub="Direct children" color="#8b5cf6" icon={Users} />
      </div>

      {/* Withdraw */}
      <div className="glass-card rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-white">Withdrawable Balance</p>
          <p className="text-2xl font-bold text-[#00d4aa]">${(myNode?.accrued_balance || 0).toFixed(2)}</p>
          <p className="text-[9px] text-slate-500">Min payout: ${FEE_POLICY.MIN_PAYOUT_USD}</p>
        </div>
        <button
          onClick={handleWithdraw}
          disabled={withdrawing || !myNode || (myNode?.accrued_balance || 0) < FEE_POLICY.MIN_PAYOUT_USD}
          className="btn-solana px-5 py-2.5 text-xs font-bold rounded-xl disabled:opacity-40 flex items-center gap-1.5"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          {withdrawing ? 'Processing…' : 'Withdraw'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card rounded-xl p-1">
        {['overview', 'tree', 'accruals', 'assign'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all ${
              activeTab === tab ? 'bg-[#00d4aa]/20 text-[#00d4aa]' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="glass-card rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee Distribution Policy</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Normal user (no partner):</span>
                <span className="text-white font-bold">Exchange 70% / Referral 30%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Partner user:</span>
                <span className="text-white font-bold">Partner 60% / Exchange 40%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Your rate:</span>
                <span className="text-[#00d4aa] font-bold">{(myNode?.rate * 100 || 0).toFixed(0)}% of partner pool</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Max child rate you can grant:</span>
                <span className="text-[#8b5cf6] font-bold">{(myNode?.max_child_rate * 100 || 0).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commission Cascade Example</p>
            <div className="space-y-1 text-[9px] text-slate-400">
              <p>You (60%) → assign Child1 (50%)</p>
              <p className="pl-4 text-slate-500">→ You keep: 10% | Child1 gets: 50%</p>
              <p className="pl-4 text-slate-500">→ Child1 can assign Child2 up to 50%</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tree */}
      {activeTab === 'tree' && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.06)]">
            <p className="text-xs font-bold text-slate-400 uppercase">Partner Hierarchy</p>
          </div>
          <div className="p-3">
            {loading ? (
              <p className="text-xs text-slate-500 text-center py-4">Loading…</p>
            ) : treeNode ? (
              <PartnerTreeNode node={treeNode} depth={0} />
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No partner data.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab: Accruals */}
      {activeTab === 'accruals' && (
        <div className="space-y-2">
          {accruals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No accrual records yet.</p>
          ) : (
            accruals.map(a => (
              <div key={a.id} className="glass-card rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-white">{a.trade_symbol || 'Trade'}</p>
                  <p className="text-[8px] text-slate-500">{a.role} · {new Date(a.created_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-400">+${a.amount?.toFixed(4)}</p>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
                    a.status === 'settled' ? 'bg-green-500/10 text-green-400' :
                    a.status === 'reversed' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>{a.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Assign Sub-Partner */}
      {activeTab === 'assign' && (
        <div className="space-y-3">
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#8b5cf6]" />
              Assign Sub-Partner
            </p>
            <form onSubmit={handleAssignChild} className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Sub-Partner Wallet Address</label>
                <input
                  value={childWallet}
                  onChange={e => setChildWallet(e.target.value)}
                  placeholder="Solana wallet address"
                  className="w-full bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                  Commission Rate (max: {(myNode?.max_child_rate * 100 || 0).toFixed(0)}%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={myNode?.max_child_rate * 100 || 60}
                    value={rateInput}
                    onChange={e => setRateInput(e.target.value)}
                    placeholder="e.g. 50"
                    className="flex-1 bg-[#1a2340] border border-[rgba(148,163,184,0.1)] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-[#00d4aa]/30 outline-none"
                  />
                  <span className="text-sm font-bold text-slate-400">%</span>
                </div>
              </div>
              {rateError && (
                <div className="flex items-center gap-2 text-[10px] text-red-400">
                  <AlertCircle className="w-3 h-3" /> {rateError}
                </div>
              )}
              {rateSuccess && (
                <div className="flex items-center gap-2 text-[10px] text-green-400">
                  <CheckCircle className="w-3 h-3" /> {rateSuccess}
                </div>
              )}
              <button type="submit" className="w-full btn-solana py-2.5 text-xs font-bold rounded-lg">
                Assign Sub-Partner
              </button>
            </form>
          </div>

          <div className="glass-card rounded-xl p-4">
            <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Cascade Rule</p>
            <ul className="space-y-1 text-[9px] text-slate-400">
              <li>• Child rate must not exceed your rate</li>
              <li>• Chain must not exceed 100% total</li>
              <li>• You keep the difference between your rate and child's rate</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}