export const DEFAULT_TAX_RATE = 0.16;

const toNumber = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const toMoney = (value) => value.toFixed(2);

export const calculateRowTotals = (row, taxRate = DEFAULT_TAX_RATE) => {
    const subtotal = toNumber(row?.cantidad) * toNumber(row?.pu);
    const iva = subtotal * taxRate;
    const total = subtotal + iva;

    return {
        subtotal: toMoney(subtotal),
        iva: toMoney(iva),
        total: toMoney(total),
    };
};

export const calculateQuoteTotals = (rows = [], taxRate = DEFAULT_TAX_RATE) => {
    const subtotal = rows.reduce((acc, row) => {
        const rowSubtotal = row?.subtotal ?? calculateRowTotals(row, taxRate).subtotal;
        return acc + toNumber(rowSubtotal);
    }, 0);

    const iva = subtotal * taxRate;
    const total = subtotal + iva;

    return {
        subtotal: toMoney(subtotal),
        iva: toMoney(iva),
        total: toMoney(total),
    };
};
