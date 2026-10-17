import React from 'react';
import { X, Search, BookOpen, Tag } from 'lucide-react';
import { sounds } from '../game/soundEffects';

interface PluCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlu: (code: string) => void;
}

export const PluCheatSheetModal: React.FC<PluCheatSheetModalProps> = ({
  isOpen,
  onClose,
  onSelectPlu,
}) => {
  if (!isOpen) return null;

  const codes = [
    { code: '4011', name: 'Bananas (Yellow/Cavendish)', emoji: '🍌', price: '$0.69/lb', cat: 'Produce' },
    { code: '4173', name: 'Honeycrisp Apples', emoji: '🍎', price: '$1.99/lb', cat: 'Produce' },
    { code: '4046', name: 'Hass Avocado', emoji: '🥑', price: '$1.29 each', cat: 'Produce' },
    { code: '4060', name: 'Broccoli Crowns', emoji: '🥦', price: '$1.89/lb', cat: 'Produce' },
    { code: '4065', name: 'Green Bell Pepper', emoji: '🫑', price: '$0.89 each', cat: 'Produce' },
    { code: '4053', name: 'Meyer Lemons', emoji: '🍋', price: '$0.65 each', cat: 'Produce' },
  ];

  const coupons = [
    { code: 'SAVE10', discount: '10% Off Entire Order', desc: 'Marcus Torres regular perk' },
    { code: 'SUPER20', discount: '20% Off Storewide Promo', desc: 'Weekend manager special' },
    { code: 'VIP5OFF', discount: '$5.00 Off Family Cart', desc: 'Sarah & Tommy loyalty coupon' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100 font-display">
              Cashier Laminated Reference Card
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Standard Produce PLUs */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono mb-2">
            Standard Produce PLU Lookup Codes
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {codes.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  sounds.playKeyClick();
                  onSelectPlu(item.code);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{item.emoji}</span>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block group-hover:text-amber-300">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.price}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-900/60 px-2 py-0.5 rounded">
                  #{item.code}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Store Coupons */}
        <div className="pt-2 border-t border-slate-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono mb-2 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span>Active Store Coupon Codes</span>
          </h3>
          <div className="flex flex-col gap-1.5">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-200">{c.discount}</span>
                  <span className="text-[10px] text-slate-400 block">{c.desc}</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                  {c.code}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 text-center pt-2">
          Click any PLU item to automatically copy into the scale or type on keypad.
        </div>
      </div>
    </div>
  );
};
