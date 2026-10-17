import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ConveyorBelt, BeltItemEntry } from './components/ConveyorBelt';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ProduceScale } from './components/ProduceScale';
import { RegisterCalculator } from './components/RegisterCalculator';
import { CardTerminal } from './components/CardTerminal';
import { ReceiptPrinter } from './components/ReceiptPrinter';
import { PluCheatSheetModal } from './components/PluCheatSheetModal';
import { CustomerHeader } from './components/CustomerHeader';
import { GROCERY_CATALOG, CUSTOMER_ORDERS, CustomerOrder } from './game/catalog';
import {
  findItemByBarcode,
  findItemByPlu,
  calculateLineItemTotal,
  calculateReceiptTotals,
  generateTransactionId,
  GroceryItem,
  ScannedLineItem,
} from './game/registerLogic';
import { sounds } from './game/soundEffects';
import { ShoppingBag, Sparkles, BookOpen, RotateCcw } from 'lucide-react';

export default function App() {
  // Current customer order index
  const [customerIndex, setCustomerIndex] = useState<number>(0);
  const currentCustomer: CustomerOrder = CUSTOMER_ORDERS[customerIndex % CUSTOMER_ORDERS.length];

  // Belt items for the active customer
  const [beltItems, setBeltItems] = useState<BeltItemEntry[]>([]);

  // Scanned items in register
  const [scannedItems, setScannedItems] = useState<ScannedLineItem[]>([]);

  // Scale active item
  const [activeWeighItem, setActiveWeighItem] = useState<{
    item: GroceryItem;
    quantity: number;
    weight?: number;
  } | null>(null);

  // Scanner status
  const [laserActive, setLaserActive] = useState<boolean>(false);
  const [lastScannedMessage, setLastScannedMessage] = useState<string | null>(null);

  // Register calculator & coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(1);

  // Active workflow view: 'register' | 'card_terminal' | 'receipt'
  const [workflowState, setWorkflowState] = useState<'register' | 'card_terminal' | 'receipt'>('register');

  // Completed payment details for receipt
  const [receiptData, setReceiptData] = useState<{
    items: ScannedLineItem[];
    totals: ReturnType<typeof calculateReceiptTotals>;
    customer: CustomerOrder;
    payment: {
      cardType: string;
      last4: string;
      approvalCode: string;
      method: string;
    };
    timestamp: Date;
    transactionId: string;
  } | null>(null);

  // Game stats & controls
  const [cashierScore, setCashierScore] = useState<number>(120);
  const [gameMode, setGameMode] = useState<'story' | 'rush' | 'sandbox'>('story');
  const [isPluModalOpen, setIsPluModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Load customer items onto conveyor belt
  const loadCustomerBelt = useCallback((customer: CustomerOrder) => {
    const entries: BeltItemEntry[] = customer.items.map((orderItem, idx) => ({
      queueId: `belt-${customer.id}-${idx}-${Date.now()}`,
      item: orderItem.item,
      quantity: orderItem.quantity,
      weight: orderItem.weight,
      scanned: false,
    }));
    setBeltItems(entries);
    setScannedItems([]);
    setAppliedCoupon(customer.couponCode || null);
    setActiveMultiplier(1);
    setActiveWeighItem(null);
    setWorkflowState('register');
    setReceiptData(null);
  }, []);

  // Initialize first customer on mount
  useEffect(() => {
    loadCustomerBelt(currentCustomer);
  }, [customerIndex, loadCustomerBelt]);

  // Derived totals
  const totals = useMemo(() => {
    return calculateReceiptTotals(scannedItems, appliedCoupon || undefined);
  }, [scannedItems, appliedCoupon]);

  // Trigger scanning laser and mark item scanned
  const handleScanItem = (entry: BeltItemEntry) => {
    setLaserActive(true);
    sounds.playScannerBeep();

    const qty = activeMultiplier > 1 ? activeMultiplier : entry.quantity;
    const lineTotal = calculateLineItemTotal(entry.item, qty, entry.weight);

    const newLine: ScannedLineItem = {
      scanId: `scan-${Date.now()}-${Math.random()}`,
      item: entry.item,
      quantity: qty,
      weight: entry.weight,
      unitPrice: entry.item.price,
      totalPrice: lineTotal,
      timestamp: Date.now(),
    };

    setScannedItems((prev) => [...prev, newLine]);
    setBeltItems((prev) =>
      prev.map((b) => (b.queueId === entry.queueId ? { ...b, scanned: true } : b))
    );
    setCashierScore((prev) => prev + 15);
    setActiveMultiplier(1);
    setLastScannedMessage(`Scanned: ${entry.item.name} (${qty}×) - $${lineTotal.toFixed(2)}`);

    setTimeout(() => {
      setLaserActive(false);
    }, 300);
  };

  // Place produce on scale
  const handlePlaceOnScale = (entry: BeltItemEntry) => {
    setActiveWeighItem({
      item: entry.item,
      quantity: entry.quantity,
      weight: entry.weight,
    });
    // Mark belt item so it doesn't get duplicate scanned
    setBeltItems((prev) =>
      prev.map((b) => (b.queueId === entry.queueId ? { ...b, scanned: true } : b))
    );
  };

  // Confirm produce weighed on scale
  const handleConfirmWeighedItem = (item: GroceryItem, weight: number, quantity: number) => {
    const lineTotal = calculateLineItemTotal(item, quantity, weight);

    const newLine: ScannedLineItem = {
      scanId: `scan-${Date.now()}-${Math.random()}`,
      item,
      quantity,
      weight,
      unitPrice: item.price,
      totalPrice: lineTotal,
      timestamp: Date.now(),
    };

    setScannedItems((prev) => [...prev, newLine]);
    setActiveWeighItem(null);
    setCashierScore((prev) => prev + 25);
    setLastScannedMessage(`Weighed: ${item.name} (${weight} lbs) - $${lineTotal.toFixed(2)}`);
  };

  // Manual barcode submitted from scanner input
  const handleManualBarcodeSubmit = (code: string): boolean => {
    const found = findItemByBarcode(code, GROCERY_CATALOG);
    if (!found) return false;

    setLaserActive(true);
    sounds.playScannerBeep();

    const qty = activeMultiplier > 1 ? activeMultiplier : 1;
    const lineTotal = calculateLineItemTotal(found, qty, found.weight);

    const newLine: ScannedLineItem = {
      scanId: `scan-${Date.now()}-${Math.random()}`,
      item: found,
      quantity: qty,
      weight: found.weight,
      unitPrice: found.price,
      totalPrice: lineTotal,
      timestamp: Date.now(),
    };

    setScannedItems((prev) => [...prev, newLine]);
    setCashierScore((prev) => prev + 20);
    setActiveMultiplier(1);
    setLastScannedMessage(`Code Verified: ${found.name} - $${lineTotal.toFixed(2)}`);

    setTimeout(() => {
      setLaserActive(false);
    }, 300);
    return true;
  };

  // Manual code prompt helper
  const handleManualCodePrompt = (entry: BeltItemEntry) => {
    handleManualBarcodeSubmit(entry.item.barcode);
    setBeltItems((prev) =>
      prev.map((b) => (b.queueId === entry.queueId ? { ...b, scanned: true } : b))
    );
  };

  // Void a line item
  const handleVoidLineItem = (scanId: string) => {
    setScannedItems((prev) => prev.filter((i) => i.scanId !== scanId));
    setCashierScore((prev) => Math.max(0, prev - 10));
  };

  // Clear register
  const handleClearRegister = () => {
    setScannedItems([]);
    setAppliedCoupon(null);
  };

  // Apply coupon
  const handleApplyCoupon = (code: string): boolean => {
    const upper = code.toUpperCase().trim();
    if (upper === 'SAVE10' || upper === 'SUPER20' || upper === 'VIP5OFF' || upper === 'FREESHIP') {
      setAppliedCoupon(upper);
      setCashierScore((prev) => prev + 10);
      return true;
    }
    return false;
  };

  // Proceed to Card Payment
  const handleProceedToCardPayment = () => {
    if (scannedItems.length === 0) return;
    setWorkflowState('card_terminal');
  };

  // Card payment approved
  const handlePaymentSuccess = (paymentDetails: {
    cardType: string;
    last4: string;
    approvalCode: string;
    method: 'tap' | 'chip' | 'swipe';
  }) => {
    const txId = generateTransactionId();
    setReceiptData({
      items: [...scannedItems],
      totals: { ...totals },
      customer: currentCustomer,
      payment: paymentDetails,
      timestamp: new Date(),
      transactionId: txId,
    });
    setWorkflowState('receipt');
    setCashierScore((prev) => prev + 50);
  };

  // Tear off receipt and advance to next customer
  const handleTearOffAndNext = () => {
    setCustomerIndex((prev) => prev + 1);
  };

  // Mute audio toggle
  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.setMuted(nextState);
  };

  // Sandbox load items
  const handleAddRandomItemToBelt = () => {
    sounds.playKeyClick();
    const randomCatalogItem =
      GROCERY_CATALOG[Math.floor(Math.random() * GROCERY_CATALOG.length)];
    const newEntry: BeltItemEntry = {
      queueId: `sandbox-${Date.now()}-${Math.random()}`,
      item: randomCatalogItem,
      quantity: 1,
      weight: randomCatalogItem.isWeighted ? 1.5 : undefined,
      scanned: false,
    };
    setBeltItems((prev) => [...prev, newEntry]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar (Strict 3-Zone Contract: 1-line brand title, 4-5 text links, 1 primary action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 shadow-md shadow-emerald-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-display">
            SuperScan Express
          </span>
        </div>

        {/* Zone 2: Clean single-line text links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              setWorkflowState('register');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Register Station
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              setIsPluModalOpen(true);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>PLU Code Guide</span>
          </button>
          <button
            type="button"
            onClick={handleAddRandomItemToBelt}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Add Belt Item
          </button>
          <span className="text-slate-600 whitespace-nowrap shrink-0">·</span>
          <span className="text-slate-400 whitespace-nowrap shrink-0 font-mono">
            Register #04 · Station Active
          </span>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playKeyClick();
              setCustomerIndex((prev) => prev + 1);
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm hover:shadow-emerald-400/20 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 font-display"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Call Next Customer</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
        {/* Customer Dialogue & Shift Header */}
        <CustomerHeader
          currentCustomer={currentCustomer}
          customerIndex={customerIndex}
          totalCustomers={CUSTOMER_ORDERS.length}
          score={cashierScore}
          gameMode={gameMode}
          onChangeMode={(mode) => setGameMode(mode)}
          onNextCustomerManual={() => setCustomerIndex((prev) => prev + 1)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* Dynamic Cashier Desk Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (7 cols): Conveyor Belt, Barcode Scanner, & Produce Scale */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* 1. Conveyor Belt */}
            <ConveyorBelt
              items={beltItems}
              onScanItem={handleScanItem}
              onPlaceOnScale={handlePlaceOnScale}
              onManualCodePrompt={handleManualCodePrompt}
            />

            {/* 2. Flatbed & Handheld Barcode Laser Scanner */}
            <BarcodeScanner
              onManualBarcodeSubmit={handleManualBarcodeSubmit}
              lastScannedMessage={lastScannedMessage}
              laserActive={laserActive}
              onTriggerLaser={() => {
                // If there is an unscanned item on the belt, scan the first one!
                const nextUnscanned = beltItems.find((i) => !i.scanned);
                if (nextUnscanned) {
                  handleScanItem(nextUnscanned);
                } else {
                  sounds.playScannerBeep();
                  setLaserActive(true);
                  setTimeout(() => setLaserActive(false), 300);
                }
              }}
            />

            {/* 3. Produce Digital Scale & 4-Digit PLU */}
            <ProduceScale
              activeWeighItem={activeWeighItem}
              onConfirmWeighedItem={handleConfirmWeighedItem}
              onClearScale={() => setActiveWeighItem(null)}
              onOpenPluSheet={() => setIsPluModalOpen(true)}
            />
          </div>

          {/* Right Column (5 cols): Interactive Register Calculator or Card Payment Terminal or Receipt Printer */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {workflowState === 'register' && (
              <RegisterCalculator
                scannedItems={scannedItems}
                totals={totals}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={() => setAppliedCoupon(null)}
                onVoidLineItem={handleVoidLineItem}
                onClearRegister={handleClearRegister}
                onProceedToCardPayment={handleProceedToCardPayment}
                activeMultiplier={activeMultiplier}
                onSetMultiplier={(m) => setActiveMultiplier(m)}
              />
            )}

            {workflowState === 'card_terminal' && (
              <CardTerminal
                totalAmount={totals.total}
                currentCustomer={currentCustomer}
                onPaymentSuccess={handlePaymentSuccess}
                onCancelPayment={() => setWorkflowState('register')}
              />
            )}

            {workflowState === 'receipt' && receiptData && (
              <ReceiptPrinter
                receiptData={receiptData}
                onTearOffAndNext={handleTearOffAndNext}
              />
            )}

            {/* Cashier Quick Tip Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex flex-col gap-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5 font-display">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Supermarket Roleplay Pro Tips:</span>
              </span>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 leading-relaxed text-[11px]">
                <li>
                  Click <strong>Scan</strong> or pull the laser trigger to scan barcodes with the optical scanner beam.
                </li>
                <li>
                  For weighted produce (like bananas or honeycrisp apples), click <strong>Weigh</strong> to place on the digital scale and confirm standard PLU codes (e.g. #4011).
                </li>
                <li>
                  Switch to the <strong>Calculator</strong> tab to do arithmetic, calculate change, or set item quantity multipliers (e.g. 3×).
                </li>
                <li>
                  Click <strong>Proceed with Card Payment</strong> to use the smart EFTPOS terminal with Tap (NFC wave), Chip & PIN, or Mag-Stripe swipe!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* PLU Cheat Sheet Modal */}
      <PluCheatSheetModal
        isOpen={isPluModalOpen}
        onClose={() => setIsPluModalOpen(false)}
        onSelectPlu={(pluCode) => {
          // Find item in catalog and load or place on scale
          const produceItem = findItemByPlu(pluCode, GROCERY_CATALOG);
          if (produceItem) {
            setActiveWeighItem({
              item: produceItem,
              quantity: 1,
              weight: produceItem.weight || 1.5,
            });
          }
        }}
      />
    </div>
  );
}
