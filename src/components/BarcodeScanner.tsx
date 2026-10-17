import React, { useState } from 'react';
import { sounds } from '../game/soundEffects';
import { Scan, Zap, AlertCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onManualBarcodeSubmit: (code: string) => boolean;
  lastScannedMessage: string | null;
  laserActive: boolean;
  onTriggerLaser: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onManualBarcodeSubmit,
  lastScannedMessage,
  laserActive,
  onTriggerLaser,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    sounds.playKeyClick();
    const success = onManualBarcodeSubmit(barcodeInput.trim());
    if (success) {
      setBarcodeInput('');
      setErrorMessage(null);
    } else {
      sounds.playError();
      setErrorMessage(`Barcode "${barcodeInput}" not recognized in catalog`);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Scanner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-display">
            Omni-Directional Laser Scanner
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              laserActive
                ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
            }`}
          />
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            {laserActive ? 'LASER EMITTING' : 'READY TO SCAN'}
          </span>
        </div>
      </div>

      {/* Optical Scanner Glass Chamber */}
      <div className="relative rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-950 h-28 flex flex-col items-center justify-center shadow-inner group">
        {/* Subtle glass reflection grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

        {/* Laser beam sweep line */}
        <div
          className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] transition-opacity ${
            laserActive ? 'laser-beam opacity-100' : 'opacity-25'
          }`}
        />

        {/* Reticle targeting optics */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-rose-500/40 flex items-center justify-center">
              <Scan className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <button
              type="button"
              onClick={onTriggerLaser}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-md shadow-md hover:shadow-rose-500/30 flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>PULL LASER TRIGGER</span>
            </button>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Aim red beam over item barcode or click item on belt
          </span>
        </div>

        {/* Laser Flash overlay on scan */}
        {laserActive && (
          <div className="absolute inset-0 bg-rose-500/10 pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Last Scanned Status Readout */}
      {lastScannedMessage && (
        <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between font-mono">
          <span className="font-semibold">{lastScannedMessage}</span>
          <span className="text-[10px] text-emerald-400/80">BEEP!</span>
        </div>
      )}

      {errorMessage && (
        <div className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Manual Barcode Keyboard Entry */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Type barcode (e.g. 011110416001)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono tracking-wider"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          Enter Code
        </button>
      </form>
    </div>
  );
};
