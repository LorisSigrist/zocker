import { describe, expect, it } from "vitest";
import { toDFA } from "./to-dfa";

describe("toDFA", () => {
    it("works", () => {
        const dfa = toDFA(/b((c|[a-z]*)(.?)|a)/i);
    });
});