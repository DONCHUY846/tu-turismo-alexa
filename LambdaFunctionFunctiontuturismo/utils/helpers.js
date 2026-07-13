export function sanitizeInput(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitiza un string proveniente de un slot de Alexa para prevenir inyección NoSQL.
 * Remueve caracteres especiales comunes en queries de objetos de MongoDB.
 */
export function sanitizeSlot(value) {
    if (!value || typeof value !== 'string') return '';
    // Remueve caracteres como $, {, }, [, ] que se usan en operadores NoSQL
    return value.replace(/[\$\{\}\[\]]/g, '').trim();
}

