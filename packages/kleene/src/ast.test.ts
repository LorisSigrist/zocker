import { describe, it, expect } from "vitest";
import { parse, stringify, AST } from "./ast";

describe("AST", () => {
    describe("parse", () => {
        it("Can parse a simple regex without positional characters", () => {
            const ast = parse(/abcd/);
            expect(stringify(ast)).toMatchInlineSnapshot('"^.*abcd.*$"')
        })
 
        it("Can parse a simple regex with positional characters", () => {
            const ast = parse(/^abc$/);
            expect(stringify(ast)).toMatchInlineSnapshot('"^.*^abc$.*$"')
        })

        it("Can parse a simple regex with positional characters", () => {
            const ast = parse(/^a{5,}$/);
            expect(stringify(ast)).toMatchInlineSnapshot('"^.*^aaaaaa*$.*$"')
        })
    })
})
