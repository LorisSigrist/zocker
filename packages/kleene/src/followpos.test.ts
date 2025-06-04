import { describe, it } from "vitest";
import { toDFA } from "./followpos.js";
import { parse } from "./ast.js";

describe("followpos", () => {
    it("works", () => {
        const ast = parse(/^a(bb|ba)*b$/);
        toDFA(ast);
    });
});