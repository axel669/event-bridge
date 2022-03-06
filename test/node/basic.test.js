const EventBridge = require("../../index")

const bridge = EventBridge()

bridge.on("test", evt => console.log("test", evt))
bridge.on("test.nested", evt => console.log("test.nested", evt))
bridge.on("test.*", evt => console.log("test.*", evt))

bridge.emit({ type: "test", a: 10, b: 12 })
bridge.emit({ type: "test.nested", a: 10, b: 12 })
bridge.emit({ type: "test.wat", a: 10, b: 12 })
