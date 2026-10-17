import React from 'react';
import type { CustomerOrder } from '../game/catalog';
import { sounds } from '../game/soundEffects';
import { Volume2, VolumeX, Sparkles, User, ShoppingCart, Award } from 'lucide-react';

interface CustomerHeaderProps {
  currentCustomer: CustomerOrder;
  customerIndex: number;
  totalCustomers: number;
  score: number;
  gameMode: 'story' | 'rush' | 'sandbox';
  onChangeMode: (mode: 'story' | 'rush' | 'sandbox') => void;
  onNextCustomerManual: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  currentCustomer,
  customerIndex,
  totalCustomers,
  score,
  gameMode,
  onChangeMode,
  onNextCustomerManual,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Customer Avatar & Dialogue */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 flex items-center justify-center text-3xl shadow shrink-0 relative">
          {currentCustomer.avatar}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-950 font-mono">
            {customerIndex + 1}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 font-display">
              {currentCustomer.customerName}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Customer {customerIndex + 1} of {totalCustomers}
            </span>
          </div>

          {/* Dialogue Speech Bubble */}
          <div className="mt-1 bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-sky-200 shadow-inner flex items-center gap-2">
            <span className="text-slate-400 italic font-sans text-xs">
              "{currentCustomer.dialogue}"
            </span>
            {currentCustomer.couponCode && (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0">
                Coupon: {currentCustomer.couponCode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cashier Score & Game Mode Controls */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {/* Cashier Score & Star */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <div className="text-right">
            <span className="block text-[9px] uppercase font-mono text-slate-400">Cashier Rating</span>
            <span className="text-xs font-bold text-amber-400 font-mono-numbers">
              {score} XP
            </span>
          </div>
        </div>

        {/* Mode Selector Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              onChangeMode('story');
            }}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              gameMode === 'story'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Shift Mode
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              onChangeMode('sandbox');
            }}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              gameMode === 'sandbox'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Free Play
          </button>
        </div>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title={isMuted ? 'Unmute audio' : 'Mute audio'}
          aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </div>
  );
};
