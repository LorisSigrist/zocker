import { describe, expect, it } from "vitest";
import { toDFA } from "./to-dfa";
import { parse } from "./ast";

describe("toDFA", () => {
    it("works", () => {
        const ast = parse(/^a(bb|ba)*b$/);
        toDFA(ast);
    });
});