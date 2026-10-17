import React, { useState } from 'react';
import type { ScannedLineItem, ReceiptTotals } from '../game/registerLogic';
import { sounds } from '../game/soundEffects';
import { evaluateRegisterCalculator } from '../game/registerLogic';
import {
  CreditCard,
  Calculator as CalcIcon,
  Trash2,
  Tag,
  Receipt,
  Check,
  Percent,
} from 'lucide-react';

interface RegisterCalculatorProps {
  scannedItems: ScannedLineItem[];
  totals: ReceiptTotals;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  onVoidLineItem: (scanId: string) => void;
  onClearRegister: () => void;
  onProceedToCardPayment: () => void;
  activeMultiplier: number;
  onSetMultiplier: (multiplier: number) => void;
}

export const RegisterCalculator: React.FC<RegisterCalculatorProps> = ({
  scannedItems,
  totals,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onVoidLineItem,
  onClearRegister,
  onProceedToCardPayment,
  activeMultiplier,
  onSetMultiplier,
}) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'calculator'>('journal');
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const handleCalcInput = (char: string) => {
    sounds.playKeyClick();
    if (calcDisplay === '0' && !isNaN(Number(char))) {
      setCalcDisplay(char);
    } else {
      setCalcDisplay((prev) => prev + char);
    }
  };

  const handleCalcClear = () => {
    sounds.playKeyClick();
    setCalcDisplay('0');
  };

  const handleCalcEquals = () => {
    sounds.playKeyClick();
    const evaluated = evaluateRegisterCalculator(calcDisplay);
    if (evaluated.success) {
      setCalcDisplay(String(evaluated.result));
    } else {
      sounds.playError();
      setCalcDisplay('Error');
      setTimeout(() => setCalcDisplay('0'), 1500);
    }
  };

  const handleSetQuantityFromCalc = () => {
    sounds.playKeyClick();
    const qty = parseInt(calcDisplay, 10);
    if (!isNaN(qty) && qty > 0 && qty <= 99) {
      onSetMultiplier(qty);
      setCalcDisplay('0');
      setActiveTab('journal');
    } else {
      sounds.playError();
    }
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    sounds.playKeyClick();
    const success = onApplyCoupon(couponInput.trim());
    if (success) {
      setCouponMessage(`Coupon "${couponInput.toUpperCase()}" applied!`);
      setCouponInput('');
    } else {
      sounds.playError();
      setCouponMessage('Invalid coupon code. Try SAVE10, SUPER20, or VIP5OFF.');
    }
    setTimeout(() => setCouponMessage(null), 3500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* POS Terminal Upper Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-display">
            Register Terminal #04
          </h2>
        </div>

        {/* View Switcher: Journal vs Calculator */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              setActiveTab('journal');
            }}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === 'journal'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tape ({scannedItems.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              setActiveTab('calculator');
            }}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
              activeTab === 'calculator'
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalcIcon className="w-3 h-3 text-sky-400" />
            <span>Calculator</span>
          </button>
        </div>
      </div>

      {/* Active Multiplier Notification */}
      {activeMultiplier > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-sky-950/70 border border-sky-800/80 text-sky-300 text-xs font-mono">
          <span>Active Next Item Multiplier: <strong>{activeMultiplier}×</strong></span>
          <button
            type="button"
            onClick={() => onSetMultiplier(1)}
            className="text-[10px] text-sky-400 hover:text-sky-200 underline"
          >
            Reset to 1×
          </button>
        </div>
      )}

      {/* Main Tab Area */}
      {activeTab === 'journal' ? (
        <div className="flex flex-col gap-2">
          {/* Virtual Receipt Paper Roll / Items List */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 min-h-[220px] max-h-[260px] overflow-y-auto font-mono text-xs text-slate-300 flex flex-col gap-1.5 scrollbar-thin">
            {scannedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full my-auto text-slate-500 py-6">
                <span>REGISTER JOURNAL EMPTY</span>
                <span className="text-[10px]">Scan items from the belt to begin</span>
              </div>
            ) : (
              scannedItems.map((line, idx) => (
                <div
                  key={line.scanId}
                  className="flex items-center justify-between py-1 border-b border-slate-900 group hover:bg-slate-900/60 px-1 rounded transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                    <span className="text-sm">{line.item.emoji}</span>
                    <div className="truncate">
                      <span className="text-slate-100 font-medium truncate block">
                        {line.item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {line.item.isWeighted
                          ? `${line.weight} lbs @ $${line.unitPrice.toFixed(2)}/lb`
                          : `${line.quantity} × $${line.unitPrice.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-100 font-bold font-mono-numbers">
                      ${line.totalPrice.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playKeyClick();
                        onVoidLineItem(line.scanId);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Void this line item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coupon Input & Discount Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {appliedCoupon ? (
              <div className="flex items-center justify-between w-full bg-emerald-950/50 border border-emerald-800/80 px-2.5 py-1.5 rounded-lg text-emerald-300 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Coupon {appliedCoupon} Active</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playKeyClick();
                    onRemoveCoupon();
                  }}
                  className="text-[10px] text-emerald-400 hover:text-rose-400 underline font-mono"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex gap-1.5 w-full">
                <div className="relative flex-1">
                  <Tag className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code (SAVE10, SUPER20, VIP5OFF)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-7 pr-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 font-mono tracking-wider focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {couponMessage && (
            <p className="text-[11px] text-emerald-400 font-mono">{couponMessage}</p>
          )}

          {/* Totals Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col gap-1 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Items Total ({totals.itemCount})</span>
              <span className="font-mono-numbers">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountSavings > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Discounts & Savings</span>
                <span className="font-mono-numbers">-${totals.discountSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-400">
              <span>Estimated Tax (8.25%)</span>
              <span className="font-mono-numbers">${totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-1.5 mt-1 flex items-center justify-between text-base font-bold text-slate-100">
              <span className="font-display">TOTAL DUE</span>
              <span className="text-emerald-400 font-mono-numbers text-xl">
                ${totals.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Row: Void all / Proceed with Card */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (scannedItems.length > 0) {
                  sounds.playKeyClick();
                  onClearRegister();
                }
              }}
              disabled={scannedItems.length === 0}
              className="px-3 py-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear Cart
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playKeyClick();
                onProceedToCardPayment();
              }}
              disabled={scannedItems.length === 0}
              className="flex-1 py-2.5 px-4 text-sm font-bold bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg shadow-lg hover:shadow-sky-500/20 flex items-center justify-center gap-2 transition-all font-display"
            >
              <CreditCard className="w-4 h-4" />
              <span>PROCEED WITH CARD PAYMENT (${totals.total.toFixed(2)})</span>
            </button>
          </div>
        </div>
      ) : (
        /* POS Calculator View */
        <div className="flex flex-col gap-3">
          {/* Calculator Screen */}
          <div className="bg-slate-950 border-2 border-slate-700 rounded-lg p-3 text-right shadow-inner">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">
              POS Arithmetic & Cash Tender
            </span>
            <span className="text-2xl font-bold font-mono-numbers text-sky-400 tracking-wider">
              {calcDisplay}
            </span>
          </div>

          {/* Quick Register Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSetQuantityFromCalc}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-sky-950/80 hover:bg-sky-900 border border-sky-800/80 rounded-lg text-sky-300 text-xs font-medium transition-colors"
            >
              <span>Set as Item Multiplier (×Qty)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playKeyClick();
                // If calculator has amount tendered, compute change
                const tendered = parseFloat(calcDisplay);
                if (!isNaN(tendered) && tendered >= totals.total) {
                  const change = (tendered - totals.total).toFixed(2);
                  setCalcDisplay(`Change: $${change}`);
                } else {
                  setCalcDisplay('Enter $ Tendered');
                  setTimeout(() => setCalcDisplay('0'), 1500);
                }
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-xs font-medium transition-colors"
            >
              <span>Calc Change Due</span>
            </button>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2">
            {['7', '8', '9', '÷'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcInput(k === '÷' ? '/' : k)}
                className={`py-2 rounded-lg font-mono text-sm font-semibold transition-colors ${
                  k === '÷'
                    ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                }`}
              >
                {k}
              </button>
            ))}

            {['4', '5', '6', '×'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcInput(k === '×' ? '*' : k)}
                className={`py-2 rounded-lg font-mono text-sm font-semibold transition-colors ${
                  k === '×'
                    ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                }`}
              >
                {k}
              </button>
            ))}

            {['1', '2', '3', '-'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcInput(k)}
                className={`py-2 rounded-lg font-mono text-sm font-semibold transition-colors ${
                  k === '-'
                    ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                }`}
              >
                {k}
              </button>
            ))}

            {['0', '00', '.', '+'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleCalcInput(k)}
                className={`py-2 rounded-lg font-mono text-sm font-semibold transition-colors ${
                  k === '+'
                    ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                }`}
              >
                {k}
              </button>
            ))}

            <button
              type="button"
              onClick={handleCalcClear}
              className="py-2 rounded-lg font-mono text-sm font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors col-span-2"
            >
              CLEAR
            </button>

            <button
              type="button"
              onClick={handleCalcEquals}
              className="py-2 rounded-lg font-mono text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors col-span-2 shadow"
            >
              =
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
