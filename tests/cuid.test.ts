import { describe, it, expect } from "vitest";
import { z } from "zod";
import { zocker } from "../src";
import { test_schema_generation } from "./utils";


const cuid_schemas = {
    "plain cuid": z.cuid(),
    "cuid2": z.cuid2(),
}


describe("CUID generation", ()=> {
    test_schema_generation(cuid_schemas);
})