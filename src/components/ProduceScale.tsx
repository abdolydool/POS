import React, { useState } from 'react';
import type { GroceryItem } from '../game/registerLogic';
import { sounds } from '../game/soundEffects';
import { Scale, Check, RefreshCw, HelpCircle } from 'lucide-react';

interface ProduceScaleProps {
  activeWeighItem: {
    item: GroceryItem;
    quantity: number;
    weight?: number;
  } | null;
  onConfirmWeighedItem: (item: GroceryItem, weight: number, quantity: number) => void;
  onClearScale: () => void;
  onOpenPluSheet: () => void;
}

export const ProduceScale: React.FC<ProduceScaleProps> = ({
  activeWeighItem,
  onConfirmWeighedItem,
  onClearScale,
  onOpenPluSheet,
}) => {
  const [pluInput, setPluInput] = useState('');
  const [currentWeight, setCurrentWeight] = useState<number>(activeWeighItem?.weight || 1.75);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick PLU buttons for fast cashier selection
  const quickPlus = [
    { code: '4011', name: 'Bananas', emoji: '🍌', price: 0.69, perLb: true },
    { code: '4173', name: 'Honeycrisp', emoji: '🍎', price: 1.99, perLb: true },
    { code: '4046', name: 'Avocado', emoji: '🥑', price: 1.29, perLb: false },
    { code: '4060', name: 'Broccoli', emoji: '🥦', price: 1.89, perLb: true },
    { code: '4065', name: 'Pepper', emoji: '🫑', price: 0.89, perLb: false },
    { code: '4053', name: 'Lemon', emoji: '🍋', price: 0.65, perLb: false },
  ];

  // If item is placed, update current weight
  React.useEffect(() => {
    if (activeWeighItem) {
      setCurrentWeight(activeWeighItem.weight || 1.85);
      if (activeWeighItem.item.pluCode) {
        setPluInput(activeWeighItem.item.pluCode);
      }
    }
  }, [activeWeighItem]);

  const handlePluKeypad = (digit: string) => {
    sounds.playKeyClick();
    if (pluInput.length < 5) {
      setPluInput((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    sounds.playKeyClick();
    setPluInput((prev) => prev.slice(0, -1));
  };

  const handleZeroScale = () => {
    sounds.playKeyClick();
    setCurrentWeight(0.0);
  };

  const handleAdjustWeight = (delta: number) => {
    sounds.playKeyClick();
    setCurrentWeight((prev) => Math.max(0.1, Number((prev + delta).toFixed(2))));
  };

  const handleConfirmScale = () => {
    if (!activeWeighItem && !pluInput) {
      sounds.playError();
      setErrorMessage('Place item or enter 4-digit PLU code');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    // Determine target item
    let targetItem = activeWeighItem?.item;
    if (!targetItem) {
      const match = quickPlus.find((p) => p.code === pluInput);
      if (match) {
        targetItem = {
          id: `manual-plu-${match.code}`,
          name: match.name,
          category: 'produce',
          price: match.price,
          isWeighted: match.perLb,
          weight: currentWeight,
          barcode: `00000000${match.code}`,
          pluCode: match.code,
          emoji: match.emoji,
          brand: 'Produce Department',
          badge: `PLU #${match.code}`,
        };
      }
    }

    if (!targetItem) {
      sounds.playError();
      setErrorMessage(`PLU #${pluInput} not recognized. Try 4011 (Bananas) or 4173 (Apples).`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    sounds.playScaleDing();
    onConfirmWeighedItem(targetItem, currentWeight, activeWeighItem?.quantity || 1);
    setPluInput('');
    setErrorMessage(null);
  };

  // Calculate live preview cost
  const activePrice = activeWeighItem ? activeWeighItem.item.price : (quickPlus.find(p => p.code === pluInput)?.price || 0);
  const isPerLb = activeWeighItem ? activeWeighItem.item.isWeighted : (quickPlus.find(p => p.code === pluInput)?.perLb ?? true);
  const liveTotal = isPerLb ? (currentWeight * activePrice) : activePrice * (activeWeighItem?.quantity || 1);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Scale Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-display">
            Produce Digital Scale & PLU
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            sounds.playKeyClick();
            onOpenPluSheet();
          }}
          className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>PLU Code Cheat Sheet</span>
        </button>
      </div>

      {/* Digital Scale VFD Display */}
      <div className="bg-slate-950 border-2 border-slate-700 rounded-lg p-3 grid grid-cols-3 gap-2 text-center shadow-inner">
        <div className="bg-emerald-950/40 border border-emerald-900/60 rounded p-1.5">
          <span className="block text-[10px] text-emerald-500 uppercase font-mono">WEIGHT (LBS)</span>
          <span className="text-xl font-bold text-emerald-400 font-mono-numbers tracking-wider">
            {currentWeight.toFixed(2)}
          </span>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-900/60 rounded p-1.5">
          <span className="block text-[10px] text-emerald-500 uppercase font-mono">UNIT PRICE</span>
          <span className="text-xl font-bold text-emerald-400 font-mono-numbers tracking-wider">
            ${activePrice.toFixed(2)}
          </span>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-900/60 rounded p-1.5">
          <span className="block text-[10px] text-emerald-500 uppercase font-mono">ITEM TOTAL</span>
          <span className="text-xl font-bold text-amber-300 font-mono-numbers tracking-wider">
            ${liveTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Scale Weighing Platter & Active Item */}
      <div className="bg-slate-950/90 border border-slate-700/80 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow">
            {activeWeighItem ? activeWeighItem.item.emoji : '⚖️'}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-100 block">
              {activeWeighItem ? activeWeighItem.item.name : 'Scale Platter: Empty'}
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              {activeWeighItem
                ? `PLU: #${activeWeighItem.item.pluCode || 'Manual'} · ${activeWeighItem.weight || currentWeight} lbs`
                : 'Select produce below or place item from belt'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleAdjustWeight(-0.25)}
            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            title="Decrease weight"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => handleAdjustWeight(0.25)}
            className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            title="Increase weight"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZeroScale}
            className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
            title="Zero / Tare scale"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Tare</span>
          </button>
        </div>
      </div>

      {/* Quick PLU Selector Grid */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-slate-400 font-medium">Quick PLU Produce Presets:</span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {quickPlus.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => {
                sounds.playKeyClick();
                setPluInput(p.code);
              }}
              className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                pluInput === p.code
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <span className="text-base">{p.emoji}</span>
              <span className="text-[11px] font-semibold truncate w-full">{p.name}</span>
              <span className="text-[9px] font-mono text-amber-400">#{p.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PLU Manual Keypad Input & Action */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-1 flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5">
          <span className="text-xs text-amber-400 font-mono font-bold">PLU#</span>
          <input
            type="text"
            value={pluInput}
            onChange={(e) => setPluInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="e.g. 4011"
            className="w-full bg-transparent text-xs text-slate-100 font-mono tracking-wider focus:outline-none"
          />
          {pluInput && (
            <button
              type="button"
              onClick={handleBackspace}
              className="text-[10px] text-slate-400 hover:text-slate-200"
            >
              DEL
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirmScale}
          className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg flex items-center gap-1.5 shadow-md hover:shadow-amber-500/20 transition-all whitespace-nowrap"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Add Weighed Item</span>
        </button>
      </div>

      {errorMessage && (
        <p className="text-[11px] text-rose-400 font-mono">{errorMessage}</p>
      )}
    </div>
  );
};
