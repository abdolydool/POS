/**
 * Pure register and point-of-sale calculations for SuperScan Express
 */

export interface GroceryItem {
  id: string;
  name: string;
  category: 'produce' | 'dairy' | 'bakery' | 'pantry' | 'beverage' | 'snack' | 'frozen';
  price: number; // base price (fixed or per lb)
  isWeighted: boolean;
  weight?: number; // default or measured weight in lbs
  barcode: string;
  pluCode?: string;
  emoji: string;
  brand: string;
  badge?: string;
}

export interface ScannedLineItem {
  scanId: string;
  item: GroceryItem;
  quantity: number;
  weight?: number; // for produce weighed on scale
  unitPrice: number;
  totalPrice: number;
  timestamp: number;
}

export interface ReceiptTotals {
  itemCount: number;
  subtotal: number;
  discountSavings: number;
  taxAmount: number;
  total: number;
  taxRate: number;
}

export interface CouponResult {
  valid: boolean;
  discountPercent: number;
  discountAmount: number;
  message: string;
}

export const KNOWN_COUPONS: Record<string, { percent: number; amount: number; desc: string }> = {
  SAVE10: { percent: 10, amount: 0, desc: '10% Off Entire Order' },
  SUPER20: { percent: 20, amount: 0, desc: '20% Off Storewide' },
  VIP5OFF: { percent: 0, amount: 5.0, desc: '$5.00 Off Order' },
  FREESHIP: { percent: 5, amount: 0, desc: '5% Express Cashier Perk' },
};

export function findItemByBarcode(barcode: string, catalog: GroceryItem[]): GroceryItem | undefined {
  const cleanCode = barcode.trim().replace(/-/g, '');
  return catalog.find((item) => item.barcode.replace(/-/g, '') === cleanCode);
}

export function findItemByPlu(plu: string, catalog: GroceryItem[]): GroceryItem | undefined {
  const cleanPlu = plu.trim();
  return catalog.find((item) => item.pluCode === cleanPlu);
}

export function calculateLineItemTotal(item: GroceryItem, quantity: number, weight?: number): number {
  const safeQty = Math.max(1, Math.floor(quantity || 1));
  if (item.isWeighted) {
    const safeWeight = Math.max(0.01, Number(weight || item.weight || 1));
    return Number((item.price * safeWeight).toFixed(2));
  }
  return Number((item.price * safeQty).toFixed(2));
}

export function calculateReceiptTotals(
  items: ScannedLineItem[],
  couponCode?: string,
  manualDiscountPercent: number = 0,
  taxRate: number = 0.0825 // 8.25% standard grocery non-exempt / mixed tax
): ReceiptTotals {
  let subtotal = 0;
  let itemCount = 0;

  for (const line of items) {
    subtotal += line.totalPrice;
    itemCount += line.quantity;
  }
  subtotal = Number(subtotal.toFixed(2));

  let discountSavings = 0;
  if (couponCode) {
    const coupon = KNOWN_COUPONS[couponCode.toUpperCase().trim()];
    if (coupon) {
      if (coupon.percent > 0) {
        discountSavings += (subtotal * coupon.percent) / 100;
      }
      if (coupon.amount > 0) {
        discountSavings += coupon.amount;
      }
    }
  }

  if (manualDiscountPercent > 0) {
    discountSavings += (subtotal * manualDiscountPercent) / 100;
  }

  // Cap discount so total doesn't go below 0
  discountSavings = Math.min(subtotal, Number(discountSavings.toFixed(2)));
  const taxableSubtotal = Math.max(0, subtotal - discountSavings);
  const taxAmount = Number((taxableSubtotal * taxRate).toFixed(2));
  const total = Number((taxableSubtotal + taxAmount).toFixed(2));

  return {
    itemCount,
    subtotal,
    discountSavings,
    taxAmount,
    total,
    taxRate,
  };
}

export function validateCoupon(code: string): CouponResult {
  const key = code.toUpperCase().trim();
  const found = KNOWN_COUPONS[key];
  if (!found) {
    return {
      valid: false,
      discountPercent: 0,
      discountAmount: 0,
      message: 'Invalid coupon code. Try SAVE10, SUPER20, or VIP5OFF.',
    };
  }
  return {
    valid: true,
    discountPercent: found.percent,
    discountAmount: found.amount,
    message: `${found.desc} applied!`,
  };
}

export function formatCurrency(amount: number): string {
  return `$${Number(amount || 0).toFixed(2)}`;
}

export function generateApprovalCode(): string {
  const hex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
  return `APPR#${hex}`;
}

export function generateTransactionId(): string {
  const now = Date.now().toString().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TX-${now}-${rand}`;
}

export function evaluateRegisterCalculator(expression: string): { success: boolean; result: number; error?: string } {
  const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
  if (!/^[0-9+\-*/.()]+$/.test(sanitized)) {
    return { success: false, result: 0, error: 'Invalid character in calculation' };
  }
  try {
    // Safe arithmetic evaluation
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${sanitized});`);
    const val = fn();
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return { success: true, result: Number(val.toFixed(2)) };
    }
    return { success: false, result: 0, error: 'Math error' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Syntax error';
    return { success: false, result: 0, error: msg };
  }
}
