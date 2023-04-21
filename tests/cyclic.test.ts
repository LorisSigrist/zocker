import { describe } from "vitest";
import { test_schema_generation } from "./utils";
import { z } from "zod";
import { zocker } from "../src";

const Person = z.object({
    name: z.string(),
    children: z.array(z.lazy(()=>Person)).max(2).default([])
})


const cyclic_schemas = {
    "Person": Person,
}

const generate = zocker(Person);
console.log(generate());

describe("Cyclic Schemas", () => {
    test_schema_generation(cyclic_schemas, 10);
});
