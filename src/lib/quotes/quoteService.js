const ADMIN_ROLES = new Set(['admin', 'gerencia']);

export const buildQuotesWhereClause = ({ role, userId }) => {
    return ADMIN_ROLES.has(role) ? {} : { userId };
};

export const getNextQuoteNumber = (maxQuoteNumber) => {
    const parsed = Number(maxQuoteNumber || 0);
    return parsed > 0 ? parsed + 1 : 1;
};

export const validateQuotePayload = (payload = {}) => {
    if (!payload.companyName) {
        return 'El nombre de la empresa es obligatorio';
    }

    return null;
};

export const buildQuoteCreatePayload = ({ body, userId, maxQuoteNumber }) => {
    return {
        quoteNumber: getNextQuoteNumber(maxQuoteNumber),
        companyName: body.companyName,
        address: body.address,
        attentionTo: body.attentionTo,
        department: body.department,
        email: body.email,
        phone: body.phone,
        supervisor: body.supervisor,
        descripcionGeneral: body.descripcionGeneral,
        items: body.items,
        observaciones: body.observaciones,
        total: body.total,
        userId,
    };
};
