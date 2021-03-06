const EventBridge = require("../../index")

const sources = [
    ["test", { a: 10, b: 12 }],
    ["test.nested", { a: 10, b: 12 }],
    ["test.wat", { a: 10, b: 12 }],
]
const expected = [
    sources[0][1],
    sources[1][1],
    sources[1][1],
    sources[2][1],
]

const valueChecker = (() => {
    let next = 0

    return (evt) => {
        const expectedObject = expected[next]
        next += 1
        if (evt.data !== expectedObject) {
            console.log("out of order at ", next)
        }
    }
})()

const bridge = EventBridge()
bridge.on("test", valueChecker)
bridge.on("test.*", valueChecker)
bridge.on("test.nested", valueChecker)

const other = EventBridge()
other.on("*", console.log)
other.pull(bridge, "node")
other.pull(bridge)

for (const [type, source] of sources) {
    bridge.emit(type, source)
}
