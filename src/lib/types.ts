// Adopted form https://github.com/piotrwitek/utility-types
export type Optional<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Partial<Pick<T, K>>;