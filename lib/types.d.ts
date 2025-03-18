type Opt<T> = T | undefined | null;

export type Pointer<T> = {
    deref?: T;
}
