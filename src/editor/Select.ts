import Editor, { EditorFactory } from "./Editor.ts";
import { guid } from "../../lib/guid.ts";
import jsml, { assert, is } from "../../lib/jsml/jsml.ts";
import { Opt } from "../../lib/types.ts";



export type SelectOption<T> = {
    label: string,
    value: T,
    selected?: boolean
}

export default class Select<T> extends Editor<T> {
    /**
     * Creates a Select from specified set of string values as { value: x, label: x }. In other words, the value is its label
     * @param options
     */
    public static enum(options: string[]): EditorFactory<string> {
        return Select.options(
            options.map(x => ({
                value: x,
                label: x,
            })),
            s => s
        );
    }

    /**
     * Creates a Select from specified options and value parser
     * @param options
     * @param parser It shall return the interpreted value from the string representation
     */
    public static options<V>(options: SelectOption<V>[], parser: (value: string) => V): EditorFactory<V> {
        return (...args) => {
            const select = new Select<V>(...args);
            select.setOptions(options);
            select.setParser(parser);
            return select;
        };
    }



    protected _select: Opt<HTMLSelectElement>;
    protected _container: Opt<HTMLElement>;
    protected _parser: Opt<(value: string) => T>;

    public setParser(parser: (value: string) => T): void {
        this._parser = parser;
    }

    private getSelect(): HTMLSelectElement {
        if (!is(this._select)) {
            const id = guid(true);
            this._select = jsml.select({
                id,
                onChange: () => {
                    if (!is(this._parser) || !is(this._select)) {
                        return;
                    }

                    this.saveValue(this._parser(this._select.value));
                }
            });

            this._container = this.container([
                jsml.label({ for: id }, this.getLabel()),
                this._select
            ]);

            this._container.classList.add("type-select");
        }

        return this._select;
    }

    public setOptions(options: SelectOption<T>[]) {
        const select = this.getSelect();
        select.textContent = '';

        for (const option of options) {
            select.append(
                new Option(option.label, String(option.value), false, option.selected ?? false)
            );
        }
    }

    public html(): HTMLElement {
        const select = this.getSelect();
        select.value = String(this.readValue());
        return assert(this._container);
    }
}