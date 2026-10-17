import React from 'react';
import type { GroceryItem } from '../game/registerLogic';
import { sounds } from '../game/soundEffects';
import { Scale, Barcode, CheckCircle2, ShoppingBag } from 'lucide-react';

export interface BeltItemEntry {
  queueId: string;
  item: GroceryItem;
  quantity: number;
  weight?: number;
  scanned: boolean;
}

interface ConveyorBeltProps {
  items: BeltItemEntry[];
  onScanItem: (itemEntry: BeltItemEntry) => void;
  onPlaceOnScale: (itemEntry: BeltItemEntry) => void;
  onManualCodePrompt: (itemEntry: BeltItemEntry) => void;
}

export const ConveyorBelt: React.FC<ConveyorBeltProps> = ({
  items,
  onScanItem,
  onPlaceOnScale,
  onManualCodePrompt,
}) => {
  const unscannedItems = items.filter((i) => !i.scanned);
  const scannedCount = items.filter((i) => i.scanned).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Belt Header / Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-display">
            Checkout Conveyor Belt
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
            <span>Remaining: <strong className="text-slate-200">{unscannedItems.length}</strong></span>
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>
            Scanned: <strong className="text-emerald-400">{scannedCount}</strong>
          </span>
        </div>
      </div>

      {/* The Physical Conveyor Belt Surface */}
      <div className="relative w-full overflow-hidden rounded-lg border border-slate-700/80 bg-slate-950 p-3 min-h-[160px]">
        {/* Conveyor Belt Tread Lines */}
        <div className="absolute inset-0 conveyor-belt-stripes opacity-40 pointer-events-none" />

        {/* Rubber belt edge guides */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-slate-600 to-slate-800 border-b border-slate-700" />
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-t from-slate-600 to-slate-800 border-t border-slate-700" />

        {/* Items on Belt */}
        {unscannedItems.length === 0 ? (
          <div className="relative z-10 flex flex-col items-center justify-center py-8 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
            <p className="text-sm font-medium text-slate-200">Belt is clear!</p>
            <p className="text-xs text-slate-500">All customer items have been scanned into the register.</p>
          </div>
        ) : (
          <div className="relative z-10 flex gap-3 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            {unscannedItems.map((entry) => {
              const isProduce = entry.item.isWeighted || entry.item.pluCode;

              return (
                <div
                  key={entry.queueId}
                  className="shrink-0 w-48 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/60 transition-all rounded-lg p-2.5 flex flex-col justify-between shadow-lg group"
                >
                  {/* Top info */}
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="text-2xl filter drop-shadow">{entry.item.emoji}</span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-300 font-mono-numbers">
                          ${entry.item.price.toFixed(2)}
                          {entry.item.isWeighted ? '/lb' : ''}
                        </span>
                        {entry.quantity > 1 && (
                          <div className="text-[10px] text-slate-400 font-mono-numbers">Qty: {entry.quantity}</div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-100 line-clamp-1 leading-snug">
                      {entry.item.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">{entry.item.brand}</p>

                    {/* Weight / PLU indicator */}
                    <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                      {entry.weight && (
                        <span className="text-sky-300 font-mono-numbers">
                          Scale: {entry.weight} lbs
                        </span>
                      )}
                      {entry.item.pluCode && (
                        <span className="bg-amber-950/70 text-amber-300 border border-amber-800/60 px-1 rounded text-[9px] font-mono-numbers">
                          PLU #{entry.item.pluCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barcode graphic snippet */}
                  <div className="mt-2 pt-2 border-t border-slate-700/60">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mb-1">
                      <span>BARCODE</span>
                      <span className="tracking-widest">{entry.item.barcode.slice(-6)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {isProduce ? (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playKeyClick();
                            onPlaceOnScale(entry);
                          }}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 rounded transition-colors"
                          title="Place produce on digital scale to weigh and enter PLU"
                        >
                          <Scale className="w-3 h-3 text-amber-400" />
                          <span>Weigh</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playKeyClick();
                            onManualCodePrompt(entry);
                          }}
                          className="flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
                          title="Type barcode on keypad"
                        >
                          <Barcode className="w-3 h-3 text-slate-400" />
                          <span>Type</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onScanItem(entry);
                        }}
                        className="flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow-sm hover:shadow-emerald-500/20 transition-all"
                        title="Aim laser and scan barcode"
                      >
                        <Barcode className="w-3 h-3" />
                        <span>Scan</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
