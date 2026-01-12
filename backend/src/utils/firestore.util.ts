/**
 * Utility: Remove undefined values from an object
 * Firestore doesn't accept undefined values - they must be omitted entirely
 */
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {};

    for (const key in obj) {
        if (obj[key] !== undefined) {
            cleaned[key] = obj[key];
        }
    }

    return cleaned;
}

export { removeUndefinedFields };
