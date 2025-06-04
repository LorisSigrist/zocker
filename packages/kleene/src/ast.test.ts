import { describe, it, expect } from "vitest";
import { parse, stringify, AST } from "./ast";

// Note: Wildcards get parsed as the range [ -~], which includes all ASCII characters in the range 32-126

describe("AST", () => {
    describe("parse", () => {
        it("Can parse a simple regex without positional characters", () => {
            const ast = parse(/abcd/);
            console.log(JSON.stringify(ast,  (_, v) => typeof v === 'bigint' ? v.toString(2) : v, 2));
            expect(stringify(ast)).toMatchInlineSnapshot('"^([ -~])*abcd([ -~])*$"')
        })
 
        it("Can parse a simple regex with positional characters", () => {
            const ast = parse(/^abc$/);
            expect(stringify(ast)).toMatchInlineSnapshot('"^([ -~])*^abc$([ -~])*$"')
        })

        it("Can parse a simple regex with positional characters", () => {
            const ast = parse(/^a{5,}$/);
            expect(stringify(ast)).toMatchInlineSnapshot('"^([ -~])*^aaaaa(a)*$([ -~])*$"')
        })
    })
})
