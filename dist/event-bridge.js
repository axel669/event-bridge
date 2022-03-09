var EventBridge = (function () {
    'use strict';

    //  Hand rolled loops and splice are used for performance reasons.
    //  Normally I wouldn't be concerned with the difference, but with the level
    //      this lib operates at, I want to get as much performance as possible.

    const each = (array, action) => {
        if (array === undefined) {
            return
        }
        for (let index = 0; index < array.length; index += 1) {
            action(array[index]);
        }
    };

    const tracePath = (type) => type.split(".").reduceRight(
        (list, _, index, parts) => {
            const next = [
                ...parts.slice(0, index),
                "*"
            ];
            list.push(
                next.join(".")
            );
            return list
        },
        [type]
    );

    const EventBridge = () => {
        const handlers = {};

        const addHandler = (type, handler, count) => {
            handlers[type] = handlers[type] || [];
            const entry = {
                handler,
                count,
            };
            handlers[type].push(entry);
            return entry
        };
        const removeHandler = (type, entry) => {
            if (handlers[type] === undefined) {
                return
            }
            const index = handlers[type].indexOf(entry);
            if (index === -1) {
                return
            }
            handlers[type].splice(index, 1);
        };
        const on = (type, handler) => {
            const entry = addHandler(type, handler, Number.POSITIVE_INFINITY);
            return () => removeHandler(type, entry)
        };
        const once = (type, handler) => {
            const entry = addHandler(type, handler, 1);
            return () => removeHandler(type, entry)
        };

        const emit = async (type, data) => {
            const evt = { type, data };

            const paths = tracePath(type);

            const remove = [];
            each(
                paths,
                (path) => each(
                    handlers[path],
                    (entry) => {
                        entry.count -= 1;
                        queueMicrotask(
                            () => entry.handler({
                                source: path,
                                ...evt
                            })
                        );
                        if (entry.count === 0) {
                            remove.push([path, entry]);
                        }
                    }
                )
            );
            each(
                remove,
                (info) => removeHandler(...info)
            );
        };

        const removeAll = () => {
            for (const key of Object.keys(handlers)) {
                delete handlers[key];
            }
            for (const key of Object.getOwnPropertySymbols(handlers)) {
                delete handlers[key];
            }
        };

        const pull = (source, prefix = null) => {
            const forwardPrefix = prefix ? `${prefix}.` : "";
            return source.on(
                "*",
                (evt) => emit(`${forwardPrefix}${evt.type}`, evt.data)
            )
        };
        const bind = (source, types) => {
            const handlers = types.map(
                (type) => [
                    type,
                    (evt) => emit(type, evt)
                ]
            );
            for (const pair of handlers) {
                source.addEventListener(pair[0], pair[1]);
            }
            return () => {
                for (const pair of handlers) {
                    source.removeEventListener(pair[0], pair[1]);
                }
            }
        };

        return {
            on,
            once,
            emit,
            pull,
            bind,
            removeAll,
        }
    };
    EventBridge.tracePath = tracePath;

    return EventBridge;

})();
