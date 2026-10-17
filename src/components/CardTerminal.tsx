import React, { useState, useEffect } from 'react';
import type { CustomerOrder } from '../game/catalog';
import { sounds } from '../game/soundEffects';
import { generateApprovalCode } from '../game/registerLogic';
import {
  CreditCard,
  Wifi,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';

interface CardTerminalProps {
  totalAmount: number;
  currentCustomer: CustomerOrder;
  onPaymentSuccess: (paymentDetails: {
    cardType: string;
    last4: string;
    approvalCode: string;
    method: 'tap' | 'chip' | 'swipe';
  }) => void;
  onCancelPayment: () => void;
}

type TerminalState =
  | 'WAITING_FOR_CARD'
  | 'CHIP_INSERTED'
  | 'PROCESSING_TAP'
  | 'PROCESSING_SWIPE'
  | 'AUTHORIZING'
  | 'APPROVED'
  | 'DECLINED';

export const CardTerminal: React.FC<CardTerminalProps> = ({
  totalAmount,
  currentCustomer,
  onPaymentSuccess,
  onCancelPayment,
}) => {
  const [terminalState, setTerminalState] = useState<TerminalState>('WAITING_FOR_CARD');
  const [pinInput, setPinInput] = useState<string>('');
  const [activeNfcLeds, setActiveNfcLeds] = useState<number>(0);
  const [approvalCode, setApprovalCode] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'tap' | 'chip' | 'swipe'>('tap');
  const [simulateDecline, setSimulateDecline] = useState<boolean>(false);

  // Extract last 4 from customer card
  const last4 = currentCustomer.cardNumber.slice(-4);

  // Handle Tap to Pay
  const handleTapCard = () => {
    if (terminalState !== 'WAITING_FOR_CARD') return;
    setPaymentMethod('tap');
    setTerminalState('PROCESSING_TAP');
    sounds.playCardTap();

    // Animate 4 NFC LEDs sequentially
    setActiveNfcLeds(1);
    setTimeout(() => setActiveNfcLeds(2), 120);
    setTimeout(() => setActiveNfcLeds(3), 240);
    setTimeout(() => {
      setActiveNfcLeds(4);
      setTimeout(() => {
        if (simulateDecline) {
          sounds.playError();
          setTerminalState('DECLINED');
          setActiveNfcLeds(0);
        } else {
          const code = generateApprovalCode();
          setApprovalCode(code);
          setTerminalState('APPROVED');
          sounds.playCardApproved();
          setTimeout(() => {
            onPaymentSuccess({
              cardType: currentCustomer.cardType,
              last4,
              approvalCode: code,
              method: 'tap',
            });
          }, 1200);
        }
      }, 500);
    }, 360);
  };

  // Handle Chip Insertion
  const handleInsertChip = () => {
    if (terminalState !== 'WAITING_FOR_CARD') return;
    setPaymentMethod('chip');
    sounds.playKeyClick();
    setTerminalState('CHIP_INSERTED');
    setPinInput('');
  };

  // Handle Magnetic Swipe
  const handleSwipeCard = () => {
    if (terminalState !== 'WAITING_FOR_CARD') return;
    setPaymentMethod('swipe');
    sounds.playKeyClick();
    setTerminalState('PROCESSING_SWIPE');

    setTimeout(() => {
      if (simulateDecline) {
        sounds.playError();
        setTerminalState('DECLINED');
      } else {
        const code = generateApprovalCode();
        setApprovalCode(code);
        setTerminalState('APPROVED');
        sounds.playCardApproved();
        setTimeout(() => {
          onPaymentSuccess({
            cardType: currentCustomer.cardType,
            last4,
            approvalCode: code,
            method: 'swipe',
          });
        }, 1200);
      }
    }, 900);
  };

  // Handle PIN input for chip transactions
  const handlePinDigit = (digit: string) => {
    sounds.playKeyClick();
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handlePinBackspace = () => {
    sounds.playKeyClick();
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handlePinSubmit = () => {
    sounds.playKeyClick();
    if (pinInput.length !== 4) {
      sounds.playError();
      return;
    }

    setTerminalState('AUTHORIZING');
    setTimeout(() => {
      if (simulateDecline) {
        sounds.playError();
        setTerminalState('DECLINED');
      } else {
        const code = generateApprovalCode();
        setApprovalCode(code);
        setTerminalState('APPROVED');
        sounds.playCardApproved();
        setTimeout(() => {
          onPaymentSuccess({
            cardType: currentCustomer.cardType,
            last4,
            approvalCode: code,
            method: 'chip',
          });
        }, 1300);
      }
    }, 900);
  };

  const handleAutoFillPin = () => {
    sounds.playKeyClick();
    setPinInput(currentCustomer.cardPin);
  };

  const handleResetTerminal = () => {
    sounds.playKeyClick();
    setTerminalState('WAITING_FOR_CARD');
    setPinInput('');
    setActiveNfcLeds(0);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Terminal Title & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-display">
            EFTPOS Smart Payment Terminal
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={simulateDecline}
              onChange={(e) => setSimulateDecline(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0"
            />
            <span>Test Card Decline</span>
          </label>
        </div>
      </div>

      {/* Main Terminal Hardware Body */}
      <div className="bg-slate-950 border-2 border-slate-700 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 relative">
        {/* Contactless NFC Top Area with 4 Status LEDs */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-sky-400 rotate-90" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Contactless NFC
            </span>
          </div>

          {/* 4 Multi-LED Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-2.5 h-2.5 rounded-full border transition-all ${
                  activeNfcLeds >= num
                    ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#34d399]'
                    : 'bg-slate-800 border-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Illuminated Terminal Screen */}
        <div className="bg-sky-950/80 border-2 border-sky-800/80 rounded-xl p-4 text-center min-h-[140px] flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
          {/* Subtle screen scanlines */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-sky-500/5 pointer-events-none" />

          {terminalState === 'WAITING_FOR_CARD' && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs uppercase font-mono tracking-widest text-sky-300">
                AMOUNT DUE
              </span>
              <span className="text-3xl font-extrabold text-white font-mono-numbers tracking-tight">
                ${totalAmount.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-400 mt-1 animate-pulse font-mono">
                PLEASE INSERT, TAP, OR SWIPE
              </span>
              <span className="text-[10px] text-sky-300/70">
                Customer Card: {currentCustomer.cardType} {last4}
              </span>
            </div>
          )}

          {terminalState === 'PROCESSING_TAP' && (
            <div className="flex flex-col items-center gap-1">
              <Wifi className="w-8 h-8 text-emerald-400 animate-bounce" />
              <span className="text-sm font-bold text-white font-mono">
                READING CONTACTLESS...
              </span>
              <span className="text-xs text-sky-300">Hold card steady</span>
            </div>
          )}

          {terminalState === 'PROCESSING_SWIPE' && (
            <div className="flex flex-col items-center gap-1">
              <CreditCard className="w-8 h-8 text-sky-400 animate-pulse" />
              <span className="text-sm font-bold text-white font-mono">
                READING MAGNETIC STRIPE...
              </span>
              <span className="text-xs text-sky-300">Processing card swipe</span>
            </div>
          )}

          {terminalState === 'CHIP_INSERTED' && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-amber-300 font-mono">
                CHIP DETECTED · DO NOT REMOVE
              </span>
              <span className="text-xs text-slate-300">ENTER 4-DIGIT PIN:</span>
              <div className="flex gap-2 my-1">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-full border border-sky-400 flex items-center justify-center"
                  >
                    {pinInput.length > idx && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-sky-300/80 font-mono">
                (Customer PIN: {currentCustomer.cardPin})
              </span>
            </div>
          )}

          {terminalState === 'AUTHORIZING' && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-1" />
              <span className="text-sm font-bold text-white font-mono">
                AUTHORIZING TRANSACTION...
              </span>
              <span className="text-xs text-sky-300">Connecting to bank network</span>
            </div>
          )}

          {terminalState === 'APPROVED' && (
            <div className="flex flex-col items-center gap-1">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <span className="text-base font-extrabold text-emerald-300 font-mono">
                TRANSACTION APPROVED!
              </span>
              <span className="text-xs font-mono text-white">
                AUTH: {approvalCode}
              </span>
              <span className="text-[10px] text-sky-200">Printing receipt...</span>
            </div>
          )}

          {terminalState === 'DECLINED' && (
            <div className="flex flex-col items-center gap-1">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
              <span className="text-sm font-extrabold text-rose-300 font-mono">
                TRANSACTION DECLINED
              </span>
              <span className="text-xs text-slate-300">Please try another method</span>
              <button
                type="button"
                onClick={handleResetTerminal}
                className="mt-1 px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-semibold"
              >
                Retry Payment
              </button>
            </div>
          )}
        </div>

        {/* Customer Presented Card Slot Interactive Station */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Customer Card Ready:</span>
            <span className="font-mono text-emerald-400">
              {currentCustomer.cardType} · {currentCustomer.cardNumber}
            </span>
          </div>

          {/* Interactive Card Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleTapCard}
              disabled={terminalState !== 'WAITING_FOR_CARD'}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700/80 disabled:opacity-40 rounded-lg text-emerald-200 transition-all shadow"
            >
              <Wifi className="w-4 h-4 text-emerald-400 rotate-90" />
              <span className="text-xs font-bold">1. Tap Card (NFC)</span>
              <span className="text-[9px] text-emerald-400/80">Instant wave</span>
            </button>

            <button
              type="button"
              onClick={handleInsertChip}
              disabled={terminalState !== 'WAITING_FOR_CARD'}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 bg-sky-950/70 hover:bg-sky-900 border border-sky-700/80 disabled:opacity-40 rounded-lg text-sky-200 transition-all shadow"
            >
              <ArrowDown className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold">2. Insert Chip</span>
              <span className="text-[9px] text-sky-400/80">PIN protected</span>
            </button>

            <button
              type="button"
              onClick={handleSwipeCard}
              disabled={terminalState !== 'WAITING_FOR_CARD'}
              className="flex flex-col items-center justify-center gap-1 py-2 px-2 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/80 disabled:opacity-40 rounded-lg text-amber-200 transition-all shadow"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">3. Swipe Card</span>
              <span className="text-[9px] text-amber-400/80">Mag-stripe groove</span>
            </button>
          </div>
        </div>

        {/* PIN Pad (Active when chip inserted or testing) */}
        {terminalState === 'CHIP_INSERTED' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Terminal PIN Pad:</span>
              <button
                type="button"
                onClick={handleAutoFillPin}
                className="text-[11px] text-sky-400 hover:text-sky-300 underline"
              >
                Auto-Enter PIN ({currentCustomer.cardPin})
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinDigit(digit)}
                  className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-sm shadow transition-colors"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handlePinBackspace}
                className="py-2 rounded bg-rose-950/70 hover:bg-rose-900 text-rose-300 font-mono text-xs font-semibold"
              >
                CORR
              </button>
              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                className="py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-sm shadow"
              >
                0
              </button>
              <button
                type="button"
                onClick={handlePinSubmit}
                className="py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow"
              >
                ENTER
              </button>
            </div>
          </div>
        )}

        {/* Terminal Cancel / Back Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              onCancelPayment();
            }}
            disabled={terminalState === 'APPROVED' || terminalState === 'AUTHORIZING'}
            className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
          >
            Cancel & Return to Register
          </button>
        </div>
      </div>
    </div>
  );
};
