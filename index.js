'use strict';

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

    const on = (type, handler) => {
        handlers[type] = [
            ...(handlers[type] ?? []),
            handler
        ];

        return () => {
            if (handlers[type] === undefined) {
                return
            }
            handlers[type] = handlers[type].filter(
                h => h !== handler
            );
        }
    };
    const once = (type, handler) => {
        let called = false;
        const wrapped = (evt) => {
            if (called) {
                return
            }
            called = true;
            unsub();
            handler(evt);
        };
        const unsub = on(type, wrapped);
    };

    const emit = async (evt) => {
        const type = evt.type;

        const paths = tracePath(type);

        for (const path of paths) {
            for (const handler of handlers[path] ?? []) {
                queueMicrotask(
                    () => handler(evt)
                );
            }
        }
    };

    const removeAll = () => {
        for (const key of Object.keys(handlers)) {
            delete handlers[key];
        }
    };

    return {
        on,
        once,
        emit,
        removeAll,
    }
};
EventBridge.tracePath = tracePath;

module.exports = EventBridge;
