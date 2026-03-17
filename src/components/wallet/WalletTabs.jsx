import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownLeft, ArrowUpRight, Send, LogOut, History } from 'lucide-react';
import WalletAssets from './WalletAssets';
import WalletReceive from './WalletReceive';
import WalletSend from './WalletSend';
import WalletWithdraw from './WalletWithdraw';
import WalletActivity from './WalletActivity';

export default function WalletTabs({ walletAddress, balances }) {
  const [activeTab, setActiveTab] = useState('assets');

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-900/40 border border-slate-700/50 rounded-xl p-1">
          <TabsTrigger value="assets" className="text-xs sm:text-sm flex items-center gap-1">
            <span className="hidden sm:inline">Assets</span>
            <span className="sm:hidden">💰</span>
          </TabsTrigger>
          <TabsTrigger value="receive" className="text-xs sm:text-sm flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Receive</span>
          </TabsTrigger>
          <TabsTrigger value="send" className="text-xs sm:text-sm flex items-center gap-1">
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="text-xs sm:text-sm flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Withdraw</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm flex items-center gap-1">
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-4">
          <WalletAssets balances={balances} />
        </TabsContent>

        <TabsContent value="receive" className="mt-4">
          <WalletReceive walletAddress={walletAddress} />
        </TabsContent>

        <TabsContent value="send" className="mt-4">
          <WalletSend walletAddress={walletAddress} balances={balances} />
        </TabsContent>

        <TabsContent value="withdraw" className="mt-4">
          <WalletWithdraw walletAddress={walletAddress} balances={balances} />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <WalletActivity walletAddress={walletAddress} />
        </TabsContent>
      </Tabs>
    </div>
  );
}