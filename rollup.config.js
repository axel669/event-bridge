export default {
    input: "src/event-bridge.js",
    output: [
        {
            format: "iife",
            name: "EventBridge",
            file: "dist/event-bridge.js"
        },
        {
            format: "cjs",
            file: "index.js",
            exports: "default"
        },
        {
            format: "esm",
            file: "esm/index.js"
        }
    ]
}
