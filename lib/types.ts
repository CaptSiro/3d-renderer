export type Nullable<T> = T | null;

export type Opt<T> = Nullable<T> | undefined;

export type Pointer<T> = {
    deref?: T;
}
