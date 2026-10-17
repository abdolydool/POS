import React from 'react';
import type { ScannedLineItem, ReceiptTotals } from '../game/registerLogic';
import type { CustomerOrder } from '../game/catalog';
import { sounds } from '../game/soundEffects';
import { Printer, CheckCircle, Scissors, ArrowRight } from 'lucide-react';

interface ReceiptPrinterProps {
  receiptData: {
    items: ScannedLineItem[];
    totals: ReceiptTotals;
    customer: CustomerOrder;
    payment: {
      cardType: string;
      last4: string;
      approvalCode: string;
      method: string;
    };
    timestamp: Date;
    transactionId: string;
  };
  onTearOffAndNext: () => void;
}

export const ReceiptPrinter: React.FC<ReceiptPrinterProps> = ({
  receiptData,
  onTearOffAndNext,
}) => {
  const { items, totals, customer, payment, timestamp, transactionId } = receiptData;

  const handleTearOff = () => {
    sounds.playPrinterFeed();
    sounds.playCashDrawerDing();
    onTearOffAndNext();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col items-center gap-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-display">
            Thermal Receipt Printer
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>PRINT COMPLETE</span>
        </div>
      </div>

      {/* Printer Mechanism Mouth & Dispensed Paper */}
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Metal Printer Slot */}
        <div className="w-full h-3 bg-slate-800 border-2 border-slate-700 rounded-t-lg shadow-inner" />

        {/* The Paper Receipt */}
        <div className="w-full receipt-paper text-slate-900 p-5 shadow-2xl border-x border-b border-slate-300 font-mono text-xs flex flex-col gap-2">
          {/* Store Header */}
          <div className="text-center border-b border-dashed border-slate-400 pb-3">
            <h1 className="text-base font-bold tracking-tight uppercase">
              SuperScan Express
            </h1>
            <p className="text-[11px] text-slate-600">Store #0402 · Register 04</p>
            <p className="text-[10px] text-slate-500">100 Market Way, Suite 1A</p>
            <div className="mt-2 text-[10px] text-slate-600 flex justify-between">
              <span>TX: {transactionId}</span>
              <span>{timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="text-[10px] text-slate-600 text-left">
              <span>Customer: {customer.customerName}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-2 border-b border-dashed border-slate-400 flex flex-col gap-1.5">
            {items.map((line) => (
              <div key={line.scanId} className="flex justify-between items-start text-[11px]">
                <div className="flex-1 pr-2">
                  <span className="font-semibold block">{line.item.name}</span>
                  <span className="text-[10px] text-slate-600">
                    {line.item.isWeighted
                      ? `${line.weight} lbs @ $${line.unitPrice.toFixed(2)}/lb`
                      : `${line.quantity} @ $${line.unitPrice.toFixed(2)}`}
                    {line.item.pluCode ? ` (PLU #${line.item.pluCode})` : ''}
                  </span>
                </div>
                <span className="font-bold tabular-nums font-mono-numbers">
                  ${line.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-1 border-b border-dashed border-slate-400 flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between">
              <span>SUBTOTAL ({totals.itemCount} items)</span>
              <span className="tabular-nums font-mono-numbers">${totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.discountSavings > 0 && (
              <div className="flex justify-between font-semibold text-emerald-800">
                <span>DISCOUNT SAVINGS</span>
                <span className="tabular-nums font-mono-numbers">-${totals.discountSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>TAX (8.25%)</span>
              <span className="tabular-nums font-mono-numbers">${totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
              <span>TOTAL DUE</span>
              <span className="tabular-nums font-mono-numbers">${totals.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Card Payment Info */}
          <div className="py-2 border-b border-dashed border-slate-400 text-[10px] text-slate-700 flex flex-col gap-0.5">
            <div className="flex justify-between">
              <span>METHOD:</span>
              <span className="uppercase font-semibold">{payment.method.toUpperCase()} ({payment.cardType})</span>
            </div>
            <div className="flex justify-between">
              <span>ACCOUNT:</span>
              <span>•••• •••• •••• {payment.last4}</span>
            </div>
            <div className="flex justify-between">
              <span>AUTH CODE:</span>
              <span className="font-bold font-mono">{payment.approvalCode}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold mt-0.5">
              <span>STATUS:</span>
              <span>APPROVED - THANK YOU</span>
            </div>
          </div>

          {/* Footer Barcode */}
          <div className="text-center pt-2 flex flex-col items-center">
            <div className="tracking-widest font-mono text-sm font-bold bg-slate-200 px-3 py-1 rounded">
              ||| |||| || ||||| ||| ||||
            </div>
            <span className="text-[9px] text-slate-500 mt-1">
              HAVE A WONDERFUL DAY!
            </span>
          </div>

          {/* Paper Sawtooth Edge (Visual Receipt Cut) */}
          <div
            className="w-full h-3 mt-2 bg-repeat-x"
            style={{
              backgroundImage: `radial-gradient(circle, transparent 4px, #fdfcf7 4px)`,
              backgroundSize: '12px 8px',
              backgroundPosition: '0 -4px',
            }}
          />
        </div>

        {/* Tear Off CTA Button */}
        <button
          type="button"
          onClick={handleTearOff}
          className="mt-4 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all font-display"
        >
          <Scissors className="w-4 h-4" />
          <span>TEAR OFF RECEIPT & CALL NEXT CUSTOMER</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
