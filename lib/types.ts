export type Nullable<T> = T | null;

export type Opt<T> = Nullable<T> | undefined;

export type Reference<T> = {
    ref?: T,
}
