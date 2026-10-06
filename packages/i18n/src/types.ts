export type ComponentsJSON = Record<string, Record<string, any>>;
export type TranslationLoader = (
  locale: string,
  components: string[],
) => Promise<ComponentsJSON | Record<string, any>>;

export interface ReadableAtom<T> {
  get(): T;
  subscribe(listener: (value: T) => void): () => void;
  listen(listener: (value: T) => void): () => void;
}

export interface WritableAtom<T> extends ReadableAtom<T> {
  set(value: T): void;
}

export interface KVNamespaceBinding {
  get(key: string, type: "json"): Promise<Record<string, string> | null>;
  put(key: string, value: string): Promise<void>;
}

export interface TFunction {
  (key: string, params?: Record<string, any>): string;
  raw: <T = unknown>(key: string, fallback?: T) => T;
  array: <T = string>(key: string, fallback?: T[]) => T[];
}
