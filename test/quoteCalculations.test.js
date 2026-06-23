import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calculateQuoteTotals,
    calculateRowTotals,
} from '../src/lib/quotes/quoteCalculations.js';

test('calculateRowTotals returns subtotal, tax and total with money precision', () => {
    assert.deepEqual(calculateRowTotals({ cantidad: 3, pu: 125.5 }), {
        subtotal: '376.50',
        iva: '60.24',
        total: '436.74',
    });
});

test('calculateRowTotals treats invalid numeric inputs as zero', () => {
    assert.deepEqual(calculateRowTotals({ cantidad: 'abc', pu: 100 }), {
        subtotal: '0.00',
        iva: '0.00',
        total: '0.00',
    });
});

test('calculateQuoteTotals uses existing row subtotals to avoid recalculating edited rows', () => {
    assert.deepEqual(
        calculateQuoteTotals([
            { subtotal: '100.00' },
            { subtotal: 50 },
            { cantidad: 2, pu: 25 },
        ]),
        {
            subtotal: '200.00',
            iva: '32.00',
            total: '232.00',
        },
    );
});
