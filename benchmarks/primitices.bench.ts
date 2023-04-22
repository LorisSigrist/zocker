import { zocker } from "../src"
import { z } from "zod"
import { describe, bench } from "vitest"

const primitives = {
    "string": z.string(),
    "number": z.number(),
    "boolean": z.boolean(),
    "bigint": z.bigint(),
    "date": z.date(),
    "undefined": z.undefined(),
    "null": z.null(),
    "void": z.void(),
    "any": z.any(),
    "unknown": z.unknown(),
    "promise": z.promise(z.string()),
    "regex" : z.string().regex(/.*/),
    "cuid": z.string().cuid(),
}

describe("primitives", () => {
    for(const [name, schema] of Object.entries(primitives)) {
        const generate = zocker(schema)
        bench(name, () => {
            generate()
        })
    }
})