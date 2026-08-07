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

/**
 * Convierte recursivamente un filtro de Mongoose a una forma JSON-safe,
 * reemplazando las instancias de RegExp por { $regex, $options }.
 * Necesario porque los atributos de sesión se serializan como JSON y un
 * RegExp se pierde (se convierte en {}).
 */
export function serializeFilter(filter) {
    if (filter instanceof RegExp) {
        return { $regex: filter.source, $options: filter.flags };
    }
    if (Array.isArray(filter)) {
        return filter.map(serializeFilter);
    }
    if (filter && typeof filter === 'object') {
        const out = {};
        for (const key of Object.keys(filter)) {
            if (key === '$regex' && filter[key] instanceof RegExp) {
                out.$regex = filter[key].source;
                out.$options = filter[key].flags;
                continue;
            }
            out[key] = serializeFilter(filter[key]);
        }
        return out;
    }
    return filter;
}

