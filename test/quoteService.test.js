import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildQuoteCreatePayload,
    buildQuotesWhereClause,
    getNextQuoteNumber,
    validateQuotePayload,
} from '../src/lib/quotes/quoteService.js';

test('buildQuotesWhereClause allows admin and gerencia to read all quotes', () => {
    assert.deepEqual(buildQuotesWhereClause({ role: 'admin', userId: 7 }), {});
    assert.deepEqual(buildQuotesWhereClause({ role: 'gerencia', userId: 7 }), {});
});

test('buildQuotesWhereClause limits regular users to their quotes', () => {
    assert.deepEqual(buildQuotesWhereClause({ role: 'ventas', userId: 7 }), {
        userId: 7,
    });
});

test('getNextQuoteNumber starts at one and increments numeric max values', () => {
    assert.equal(getNextQuoteNumber(null), 1);
    assert.equal(getNextQuoteNumber(0), 1);
    assert.equal(getNextQuoteNumber('41'), 42);
});

test('validateQuotePayload requires companyName', () => {
    assert.equal(
        validateQuotePayload({ companyName: '' }),
        'El nombre de la empresa es obligatorio',
    );
    assert.equal(validateQuotePayload({ companyName: 'ACME' }), null);
});

test('buildQuoteCreatePayload maps request body and assigns the logged user', () => {
    const payload = buildQuoteCreatePayload({
        userId: 9,
        maxQuoteNumber: 12,
        body: {
            companyName: 'ACME',
            address: 'Calle 1',
            attentionTo: 'Compras',
            department: 'COMPRAS',
            email: 'compras@example.com',
            phone: '555',
            supervisor: 'Luis',
            descripcionGeneral: 'Servicio mensual',
            items: [{ description: 'Servicio', subtotal: '100.00' }],
            observaciones: ['CONTADO'],
            total: '116.00',
        },
    });

    assert.deepEqual(payload, {
        quoteNumber: 13,
        companyName: 'ACME',
        address: 'Calle 1',
        attentionTo: 'Compras',
        department: 'COMPRAS',
        email: 'compras@example.com',
        phone: '555',
        supervisor: 'Luis',
        descripcionGeneral: 'Servicio mensual',
        items: [{ description: 'Servicio', subtotal: '100.00' }],
        observaciones: ['CONTADO'],
        total: '116.00',
        userId: 9,
    });
});
