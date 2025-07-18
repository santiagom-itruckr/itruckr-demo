export const generateId = (): string => Math.random().toString(36).substring(2, 11);
export const getCurrentIsoDate = (): string => new Date().toISOString();