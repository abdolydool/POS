import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findItemByBarcode,
  findItemByPlu,
  calculateLineItemTotal,
  calculateReceiptTotals,
  validateCoupon,
  evaluateRegisterCalculator,
} from './registerLogic.ts';
import type { GroceryItem, ScannedLineItem } from './registerLogic.ts';

const SAMPLE_CATALOG: GroceryItem[] = [
  {
    id: 'item-milk',
    name: 'Whole Milk 1 Gallon',
    category: 'dairy',
    price: 3.89,
    isWeighted: false,
    barcode: '011110416001',
    emoji: '🥛',
    brand: 'Farm Fresh',
  },
  {
    id: 'item-banana',
    name: 'Fresh Organic Bananas',
    category: 'produce',
    price: 0.69, // per lb
    isWeighted: true,
    weight: 2.5,
    barcode: '000000004011',
    pluCode: '4011',
    emoji: '🍌',
    brand: 'Sun Tropics',
  },
  {
    id: 'item-bread',
    name: 'Artisan Sourdough Loaf',
    category: 'bakery',
    price: 4.5,
    isWeighted: false,
    barcode: '072220001025',
    emoji: '🍞',
    brand: 'Rustic Oven',
  },
];

test('findItemByBarcode locates item accurately', () => {
  const item = findItemByBarcode('011110416001', SAMPLE_CATALOG);
  assert.ok(item);
  assert.equal(item?.id, 'item-milk');
});

test('findItemByPlu finds produce by 4-digit PLU code', () => {
  const banana = findItemByPlu('4011', SAMPLE_CATALOG);
  assert.ok(banana);
  assert.equal(banana?.name, 'Fresh Organic Bananas');
  assert.equal(banana?.isWeighted, true);
});

test('calculateLineItemTotal handles both unit quantity and scale weight', () => {
  const milk = SAMPLE_CATALOG[0];
  const unitTotal = calculateLineItemTotal(milk, 2);
  assert.equal(unitTotal, 7.78);

  const banana = SAMPLE_CATALOG[1];
  // 2.0 lbs at 0.69/lb = 1.38
  const weightedTotal = calculateLineItemTotal(banana, 1, 2.0);
  assert.equal(weightedTotal, 1.38);
});

test('calculateReceiptTotals computes subtotal, discounts, tax and grand total', () => {
  const scanned: ScannedLineItem[] = [
    {
      scanId: 's1',
      item: SAMPLE_CATALOG[0],
      quantity: 1,
      unitPrice: 3.89,
      totalPrice: 3.89,
      timestamp: Date.now(),
    },
    {
      scanId: 's2',
      item: SAMPLE_CATALOG[2],
      quantity: 1,
      unitPrice: 4.5,
      totalPrice: 4.5,
      timestamp: Date.now(),
    },
  ];

  // Subtotal = 3.89 + 4.50 = 8.39
  // With 10% coupon SAVE10: discount = 0.84, taxable = 7.55
  // Tax (8.25%) = 0.62
  // Total = 8.17
  const totals = calculateReceiptTotals(scanned, 'SAVE10', 0, 0.0825);
  assert.equal(totals.itemCount, 2);
  assert.equal(totals.subtotal, 8.39);
  assert.equal(totals.discountSavings, 0.84);
  assert.equal(totals.taxAmount, 0.62);
  assert.equal(totals.total, 8.17);
});

test('validateCoupon handles valid and invalid codes', () => {
  const valid = validateCoupon('SUPER20');
  assert.equal(valid.valid, true);
  assert.equal(valid.discountPercent, 20);

  const invalid = validateCoupon('NOT_REAL');
  assert.equal(invalid.valid, false);
});

test('evaluateRegisterCalculator evaluates register calculations safely', () => {
  const mult = evaluateRegisterCalculator('3 * 4.50');
  assert.equal(mult.success, true);
  assert.equal(mult.result, 13.5);

  const complex = evaluateRegisterCalculator('10 - 2.50 + 1.25');
  assert.equal(complex.success, true);
  assert.equal(complex.result, 8.75);

  const invalid = evaluateRegisterCalculator('alert(1)');
  assert.equal(invalid.success, false);
});
